import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { HttpStatus } from '@/http/http-status';
import { requireAuth } from '@/lib/require-auth';
import { boardRouteParamsSchema } from '../schema';
import { boardMemberCreateDtoSchema, boardMemberListDtoSchema } from './schema';

const route: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/',
    {
      schema: {
        tags: ['Boards'],
        summary: 'List board members',
        description:
          'Returns all members of a board the authenticated user has access to.\n\n' +
          'Each member entry represents a user with access to the board.',
        params: boardRouteParamsSchema,
        response: {
          [HttpStatus.OK]: boardMemberListDtoSchema,
        },
      },
    },
    async (request, reply) => {
      const { user } = requireAuth(request);

      const result = await app.boardMemberService.getBoardMembers(
        request.params.boardId,
        user.id
      );

      return reply.status(HttpStatus.OK).send(result);
    }
  );

  app.post(
    '/',
    {
      schema: {
        tags: ['Boards'],
        summary: 'Add board member',
        description:
          'Grants a user access to a board.\n\n' +
          'Only the board owner may add new members.',
        params: boardRouteParamsSchema,
        body: boardMemberCreateDtoSchema,
      },
    },
    async (request, reply) => {
      const { user } = requireAuth(request);

      await app.boardMemberService.addMember(user.id, {
        boardId: request.params.boardId,
        userId: request.body.userId,
      });

      return reply.status(HttpStatus.NO_CONTENT).send();
    }
  );
};

export default route;
