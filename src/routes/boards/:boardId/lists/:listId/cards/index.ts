import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { requireAuth } from '@/lib/require-auth';
import { listRouteParamsSchema } from '../schema';
import { cardDtoSchema, createCardSchema } from './schema';

const route: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/',
    {
      schema: {
        params: listRouteParamsSchema,
        body: createCardSchema,
        response: {
          201: cardDtoSchema,
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

      return reply.status(201).send(card);
    }
  );
};

export default route;
