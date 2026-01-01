import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { verifyPassword } from '../../auth/password';
import {
  generateSecureRandomString,
  hashSessionSecret,
} from '../../auth/session';
import { createSessionRepo } from '../../auth/session.repo';
import { createUserRepo } from '../../auth/user.repo';
import { httpError } from '../../errors/http';
import { apiErrorSchema } from '../../shared/schemas/error';
import { loginBodySchema, userSchema } from './schema';

const loginRoute: FastifyPluginAsyncZod = async (app) => {
  const sessionRepo = createSessionRepo(app.db);
  const userRepo = createUserRepo(app.db);

  app.post(
    '/login',
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
      const existingUser = await userRepo.findByEmail(request.body.email);
      if (!existingUser) {
        httpError.conflict(
          app,
          'INVALID_CREDENTIALS',
          'Invalid email or password'
        );
      }

      const isPasswordValid = await verifyPassword(
        existingUser.passwordHash,
        request.body.password
      );
      if (!isPasswordValid) {
        httpError.conflict(
          app,
          'INVALID_CREDENTIALS',
          'Invalid email or password'
        );
      }

      const sessionId = generateSecureRandomString();
      const sessionSecret = generateSecureRandomString();
      const secretHash = Buffer.from(
        await hashSessionSecret(sessionSecret)
      ).toString('base64');

      await sessionRepo.create({
        id: sessionId,
        secretHash,
        userId: existingUser.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });

      response.setCookie('session_token', `${sessionId}.${sessionSecret}`, {
        httpOnly: true,
        secure: app.config.NODE_ENV === 'production',
        path: '/',
        sameSite: 'strict',
      });
      return response.status(201).send({
        id: existingUser.id,
        email: existingUser.email,
        createdAt: existingUser.createdAt,
      });
    }
  );
};

export default loginRoute;
