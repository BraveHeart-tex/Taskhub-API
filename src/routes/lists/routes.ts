import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { HttpStatus } from '@/http/http-status';
import { requireAuth } from '@/lib/require-auth';
import { boardRouteParamsSchema } from '../boards/:boardId/schema';
import { createListBodySchema, listSchema } from './schema';

const listRoutes: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/',
    {
      schema: {
        tags: ['Lists'],
        summary: 'Create list',
        description:
          'Creates a new list within a board the authenticated user has access to.\n\n' +
          'The list is appended to the end of the board and returned with its initial position.',
        params: boardRouteParamsSchema,
        body: createListBodySchema,
        response: {
          [HttpStatus.CREATED]: listSchema,
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

      return reply.status(HttpStatus.CREATED).send(result);
    }
  );
};

export default listRoutes;
