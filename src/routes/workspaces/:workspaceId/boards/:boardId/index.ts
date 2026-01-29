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
        tags: ['Boards'],
        summary: 'Get board',
        description:
          'Returns detailed information for a single board the authenticated user has access to.\n\n' +
          'The response contains board metadata required to render the board view.',
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

  app.get(
    '/content',
    {
      schema: {
        params: boardRouteParamsSchema,
      },
    },
    async (request, reply) => {
      const { user } = requireAuth(request);

      const { boardId } = request.params;

      const result = await app.boardService.getBoardContent(boardId, user.id);

      return reply.status(HttpStatus.OK).send(result);
    }
  );

  app.delete(
    '/',
    {
      schema: {
        tags: ['Boards'],
        summary: 'Delete board',
        description:
          'Permanently deletes a board the authenticated user owns.\n\n' +
          'All associated data is removed as part of this operation and cannot be recovered.',
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
        tags: ['Boards'],
        summary: 'Update board',
        description:
          'Updates mutable fields of an existing board.\n\n' +
          'Only users with sufficient permissions may perform this operation.',
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
