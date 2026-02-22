import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { HttpStatus } from '@/http/http-status';
import { requireAuth } from '@/lib/require-auth';
import { listRouteParamsSchema, updateBoardListSchema } from './schema';

const route: FastifyPluginAsyncZod = async (app) => {
  app.patch(
    '/',
    {
      schema: {
        tags: ['Lists'],
        summary: 'Update list',
        description:
          'Updates mutable fields of an existing list within a board.\n\n' +
          'Only users with access to the board may perform this operation.',
        params: listRouteParamsSchema,
        body: updateBoardListSchema,
      },
    },
    async (request, reply) => {
      const { user } = requireAuth(request);

      await app.listService.updateList({
        boardId: request.params.boardId,
        listId: request.params.listId,
        currentUserId: user.id,
        title: request.body.title,
      });

      return reply.status(HttpStatus.NO_CONTENT).send();
    }
  );

  app.delete(
    '/',
    {
      schema: {
        tags: ['Lists'],
        summary: 'Delete list',
        description:
          'Deletes a list from a board.\n\n' +
          'The list is permanently removed along with any associated content.',
        params: listRouteParamsSchema,
      },
    },
    async (request, reply) => {
      const { user } = requireAuth(request);

      await app.listService.deleteList({
        currentUserId: user.id,
        listId: request.params.listId,
        boardId: request.params.boardId,
      });

      return reply.status(HttpStatus.NO_CONTENT).send();
    }
  );
};

export default route;
