import fp from 'fastify-plugin';
import { DomainError } from '../domain/shared/domain-error';
import { isFastifyHttpError } from '../errors/is-http-error';
import { errorRegistry } from '../transport/errors/error-registry';

export default fp(async (app) => {
  app.setErrorHandler((err, request, reply) => {
    const requestId = request.id;

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

    // Truly unknown errors
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
