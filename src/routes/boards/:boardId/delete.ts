import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { requireAuth } from '../../../http/guards/require-auth';
import { boardIdParamsSchema } from './schema';

const route: FastifyPluginAsyncZod = async (app) => {
  app.delete(
    '/',
    {
      schema: {
        params: boardIdParamsSchema,
      },
    },
    async (request, reply) => {
      const { user } = requireAuth(request);

      const { boardId } = request.params;

      await app.boardService.delete(boardId, user.id);

      return reply.status(204).send();
    }
  );
};

export default route;
