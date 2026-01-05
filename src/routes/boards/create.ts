import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { requireAuth } from '../../http/guards/require-auth';
import { boardSchema, createBoardBodySchema } from './schema';

const route: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/',
    {
      schema: {
        body: createBoardBodySchema,
        response: {
          201: boardSchema,
        },
      },
    },
    async (request, reply) => {
      const { user } = requireAuth(request);

      const result = await app.boardService.create({
        createdBy: user.id,
        workspaceId: request.body.workspaceId,
        title: request.body.title,
      });

      return reply.status(201).send(result);
    }
  );
};

export default route;
