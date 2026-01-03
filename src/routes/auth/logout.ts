import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { UnauthenticatedError } from '../../domain/auth/auth.errors';

const logoutRoute: FastifyPluginAsyncZod = async (app) => {
  app.delete('/logout', {
    handler: async (req, reply) => {
      if (!req.user || !req.session?.id) {
        throw new UnauthenticatedError();
      }

      await app.authService.logout(req.session.id, req.user.id);

      reply.clearCookie('session_token');

      return reply.status(204).send();
    },
  });
};

export default logoutRoute;
