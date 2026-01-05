import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { AlreadyLoggedInError } from '../../domain/auth/auth.errors';
import { apiErrorSchema } from '../../shared/schemas/error';
import { authenticatedUserSchema, loginBodySchema } from './schema';

const loginRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/login',
    {
      schema: {
        body: loginBodySchema,
        response: {
          201: authenticatedUserSchema,
          400: apiErrorSchema,
          409: apiErrorSchema,
        },
      },
    },
    async (request, response) => {
      if (request.user?.id || request.session?.id) {
        throw new AlreadyLoggedInError();
      }

      const result = await app.authService.login(
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
        fullName: result.user.fullName,
        createdAt: result.user.createdAt,
      });
    }
  );
};

export default loginRoute;
