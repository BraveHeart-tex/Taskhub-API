import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { requireAuth } from '../../lib/require-auth';

const logoutRoute: FastifyPluginAsyncZod = async (app) => {
  app.delete('/logout', {
    handler: async (req, reply) => {
      const { user, session } = requireAuth(req);

      await app.authService.logout(session.id, user.id);

      reply.clearCookie('session_token');

      return reply.status(204).send();
    },
  });
};

export default logoutRoute;
