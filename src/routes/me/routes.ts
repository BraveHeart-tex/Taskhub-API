import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { HttpStatus } from '@/http/http-status';
import { requireAuth } from '@/lib/require-auth';
import { authenticatedUserSchema } from '@/routes/auth/schema';

const meRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/',
    {
      schema: {
        tags: ['Users'],
        summary: 'Get current user',
        description:
          'Returns the currently authenticated user.\n\n' +
          'This endpoint represents the `/users/me` resource and is used to hydrate ' +
          'user-specific identity and session state on the client.',
        response: {
          [HttpStatus.OK]: authenticatedUserSchema,
        },
      },
    },
    async (request, reply) => {
      const { user } = requireAuth(request);

      return reply.status(HttpStatus.OK).send(user);
    }
  );
};

export default meRoute;
