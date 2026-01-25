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
