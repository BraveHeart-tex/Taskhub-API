import 'fastify';
import type { Db } from '../db/client';
import type { AuthService } from '../domain/auth/auth.service';
import type { AuthenticatedUser } from '../domain/authenticated-user';
import type { SessionContext } from '../domain/session-context';

declare module 'fastify' {
  interface FastifyInstance {
    db: Db;
    auth: AuthService;
    config: {
      NODE_ENV: string;
      PORT: number;
      DATABASE_URL: string;
    };
  }
  interface FastifyRequest {
    user?: AuthenticatedUser;
    session?: SessionContext;
  }
}
