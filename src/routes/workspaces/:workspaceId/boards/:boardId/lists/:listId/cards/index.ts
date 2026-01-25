import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { HttpStatus } from '@/http/http-status';
import { requireAuth } from '@/lib/require-auth';
import { listRouteParamsSchema } from '../schema';
import { cardDtoSchema, createCardSchema } from './schema';

const route: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/',
    {
      schema: {
        tags: ['Cards'],
        summary: 'Create card',
        description:
          'Creates a new card within a list on a board the authenticated user has access to.\n\n' +
          'The card is appended to the end of the list and returned with its initial position.',
        params: listRouteParamsSchema,
        body: createCardSchema,
        response: {
          [HttpStatus.CREATED]: cardDtoSchema,
        },
      },
    },
    async (request, reply) => {
      const { user } = requireAuth(request);

      const card = await app.cardService.createCard({
        boardId: request.params.boardId,
        currentUserId: user.id,
        description: request.body.description,
        listId: request.params.listId,
        title: request.body.title,
      });

      return reply.status(HttpStatus.CREATED).send(card);
    }
  );
};

export default route;
