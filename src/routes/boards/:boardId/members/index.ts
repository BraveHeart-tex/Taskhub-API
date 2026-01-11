import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
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
          200: boardMemberListDtoSchema,
        },
      },
    },
    async (request, reply) => {
      const { user } = requireAuth(request);

      const result = await app.boardMemberService.getBoardMembers(
        request.params.boardId,
        user.id
      );

      return reply.status(200).send(result);
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

      return reply.status(204).send();
    }
  );
};

export default route;
