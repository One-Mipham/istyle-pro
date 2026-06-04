import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { supabase, supabaseAdmin } from '../lib/supabase.js';

const PASSWORD_REGEX = /^\d{8}$/;
const PASSWORD_MESSAGE = 'Password must be 8 digits (e.g., birthdate 20001231)';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().regex(PASSWORD_REGEX, PASSWORD_MESSAGE),
  gender: z.enum(['male', 'female', 'other']),
  age: z.number().int().min(1).max(120),
  heightCm: z.number().int().min(50).max(250),
  weightKg: z.number().int().min(10).max(300),
  preferredStyles: z.array(z.enum(['casual', 'formal', 'sport'])).min(1),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const resetSchema = z.object({
  email: z.string().email(),
  newPassword: z.string().regex(PASSWORD_REGEX, PASSWORD_MESSAGE),
});

const AUTH_RATE_LIMIT = { config: { rateLimit: { max: 5, timeWindow: '1 minute' } } };

export const authRoutes: FastifyPluginAsync = async (app) => {
  app.post('/register', AUTH_RATE_LIMIT, async (request, reply) => {
    const body = registerSchema.parse(request.body);

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
    });

    if (authError) {
      request.log.error({ err: authError, email: body.email }, 'registration_failed');
      return reply.status(400).send({
        error: 'registration_failed',
        message: 'Registration failed. The email may already be in use.',
        statusCode: 400,
      });
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email: body.email,
        gender: body.gender,
        age: body.age,
        height_cm: body.heightCm,
        weight_kg: body.weightKg,
        preferred_styles: body.preferredStyles,
      })
      .select()
      .single();

    if (profileError) {
      await supabase.auth.admin.deleteUser(authData.user.id);
      request.log.error({ err: profileError, userId: authData.user.id }, 'profile_creation_failed');
      return reply.status(400).send({
        error: 'profile_creation_failed',
        message: 'Failed to create user profile.',
        statusCode: 400,
      });
    }

    const userId = authData.user.id;
    request.log.info({ event: 'user_registered', userId, email: body.email });
    return reply.status(201).send({ user: mapProfile(profile) });
  });

  app.post('/login', AUTH_RATE_LIMIT, async (request, reply) => {
    const body = loginSchema.parse(request.body);
    const ip = request.ip;

    const { data, error } = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    });

    if (error) {
      request.log.warn({ event: 'login_failed', email: body.email, ip, reason: error.message.substring(0, 100) });
      return reply.status(401).send({
        error: 'login_failed',
        message: 'Invalid email or password.',
        statusCode: 401,
      });
    }

    request.log.info({ event: 'login_success', userId: data.user.id, email: body.email, ip });
    return reply.send({
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
      user: data.user,
    });
  });

  app.post('/reset-password', AUTH_RATE_LIMIT, async (request, reply) => {
    const body = resetSchema.parse(request.body);

    const { data: users, error: lookupError } = await supabaseAdmin.auth.admin.listUsers();

    if (lookupError) {
      request.log.error({ err: lookupError }, 'user_lookup_failed');
      return reply.status(500).send({ error: 'reset_failed', message: 'Password reset failed.', statusCode: 500 });
    }

    const target = users.users.find(u => u.email === body.email);
    if (!target) {
      request.log.warn({ event: 'reset_unknown_email', email: body.email, ip: request.ip });
      // Same response as success to prevent email enumeration
      return reply.send({ message: 'If the email exists, the password has been reset.' });
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(target.id, {
      password: body.newPassword,
    });

    if (updateError) {
      request.log.error({ err: updateError, userId: target.id }, 'password_reset_failed');
      return reply.status(500).send({ error: 'reset_failed', message: 'Password reset failed.', statusCode: 500 });
    }

    request.log.info({ event: 'password_reset', userId: target.id, email: body.email, ip: request.ip });
    return reply.send({ message: 'If the email exists, the password has been reset.' });
  });
};

function mapProfile(row: Record<string, unknown>) {
  return {
    id: row.id,
    email: row.email,
    gender: row.gender,
    age: row.age,
    heightCm: row.height_cm,
    weightKg: row.weight_kg,
    preferredStyles: row.preferred_styles,
    avatarUrl: row.avatar_url,
    createdAt: row.created_at,
  };
}
