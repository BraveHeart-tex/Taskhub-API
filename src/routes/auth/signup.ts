import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { apiErrorSchema } from '@/lib/shared/schemas/error';
import { AlreadyLoggedInError } from '../../domain/auth/auth.errors';
import { authenticatedUserSchema, signUpBodySchema } from './schema';

const signUpRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/signup',
    {
      schema: {
        body: signUpBodySchema,
        response: {
          201: authenticatedUserSchema,
          409: apiErrorSchema,
        },
      },
    },
    async (request, response) => {
      if (request.user?.id || request.session?.id) {
        throw new AlreadyLoggedInError();
      }

      const result = await app.authService.signup(request.body);

      response.setCookie(
        'session_token',
        `${result.sessionId}.${result.sessionSecret}`,
        {
          httpOnly: true,
          secure: app.config.NODE_ENV === 'production',
          path: '/',
          sameSite: 'strict',
        }
      );

      return response.status(201).send(result.user);
    }
  );
};

export default signUpRoute;
