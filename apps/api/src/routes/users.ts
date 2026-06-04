import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { supabaseAdmin } from '../lib/supabase.js';
import { authenticate } from '../middleware/auth.js';

const updateSchema = z.object({
  gender: z.enum(['male', 'female', 'other']).optional(),
  age: z.number().int().min(1).max(120).optional(),
  heightCm: z.number().int().min(50).max(250).optional(),
  weightKg: z.number().int().min(10).max(300).optional(),
  preferredStyles: z.array(z.enum(['casual', 'formal', 'sport'])).min(1).optional(),
});

export const userRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('onRequest', authenticate);

  app.get('/me', async (request, reply) => {
    const uid = request.userId;

    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select()
      .eq('id', uid)
      .single();

    if (error || !data) {
      return reply.status(404).send({ error: 'not_found', message: 'Profile not found', statusCode: 404 });
    }

    return reply.send({ user: mapProfile(data) });
  });

  app.patch('/me', async (request, reply) => {
    const body = updateSchema.parse(request.body);
    const fields: Record<string, unknown> = {};

    if (body.gender !== undefined) fields.gender = body.gender;
    if (body.age !== undefined) fields.age = body.age;
    if (body.heightCm !== undefined) fields.height_cm = body.heightCm;
    if (body.weightKg !== undefined) fields.weight_kg = body.weightKg;
    if (body.preferredStyles !== undefined) fields.preferred_styles = body.preferredStyles;

    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update(fields)
      .eq('id', request.userId)
      .select()
      .single();

    if (error) {
      request.log.error({ err: error }, 'profile_update_failed');
      return reply.status(400).send({ error: 'update_failed', message: 'Failed to update profile.', statusCode: 400 });
    }

    return reply.send({ user: mapProfile(data) });
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
