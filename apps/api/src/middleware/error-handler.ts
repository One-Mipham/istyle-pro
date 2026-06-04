import type { FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { ZodError } from 'zod';

export function errorHandler(error: FastifyError, _request: FastifyRequest, reply: FastifyReply) {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      error: 'validation_error',
      message: error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', '),
      statusCode: 400,
    });
  }

  if (error.statusCode) {
    return reply.status(error.statusCode).send({
      error: error.code ?? 'error',
      message: error.message,
      statusCode: error.statusCode,
    });
  }

  return reply.status(500).send({
    error: 'internal_error',
    message: 'An unexpected error occurred',
    statusCode: 500,
  });
}
