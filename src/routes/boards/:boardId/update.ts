import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { UnauthenticatedError } from '../../../domain/auth/auth.errors';
import {
  boardSchema,
  updateBoardBodySchema,
  updateBoardParamsSchema,
} from '../schema';

const route: FastifyPluginAsyncZod = async (app) => {
  app.patch(
    '/',
    {
      schema: {
        params: updateBoardParamsSchema,
        body: updateBoardBodySchema,
        response: {
          200: boardSchema,
        },
      },
    },
    async (request, reply) => {
      if (!request.user || !request.session?.id) {
        throw new UnauthenticatedError();
      }

      const { boardId } = request.params;

      const result = await app.boardService.update(
        request.user.id,
        boardId,
        request.body
      );

      return reply.status(200).send(result);
    }
  );
};

export default route;
