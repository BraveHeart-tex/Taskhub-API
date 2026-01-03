import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { UnauthenticatedError } from '../../domain/auth/auth.errors';
import { boardSchema } from './schema';

const route: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/',
    {
      schema: {
        response: {
          201: boardSchema.array(),
        },
      },
    },
    async (request, reply) => {
      if (!request.user || !request.session?.id) {
        throw new UnauthenticatedError();
      }

      const result = await app.boardService.getUserBoards(request.user.id);

      return reply.status(201).send(result);
    }
  );
};

export default route;
