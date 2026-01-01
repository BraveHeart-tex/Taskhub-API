import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { AlreadyLoggedInError } from '../../domain/auth/auth.errors';
import { apiErrorSchema } from '../../shared/schemas/error';
import { loginBodySchema, userSchema } from './schema';

const signUpRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/signup',
    {
      schema: {
        body: loginBodySchema,
        response: {
          201: userSchema,
          409: apiErrorSchema,
        },
      },
    },
    async (request, response) => {
      if (request.user?.id || request.session?.id) {
        throw new AlreadyLoggedInError();
      }

      const result = await app.auth.signup(
        request.body.email,
        request.body.password
      );

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

      return response.status(201).send({
        id: result.user.id,
        email: result.user.email,
        createdAt: result.user.createdAt,
      });
    }
  );
};

export default signUpRoute;
