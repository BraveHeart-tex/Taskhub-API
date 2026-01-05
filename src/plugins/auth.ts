import fp from 'fastify-plugin';
import { AuthService } from '../auth/auth.service';
import { SessionRepo } from '../auth/session.repo';
import { UserRepo } from '../auth/user.repo';

export default fp(async (app) => {
  const authService = new AuthService(new UserRepo(), new SessionRepo());

  app.decorate('authService', authService);

  app.addHook('preHandler', async (request) => {
    const token = request.cookies.session_token;
    const result = await authService.validateSession(token);

    if (result) {
      request.user = result.user;
      request.session = result.session;
    }
  });
});
