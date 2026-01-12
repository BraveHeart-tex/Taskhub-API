import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { SESSION_COOKIE_NAME } from '@/domain/auth/auth.constants';
import { AlreadyLoggedInError } from '@/domain/auth/auth.errors';
import { COMMON_COOKIE_SETTINGS } from '@/http/cookies';
import { HttpStatus } from '@/http/http-status';
import { apiErrorSchema } from '@/lib/shared/schemas/error';
import { authenticatedUserSchema, signUpBodySchema } from './schema';

const signUpRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/signup',
    {
      schema: {
        body: signUpBodySchema,
        response: {
          [HttpStatus.CREATED]: authenticatedUserSchema,
          [HttpStatus.CONFLICT]: apiErrorSchema,
        },
      },
    },
    async (request, reply) => {
      if (request.user?.id || request.session?.id) {
        throw new AlreadyLoggedInError();
      }

      const result = await app.authService.signup(request.body);

      reply.setCookie(
        SESSION_COOKIE_NAME,
        `${result.sessionId}.${result.sessionSecret}`,
        {
          ...COMMON_COOKIE_SETTINGS,
        }
      );

      return reply.status(HttpStatus.CREATED).send(result.user);
    }
  );
};

export default signUpRoute;
