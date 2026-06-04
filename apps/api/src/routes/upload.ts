import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { supabaseAdmin } from '../lib/supabase.js';
import { authenticate } from '../middleware/auth.js';

const uploadSchema = z.object({
  base64: z.string().min(1),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
});

export const uploadRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('onRequest', authenticate);

  app.post('/', async (request, reply) => {
    const body = uploadSchema.parse(request.body);

    const buffer = Buffer.from(body.base64, 'base64');
    const filePath = `${request.userId}/${Date.now()}.jpg`;

    const { data, error } = await supabaseAdmin.storage
      .from('user-photos')
      .upload(filePath, buffer, { contentType: body.mimeType, upsert: false });

    if (error) {
      request.log.error({ err: error }, 'upload_failed');
      return reply.status(500).send({ error: 'upload_failed', message: 'Failed to upload image.', statusCode: 500 });
    }

    const { data: urlData } = supabaseAdmin.storage.from('user-photos').getPublicUrl(filePath);

    return reply.status(201).send({ url: urlData.publicUrl, path: filePath });
  });
};
