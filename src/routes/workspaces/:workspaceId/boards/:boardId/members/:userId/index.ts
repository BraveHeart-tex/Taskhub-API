import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { HttpStatus } from '@/http/http-status';
import { requireAuth } from '@/lib/require-auth';
import { deleteBoardMemberParamsSchema } from './schema';

const route: FastifyPluginAsyncZod = async (app) => {
  app.delete(
    '/',
    {
      schema: {
        params: deleteBoardMemberParamsSchema,
      },
    },
    async (request, reply) => {
      const { user } = requireAuth(request);

      await app.boardMemberService.deleteBoardMember(user.id, {
        boardId: request.params.boardId,
        userId: request.params.userId,
      });

      return reply.status(HttpStatus.NO_CONTENT).send();
    },
  );
};

export default route;
