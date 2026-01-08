import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { requireAuth } from '../../../../lib/require-auth';
import { boardIdPathParamsSchema } from '../schema';
import { boardMemberListDtoSchema } from './schema';

const route: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/',
    {
      schema: {
        params: boardIdPathParamsSchema,
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

      reply.status(200).send(result);
    }
  );
};

export default route;
