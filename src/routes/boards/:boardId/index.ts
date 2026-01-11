import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { requireAuth } from '@/lib/require-auth';
import { boardSchema, updateBoardBodySchema } from '../schema';
import { boardRouteParamsSchema } from './schema';

const route: FastifyPluginAsyncZod = async (app) => {
  app.delete(
    '/',
    {
      schema: {
        params: boardRouteParamsSchema,
      },
    },
    async (request, reply) => {
      const { user } = requireAuth(request);

      const { boardId } = request.params;

      await app.boardService.delete(boardId, user.id);

      return reply.status(204).send();
    }
  );

  app.patch(
    '/',
    {
      schema: {
        params: boardRouteParamsSchema,
        body: updateBoardBodySchema,
        response: {
          200: boardSchema,
        },
      },
    },
    async (request, reply) => {
      const { user } = requireAuth(request);

      const { boardId } = request.params;

      const result = await app.boardService.update(
        user.id,
        boardId,
        request.body
      );

      return reply.status(200).send(result);
    }
  );
};

export default route;
