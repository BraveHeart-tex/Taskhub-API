import fp from 'fastify-plugin';
import { SessionRepo } from '../repositories/session.repo';
import { UserRepository } from '../repositories/user.repo';
import { AuthService } from '../services/auth.service';

export default fp(async (app) => {
  const authService = new AuthService(new UserRepository(), new SessionRepo());

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
