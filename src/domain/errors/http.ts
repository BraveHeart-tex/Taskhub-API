import type { FastifyInstance } from 'fastify/types/instance';
import type { ErrorCode } from './error-codes';

function throwHttpError(
  app: FastifyInstance,
  status: number,
  code: ErrorCode,
  message: string,
  details?: unknown
): never {
  throw app.httpErrors.createError(status, {
    error: { code, message, details },
  });
}

export const httpError = {
  conflict(
    app: FastifyInstance,
    code: ErrorCode,
    message: string,
    details?: unknown
  ) {
    return throwHttpError(app, 409, code, message, details);
  },

  unauthorized(app: FastifyInstance, message = 'Unauthorized') {
    return throwHttpError(app, 401, 'UNAUTHORIZED', message);
  },

  forbidden(app: FastifyInstance, message = 'Forbidden') {
    return throwHttpError(app, 403, 'FORBIDDEN', message);
  },

  notFound(app: FastifyInstance, message = 'Not found') {
    return throwHttpError(app, 404, 'NOT_FOUND', message);
  },

  badRequest(app: FastifyInstance, message = 'Bad request') {
    return throwHttpError(app, 400, 'BAD_REQUEST', message);
  },

  internalServerError(app: FastifyInstance, message = 'Internal server error') {
    return throwHttpError(app, 500, 'INTERNAL_SERVER_ERROR', message);
  },
};
