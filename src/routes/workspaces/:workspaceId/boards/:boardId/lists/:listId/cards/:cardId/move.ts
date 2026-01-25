import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { HttpStatus } from '@/http/http-status';
import { requireAuth } from '@/lib/require-auth';
import { cardDtoSchema } from '../schema';
import { moveCardBodySchema, moveCardParamsSchema } from './schema';

const route: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/move',
    {
      schema: {
        params: moveCardParamsSchema,
        body: moveCardBodySchema,
        response: {
          [HttpStatus.OK]: cardDtoSchema,
        },
      },
    },
    async (request, reply) => {
      const { user } = requireAuth(request);

      const updatedCard = await app.cardService.moveCard({
        currentUserId: user.id,
        boardId: request.params.boardId,
        cardId: request.params.cardId,
        targetListId: request.body.targetListId,
        beforeCardId: request.body.beforeCardId,
        afterCardId: request.body.afterCardId,
      });

      return reply.status(HttpStatus.OK).send(updatedCard);
    }
  );
};

export default route;
