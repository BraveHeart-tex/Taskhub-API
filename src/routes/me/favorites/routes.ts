import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { HttpStatus } from '@/http/http-status';
import { requireAuth } from '@/lib/require-auth';
import { boardFavoriteParamsSchema } from './schema';

const route: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/',
    {
      schema: {
        tags: ['User Favorites'],
        summary: 'List favorited boards',
        description:
          'Returns the list of boards favorited by the authenticated user.',
      },
    },
    async (request, reply) => {
      const { user } = requireAuth(request);

      const result = await app.boardFavoriteService.listFavorites(user.id);

      return reply.send(result);
    }
  );

  app.post(
    '/:boardId',
    {
      schema: {
        tags: ['User Favorites'],
        summary: 'Favorite a board',
        description:
          'Adds a board to the authenticated user’s favorites. The operation is idempotent.',
        params: boardFavoriteParamsSchema,
      },
    },
    async (request, reply) => {
      const { user } = requireAuth(request);

      await app.boardFavoriteService.addFavorite(
        user.id,
        request.params.boardId
      );

      return reply.status(HttpStatus.NO_CONTENT).send();
    }
  );

  app.delete(
    '/:boardId',
    {
      schema: {
        tags: ['User Favorites'],
        summary: 'Remove a board from favorites',
        description:
          'Removes a board from the authenticated user’s favorites. The operation is idempotent.',
        params: boardFavoriteParamsSchema,
      },
    },
    async (request, reply) => {
      const { user } = requireAuth(request);

      await app.boardFavoriteService.removeFavorite(
        user.id,
        request.params.boardId
      );

      return reply.status(HttpStatus.NO_CONTENT).send();
    }
  );
};

export default route;
