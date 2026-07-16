import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { PRICING, REFUND_WINDOW_DAYS, DAILY_FREE_QUOTA } from '@istyle/shared';
import type { PlanTier } from '@istyle/shared';

// Tencent Cloud WeChat Pay Native — 微信支付 Native
// https://pay.weixin.qq.com/docs/merchant/products/native-payment/introduction.html

const createOrderSchema = z.object({
  plan: z.enum(['pro_monthly', 'pro_yearly', 'lifetime']),
});

interface WechatPayOrder {
  out_trade_no: string;
  plan: PlanTier;
  amount: number;
  userId: string;
}

// In-memory store for pending orders (replace with Redis/DB in production)
const pendingOrders = new Map<string, WechatPayOrder>();

export const paymentRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('onRequest', authenticate);

  // POST /api/payment/create-order — create WeChat Pay order, return QR code URL
  app.post('/create-order', async (request, reply) => {
    const body = createOrderSchema.parse(request.body);
    const plan = body.plan;
    const pricing = PRICING[plan];

    const outTradeNo = `ISTYLE-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // TODO: Replace with actual WeChat Pay API call (JSAPI/Native)
    // const wechatRes = await fetch('https://api.mch.weixin.qq.com/v3/pay/transactions/native', { ... });
    // For now, generate a simulated order

    pendingOrders.set(outTradeNo, {
      out_trade_no: outTradeNo,
      plan,
      amount: pricing.amount,
      userId: request.userId,
    });

    // In production, the WeChat Pay API returns a code_url (QR code link)
    // which the frontend renders as a QR code for the user to scan
    const codeUrl = `weixin://wxpay/bizpayurl?pr=${outTradeNo}`;

    return reply.send({
      outTradeNo,
      amount: pricing.amount,
      currency: pricing.currency,
      plan: pricing.label,
      codeUrl,
      // QR display URL for web (third-party QR service or self-hosted)
      qrUrl: `https://api.istyle.app/api/payment/qr/${outTradeNo}`,
    });
  });

  // GET /api/payment/qr/:outTradeNo — QR code image for WeChat Pay
  app.get('/qr/:outTradeNo', async (request, reply) => {
    const { outTradeNo } = request.params as { outTradeNo: string };
    const order = pendingOrders.get(outTradeNo);

    if (!order) {
      return reply.status(404).send({ error: 'not_found', message: 'Order not found', statusCode: 404 });
    }

    // TODO: Generate real QR code image using qrcode library
    // For now, return a redirect to WeChat Pay
    return reply.redirect(`https://wx.tenpay.com/f2f?trade_no=${outTradeNo}`);
  });

  // POST /api/payment/notify — WeChat Pay payment callback (no auth — called by WeChat)
  app.post('/notify', async (request, reply) => {
    // TODO: Verify WeChat Pay signature from headers
    // const signature = request.headers['wechatpay-signature'];
    // Verify with WeChat Pay public key

    const body = request.body as Record<string, unknown>;
    const outTradeNo = body.out_trade_no as string;
    const transactionId = body.transaction_id as string;

    const order = pendingOrders.get(outTradeNo);
    if (!order) {
      return reply.status(404).send({ code: 'FAIL', message: 'Order not found' });
    }

    // Activate subscription
    let expiresAt: string | null = null;
    if (order.plan === 'pro_monthly') {
      const d = new Date();
      d.setMonth(d.getMonth() + 1);
      expiresAt = d.toISOString();
    } else if (order.plan === 'pro_yearly') {
      const d = new Date();
      d.setFullYear(d.getFullYear() + 1);
      expiresAt = d.toISOString();
    }
    // lifetime: expiresAt stays null

    // Upsert subscription
    const { data: existing } = await supabaseAdmin
      .from('subscriptions')
      .select('id')
      .eq('user_id', order.userId)
      .maybeSingle();

    if (existing) {
      await supabaseAdmin
        .from('subscriptions')
        .update({
          plan: order.plan,
          status: 'active',
          daily_remaining: -1,
          expires_at: expiresAt,
        })
        .eq('user_id', order.userId);
    } else {
      await supabaseAdmin
        .from('subscriptions')
        .insert({
          user_id: order.userId,
          plan: order.plan,
          status: 'active',
          daily_remaining: -1,
          expires_at: expiresAt,
        });
    }

    pendingOrders.delete(outTradeNo);

    // WeChat Pay expects this exact response
    return reply.send({ code: 'SUCCESS', message: 'OK' });
  });

  // GET /api/payment/status/:outTradeNo — check payment status
  app.get('/status/:outTradeNo', async (request, reply) => {
    const { outTradeNo } = request.params as { outTradeNo: string };
    const order = pendingOrders.get(outTradeNo);

    if (!order) {
      // Order already processed (payment confirmed)
      return reply.send({ status: 'completed' });
    }

    return reply.send({ status: 'pending', amount: order.amount, plan: order.plan });
  });

  // POST /api/payment/refund — request refund within 7-day window
  app.post('/refund', async (request, reply) => {
    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('plan, status, started_at, expires_at')
      .eq('user_id', request.userId)
      .eq('status', 'active')
      .maybeSingle();

    if (!sub) {
      return reply.status(404).send({ error: 'not_found', message: 'No active subscription', statusCode: 404 });
    }

    if (sub.plan === 'free') {
      return reply.status(400).send({ error: 'invalid_plan', message: 'Free plan cannot be refunded', statusCode: 400 });
    }

    const startedAt = new Date(sub.started_at);
    const daysSinceStart = (Date.now() - startedAt.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceStart > REFUND_WINDOW_DAYS) {
      return reply.status(400).send({
        error: 'refund_window_closed',
        message: `Refund window is ${REFUND_WINDOW_DAYS} days from purchase. ${Math.floor(daysSinceStart)} days have passed.`,
        statusCode: 400,
      });
    }

    // Process refund
    await supabaseAdmin
      .from('subscriptions')
      .update({ status: 'cancelled', plan: 'free', daily_remaining: DAILY_FREE_QUOTA })
      .eq('user_id', request.userId);

    request.log.info({ event: 'refund_processed', userId: request.userId, plan: sub.plan, daysSinceStart });

    return reply.send({ message: 'Refund processed. Subscription cancelled.' });
  });
};
