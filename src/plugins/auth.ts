import fp from 'fastify-plugin';
import { SESSION_COOKIE_NAME } from '@/domain/auth/auth.constants';
import { SessionRepository } from '@/repositories/session.repo';
import { UserRepository } from '@/repositories/user.repo';
import { AuthService } from '@/services/auth.service';

export default fp(async (app) => {
  const authService = new AuthService(
    new UserRepository(),
    new SessionRepository()
  );

  app.decorate('authService', authService);

  app.addHook('preHandler', async (request) => {
    const token = request.cookies[SESSION_COOKIE_NAME];
    if (!token) {
      return;
    }

    const result = await authService.validateSession(token);
    if (result) {
      request.user = result.user;
      request.session = result.session;
    }
  });
});
