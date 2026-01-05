import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { requireAuth } from '../../../http/guards/require-auth';
import { deleteBoardParamsSchema } from '../schema';

const route: FastifyPluginAsyncZod = async (app) => {
  app.delete(
    '/',
    {
      schema: {
        // TODO: Check if we needs this on every /boardId route or once?
        params: deleteBoardParamsSchema,
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
