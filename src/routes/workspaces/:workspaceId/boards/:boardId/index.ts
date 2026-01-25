import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { HttpStatus } from '@/http/http-status';
import { requireAuth } from '@/lib/require-auth';
import { boardSchema, updateBoardBodySchema } from '../schema';
import { boardRouteParamsSchema } from './schema';

const route: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/',
    {
      schema: {
        params: boardRouteParamsSchema,
      },
    },
    async (request, reply) => {
      const { user } = requireAuth(request);

      const { boardId } = request.params;

      const result = await app.boardService.getBoardDetails(boardId, user.id);

      return reply.status(HttpStatus.OK).send(result);
    }
  );

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

      await app.boardService.deleteBoard(boardId, user.id);

      return reply.status(HttpStatus.NO_CONTENT).send();
    }
  );

  app.patch(
    '/',
    {
      schema: {
        params: boardRouteParamsSchema,
        body: updateBoardBodySchema,
        response: {
          [HttpStatus.OK]: boardSchema,
        },
      },
    },
    async (request, reply) => {
      const { user } = requireAuth(request);

      const { boardId } = request.params;

      const result = await app.boardService.updateBoard(
        user.id,
        boardId,
        request.body
      );

      return reply.status(HttpStatus.OK).send(result);
    }
  );
};

export default route;
