import fp from 'fastify-plugin';
import { isFastifyHttpError } from '@/domain/errors/is-http-error';
import { errorRegistry } from '@/lib/transport/errors/error-registry';
import { DomainError } from '../domain/domain-error';

export default fp(async (app) => {
  app.setErrorHandler((err, request, reply) => {
    const requestId = request.id;

    if (app.config.NODE_ENV === 'development') {
      request.log.error(err);
    }

    if (isFastifyHttpError(err)) {
      return reply.status(err.statusCode).send({
        error: {
          ...err.error,
          requestId,
        },
      });
    }

    if (err instanceof DomainError) {
      const mapping = errorRegistry.get(
        err.constructor as new () => DomainError
      );

      if (mapping) {
        return reply.status(mapping.status).send({
          error: {
            code: err.code,
            message: mapping.message,
            requestId,
          },
        });
      }
    }

    request.log.error(err);

    return reply.status(500).send({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        requestId,
      },
    });
  });
});
