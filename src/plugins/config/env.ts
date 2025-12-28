import path from 'node:path';
import fastifyEnv from '@fastify/env';
import fp from 'fastify-plugin';

export default fp(async (app) => {
  app.register(fastifyEnv, {
    dotenv: {
      path: path.join(process.cwd(), '.env'),
    },
    schema: {
      type: 'object',
      required: ['NODE_ENV'],
      properties: {
        NODE_ENV: { type: 'string' },
        PORT: { type: 'number', default: 3000 },
      },
    },
  });
});
