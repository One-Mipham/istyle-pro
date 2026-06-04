import type { FastifyRequest, FastifyReply } from 'fastify';
import { config } from '../config.js';

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
  const header = request.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return reply.status(401).send({ error: 'unauthorized', message: 'Missing token', statusCode: 401 });
  }

  const token = header.slice(7);

  const res = await fetch(`${config.SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: config.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    return reply.status(401).send({ error: 'unauthorized', message: 'Invalid token', statusCode: 401 });
  }

  const { id } = await res.json() as { id: string };
  request.userId = id;
}
