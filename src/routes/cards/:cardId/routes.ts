import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { HttpStatus } from '@/http/http-status';
import { requireAuth } from '@/lib/require-auth';
import { cardDtoSchema } from '../schema';
import { cardRouteParamsSchema, cardUpdateBodySchema } from './schema';

const route: FastifyPluginAsyncZod = async (app) => {
  app.delete(
    '/',
    {
      schema: {
        tags: ['Cards'],
        summary: 'Delete card',
        description:
          'Deletes a card from a list.\n\n' +
          'The card is permanently removed from the board.',
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
        tags: ['Cards'],
        summary: 'Update card',
        description:
          'Updates mutable fields of an existing card.\n\n' +
          'Only users with access to the board may perform this operation.',
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
