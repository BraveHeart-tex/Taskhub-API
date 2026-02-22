import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { SESSION_COOKIE_NAME } from '@/domain/auth/auth.constants';
import { AlreadyLoggedInError } from '@/domain/auth/auth.errors';
import { COMMON_COOKIE_SETTINGS } from '@/http/cookies';
import { HttpStatus } from '@/http/http-status';
import { requireAuth } from '@/lib/require-auth';
import { apiErrorSchema } from '@/lib/shared/schemas/error';
import {
  authenticatedUserSchema,
  loginBodySchema,
  signUpBodySchema,
} from './schema';

const authRoutes: FastifyPluginAsyncZod = async (app) => {
  // LOGIN
  app.post(
    '/login',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Log in',
        description:
          'Authenticates a user using email and password and creates a new session.\n\n' +
          'On successful authentication, a session cookie is set on the response.\n\n' +
          'If the user is already authenticated, the request is rejected.\n\n' +
          'The returned payload contains basic user information for immediate client hydration.',
        body: loginBodySchema,
        response: {
          [HttpStatus.CREATED]: authenticatedUserSchema,
          [HttpStatus.BAD_REQUEST]: apiErrorSchema,
          [HttpStatus.CONFLICT]: apiErrorSchema,
        },
      },
    },
    async (request, reply) => {
      if (request.user?.id || request.session?.id) {
        throw new AlreadyLoggedInError();
      }

      const result = await app.authService.login(
        request.body.email,
        request.body.password
      );

      reply.setCookie(
        SESSION_COOKIE_NAME,
        `${result.sessionId}.${result.sessionSecret}`,
        {
          ...COMMON_COOKIE_SETTINGS,
        }
      );

      return reply.status(HttpStatus.CREATED).send({
        id: result.user.id,
        email: result.user.email,
        fullName: result.user.fullName,
        createdAt: result.user.createdAt,
      });
    }
  );

  // SIGNUP
  app.post(
    '/signup',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Sign up',
        description:
          'Creates a new user account and authenticates the user in a single operation.\n\n' +
          'On successful signup, a new session is created and a session cookie is set on the response.\n\n' +
          'If a user is already authenticated, the request is rejected.',
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

  // LOGOUT
  app.delete(
    '/logout',
    {
      schema: {
        tags: ['Auth'],
        summary: 'Log out',
        description:
          'Terminates the current authenticated session and clears the session cookie. ' +
          'The operation is idempotent and succeeds even if the session has already been invalidated.',
      },
    },
    async (request, reply) => {
      const { user, session } = requireAuth(request);

      await app.authService.logout(session.id, user.id);

      reply.clearCookie(SESSION_COOKIE_NAME);

      return reply.status(HttpStatus.NO_CONTENT).send();
    }
  );
};

export default authRoutes;
