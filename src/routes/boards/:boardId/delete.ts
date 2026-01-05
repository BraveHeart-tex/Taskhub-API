import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { UnauthenticatedError } from '../../../domain/auth/auth.errors';
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
      // TODO: Make this a helper
      if (!request.user || !request.session?.id) {
        throw new UnauthenticatedError();
      }

      const { boardId } = request.params;

      await app.boardService.delete(boardId, request.user.id);

      return reply.status(204).send();
    }
  );
};

export default route;
