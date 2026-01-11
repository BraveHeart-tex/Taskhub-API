import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { HttpStatus } from '@/http/http-status';
import { requireAuth } from '@/lib/require-auth';
import {
  cardDtoSchema,
  cardRouteParamsSchema,
  cardUpdateBodySchema,
} from './schema';

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

      return reply.status(HttpStatus.NO_CONTENT).send();
    }
  );
  app.patch(
    '/',
    {
      schema: {
        params: cardRouteParamsSchema,
        body: cardUpdateBodySchema,
        response: {
          [HttpStatus.OK]: cardDtoSchema,
        },
      },
    },
    async (request, reply) => {
      const { user } = requireAuth(request);

      const updatedCard = await app.cardService.updateCard({
        currentUserId: user.id,
        boardId: request.params.boardId,
        listId: request.params.listId,
        cardId: request.params.cardId,
        title: request.body.title,
        description: request.body.description,
      });

      return reply.status(HttpStatus.OK).send(updatedCard);
    }
  );
};

export default route;
