import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { requireAuth } from '@/lib/require-auth';
import { cardRouteParamsSchema } from './schema';

const route: FastifyPluginAsyncZod = async (app) => {
  app.delete(
    '/',
    {
      schema: {
        params: cardRouteParamsSchema,
      },
    },
    async (request, reply) => {
      const { user } = requireAuth(request);

      await app.cardService.deleteCard({
        currentUserId: user.id,
        boardId: request.params.boardId,
        listId: request.params.listId,
        cardId: request.params.cardId,
      });

      return reply.status(204).send();
    }
  );
};

export default route;
