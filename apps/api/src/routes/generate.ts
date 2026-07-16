import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { authenticate } from '../middleware/auth.js';
import { checkAndReserveQuota } from '../lib/quota.js';
import { generateQueue } from '../lib/queue.js';
import { supabaseAdmin } from '../lib/supabase.js';
import { mvpStyleTemplates } from '../seed/style-templates.js';

const generateSchema = z.object({
  originalImageUrl: z.string().url(),
  styleTemplateIds: z.array(z.string()).min(1),
});

export const generateRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('onRequest', authenticate);

  app.post('/', async (request, reply) => {
    const body = generateSchema.parse(request.body);
    const { allowed, remaining } = await checkAndReserveQuota(request.userId);

    if (!allowed) {
      return reply.status(429).send({
        error: 'quota_exceeded',
        message: 'Daily free quota exhausted. Upgrade to Pro for unlimited generations.',
        statusCode: 429,
      });
    }

    const styles = mvpStyleTemplates.filter((_, i) => body.styleTemplateIds.includes(`style-${i}`));
    const promptParts = styles.map(s => s.prompt_extension);
    const prompt = `virtual try-on, ${promptParts.join(', ')}, photorealistic, full body shot, standing pose, clean background, high quality`;

    const { data, error } = await supabaseAdmin
      .from('generation_history')
      .insert({
        user_id: request.userId,
        original_image_url: body.originalImageUrl,
        style_template_ids: body.styleTemplateIds,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      request.log.error({ err: error }, 'generate_creation_failed');
      return reply.status(500).send({ error: 'creation_failed', message: 'Failed to create generation task.', statusCode: 500 });
    }

    await generateQueue.add('generate', {
      taskId: data.id,
      userId: request.userId,
      originalImageUrl: body.originalImageUrl,
      styleTemplateIds: body.styleTemplateIds,
      prompt,
    }, { attempts: 2 });

    return reply.status(201).send({ taskId: data.id, status: 'pending', remaining });
  });

  app.get('/:taskId', async (request, reply) => {
    const { taskId } = request.params as { taskId: string };

    const { data, error } = await supabaseAdmin
      .from('generation_history')
      .select()
      .eq('id', taskId)
      .eq('user_id', request.userId)
      .single();

    if (error || !data) {
      return reply.status(404).send({ error: 'not_found', message: 'Task not found', statusCode: 404 });
    }

    return reply.send({
      taskId: data.id,
      status: data.status,
      resultImageUrl: data.result_image_url,
    });
  });

  app.get('/history', async (request, reply) => {
    const { data, error } = await supabaseAdmin
      .from('generation_history')
      .select()
      .eq('user_id', request.userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      request.log.error({ err: error }, 'history_fetch_failed');
      return reply.status(500).send({ error: 'fetch_failed', message: 'Failed to fetch history.', statusCode: 500 });
    }

    return reply.send({ data });
  });
};
