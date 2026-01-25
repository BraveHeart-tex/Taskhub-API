import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { HttpStatus } from '@/http/http-status';
import { requireAuth } from '@/lib/require-auth';
import { listRouteParamsSchema, moveListSchema } from './schema';

const route: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/',
    {
      schema: {
        params: listRouteParamsSchema,
        body: moveListSchema,
      },
    },
    async (request, reply) => {
      const { user } = requireAuth(request);

      await app.listService.moveList({
        currentUserId: user.id,
        boardId: request.params.boardId,
        listId: request.params.listId,
        afterListId: request.body.afterListId,
        beforeListId: request.body.beforeListId,
      });

      return reply.status(HttpStatus.NO_CONTENT).send();
    }
  );
};

export default route;
