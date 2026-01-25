import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { HttpStatus } from '@/http/http-status';
import { requireAuth } from '@/lib/require-auth';
import { boardSchema, createBoardBodySchema } from './schema';

const route: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/',
    {
      schema: {
        tags: ['Boards'],
        summary: 'List boards',
        description:
          'Returns all boards the authenticated user has access to within the specified workspace.\n\n' +
          'The response contains lightweight board data suitable for navigation and overview views.',
        response: {
          [HttpStatus.OK]: boardSchema.array(),
        },
      },
    },
    async (request, reply) => {
      const { user } = requireAuth(request);

      const result = await app.boardService.getUserBoards(user.id);

      return reply.status(HttpStatus.OK).send(result);
    }
  );

  app.post(
    '/',
    {
      schema: {
        tags: ['Boards'],
        summary: 'Create board',
        description:
          'Creates a new board within the specified workspace.\n\n' +
          'The authenticated user is assigned as the board owner.',
        body: createBoardBodySchema,
        response: {
          [HttpStatus.CREATED]: boardSchema,
        },
      },
    },
    async (request, reply) => {
      const { user } = requireAuth(request);

      const result = await app.boardService.createBoard({
        createdBy: user.id,
        workspaceId: request.body.workspaceId,
        title: request.body.title,
      });

      return reply.status(HttpStatus.CREATED).send(result);
    }
  );
};

export default route;
