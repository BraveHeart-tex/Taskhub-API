import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { UnauthenticatedError } from '../../domain/auth/auth.errors';
import { authenticatedUserSchema } from '../auth/schema';

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
      if (!req.user || !req.session?.id) {
        throw new UnauthenticatedError();
      }

      return reply.status(200).send(req.user);
    }
  );
};

export default meRoute;
