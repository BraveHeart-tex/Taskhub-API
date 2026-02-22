import path from 'node:path';
import autoload from '@fastify/autoload';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';
import Fastify from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';
import { logger } from '@/logger';
import dbPlugin from '@/plugins/db';
import dbTransactionPlugin from '@/plugins/db-context';
import envPlugin from '@/plugins/env';
import errorHandlerPlugin from '@/plugins/error-handler';
import swaggerPlugin from '@/plugins/swagger';

export function buildApp() {
  const app = Fastify({
    loggerInstance: logger,
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  app.register(cors, {
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    origin: ['http://localhost:5173'],
  });
  app.register(sensible);
  app.register(envPlugin);
  app.register(dbPlugin);
  app.register(dbTransactionPlugin);
  app.register(swaggerPlugin);
  app.register(errorHandlerPlugin);
  app.register(cookie);

  app.register(autoload, {
    dir: path.join(__dirname, 'plugins'),
    ignorePattern: /(env|swagger|error-handler|db)\.(ts|js)$/,
  });

  app.register(autoload, {
    dir: path.join(__dirname, 'routes'),
    options: { prefix: '/api' },
    ignoreFilter: (file) => file.endsWith('schema.ts'),
  });

  return app;
}
