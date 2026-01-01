import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { createAuthService } from '../../auth/auth.service';
import { createSessionRepo } from '../../auth/session.repo';
import { createUserRepo } from '../../auth/user.repo';
import { httpError } from '../../errors/http';
import { apiErrorSchema } from '../../shared/schemas/error';
import { loginBodySchema, userSchema } from './schema';

const signUpRoute: FastifyPluginAsyncZod = async (app) => {
  const authService = createAuthService(
    createUserRepo(app.db),
    createSessionRepo(app.db)
  );

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
        httpError.conflict(
          app,
          'ALREADY_LOGGED_IN',
          'User is already logged in'
        );
      }

      const result = await authService.signup(
        request.body.email,
        request.body.password
      );

      if (!result.ok) {
        if (result.error === 'EMAIL_ALREADY_EXISTS') {
          httpError.conflict(
            app,
            'EMAIL_ALREADY_EXISTS',
            'An account with this email already exists.'
          );
        }

        httpError.internalServerError(app, 'An unexpected error occurred.');
        return;
      }

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
