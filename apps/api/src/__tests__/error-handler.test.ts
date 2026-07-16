import { describe, it, expect, vi } from 'vitest';
import { ZodError, z } from 'zod';
import { errorHandler } from '../middleware/error-handler';

function mockReply(statusCode?: number) {
  const reply: Record<string, unknown> = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn().mockReturnThis(),
  };
  if (statusCode !== undefined) {
    reply.statusCode = statusCode;
  }
  return reply;
}

describe('errorHandler', () => {
  it('returns 400 with validation_error for ZodError', () => {
    const reply = mockReply();
    const zodError = new ZodError([
      { code: 'invalid_type', expected: 'string', received: 'number', path: ['email'], message: 'Expected string, received number' },
    ]);

    errorHandler(zodError as unknown as Parameters<typeof errorHandler>[0], {} as never, reply as never);

    expect(reply.status).toHaveBeenCalledWith(400);
    expect(reply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'validation_error',
        statusCode: 400,
        message: expect.stringContaining('email'),
      }),
    );
  });

  it('returns the error statusCode from Fastify errors', () => {
    const reply = mockReply(413);
    const fastifyError = {
      statusCode: 413,
      code: 'FST_ERR_CTP_BODY_TOO_LARGE',
      message: 'Request body is too large',
      name: 'FastifyError',
    };

    errorHandler(fastifyError as unknown as Parameters<typeof errorHandler>[0], {} as never, reply as never);

    expect(reply.status).toHaveBeenCalledWith(413);
    expect(reply.send).toHaveBeenCalledWith(
      expect.objectContaining({
        error: 'FST_ERR_CTP_BODY_TOO_LARGE',
        statusCode: 413,
      }),
    );
  });

  it('returns 500 for unknown errors without statusCode', () => {
    const reply = mockReply();
    const unknownError = new Error('Something broke');

    errorHandler(unknownError as unknown as Parameters<typeof errorHandler>[0], {} as never, reply as never);

    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({
      error: 'internal_error',
      message: 'An unexpected error occurred',
      statusCode: 500,
    });
  });

  it('returns 500 for errors without a message property', () => {
    const reply = mockReply();

    errorHandler({} as Parameters<typeof errorHandler>[0], {} as never, reply as never);

    expect(reply.status).toHaveBeenCalledWith(500);
    expect(reply.send).toHaveBeenCalledWith({
      error: 'internal_error',
      message: 'An unexpected error occurred',
      statusCode: 500,
    });
  });
});
