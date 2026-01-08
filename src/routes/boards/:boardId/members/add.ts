import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { requireAuth } from '../../../../lib/require-auth';
import { boardIdPathParamsSchema } from '../schema';
import { boardMemberCreateDtoSchema } from './schema';

const route: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/',
    {
      schema: {
        params: boardIdPathParamsSchema,
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
