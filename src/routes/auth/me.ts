import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { requireAuth } from '../../http/guards/require-auth';
import { authenticatedUserSchema } from './schema';

const meRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/me',
    {
      schema: {
        response: {
          200: authenticatedUserSchema,
        },
      },
    },
    async (req, reply) => {
      const { user } = requireAuth(req);

      return reply.status(200).send(user);
    }
  );
};

export default meRoute;
