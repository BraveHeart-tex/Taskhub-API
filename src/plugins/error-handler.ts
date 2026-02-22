import fp from 'fastify-plugin';
import { DomainError } from '@/domain/domain-error';
import { isFastifyValidationError } from '@/http/fastify-validation-error';
import { HttpStatus } from '@/http/http-status';
import { errorRegistry } from '@/lib/transport/errors/error-registry';

const isProd = process.env.NODE_ENV === 'production';

export default fp(async (app) => {
  app.setErrorHandler((err, request, reply) => {
    request.log.error(err);

    const requestId = request.id;

    if (isFastifyValidationError(err)) {
      return reply.status(HttpStatus.BAD_REQUEST).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          requestId,
          details: err.validation?.map((issue) => ({
            path: `${err.validationContext}${issue.instancePath || ''}`,
            message: issue.message,
          })),
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

    const status = (err as any)?.statusCode ?? HttpStatus.INTERNAL_SERVER_ERROR;
    const message = isProd ? 'Internal server error' : (err as any).message;

    return reply.status(status).send({
      error: {
        code: 'INTERNAL_ERROR',
        message,
        requestId,
      },
    });
  });
});
