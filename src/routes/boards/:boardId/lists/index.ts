import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { requireAuth } from '@/lib/require-auth';
import { boardRouteParamsSchema } from '../schema';
import { createListBodySchema, listSchema } from './schema';

const route: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/',
    {
      schema: {
        params: boardRouteParamsSchema,
        body: createListBodySchema,
        response: {
          201: listSchema,
        },
      },
    },
    async (request, reply) => {
      const { user } = requireAuth(request);

      const result = await app.listService.createList({
        currentUserId: user.id,
        boardId: request.params.boardId,
        title: request.body.title,
      });

      return reply.status(201).send(result);
    }
  );
};

export default route;
