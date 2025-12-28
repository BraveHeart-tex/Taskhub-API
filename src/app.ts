import path from 'node:path';
import autoload from '@fastify/autoload';
import Fastify from 'fastify';

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  app.register(autoload, {
    dir: path.join(__dirname, 'plugins'),
  });

  app.register(autoload, {
    dir: path.join(__dirname, 'routes'),
    options: { prefix: '/api' },
  });

  return app;
}
