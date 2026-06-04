import type { FastifyPluginAsync } from 'fastify';
import { mvpStyleTemplates } from '../seed/style-templates.js';

export const styleRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async (_request, reply) => {
    return reply.send({ styles: mvpStyleTemplates.map((t, i) => ({ id: `style-${i}`, ...t, isActive: true })) });
  });
};
