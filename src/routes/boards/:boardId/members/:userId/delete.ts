import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { requireAuth } from '../../../../../lib/require-auth';
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

      return reply.status(204).send();
    }
  );
};

export default route;
