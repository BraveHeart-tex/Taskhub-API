import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { HttpStatus } from '@/http/http-status';
import { requireAuth } from '@/lib/require-auth';
import {
  boardSchema,
  createBoardBodySchema,
  workspaceBoardPreviewResponseSchema,
} from '@/routes/boards/schema';
import { workspaceRouteParamsSchema } from '../schema';

const workspaceBoardRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/',
    {
      schema: {
        tags: ['Boards'],
        summary: 'List boards',
        description:
          'Returns all boards the authenticated user has access to within the specified workspace.\n\n' +
          'The response contains lightweight board data suitable for navigation and overview views.',
        params: workspaceRouteParamsSchema,
        response: {
          [HttpStatus.OK]: workspaceBoardPreviewResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const { user } = requireAuth(request);

      const result = await app.boardService.listBoardsForWorkspace(
        user.id,
        request.params.workspaceId
      );

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
        params: workspaceRouteParamsSchema,
        response: {
          [HttpStatus.CREATED]: boardSchema,
        },
      },
    },
    async (request, reply) => {
      const { user } = requireAuth(request);

      const result = await app.boardService.createBoard({
        createdBy: user.id,
        workspaceId: request.params.workspaceId,
        title: request.body.title,
      });

      return reply.status(HttpStatus.CREATED).send(result);
    }
  );
};

export default workspaceBoardRoutes;
