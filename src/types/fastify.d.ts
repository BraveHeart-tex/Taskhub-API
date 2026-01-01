import 'fastify';
import type { Db } from '../db/client';
import type { AuthenticatedUser } from '../domain/authenticated-user';
import type { SessionContext } from '../domain/session-context';

declare module 'fastify' {
  interface FastifyInstance {
    db: Db;
    auth: {
      validateSession(
        token: string | undefined
      ): Promise<
        | {
            user: AuthenticatedUser;
            session: SessionContext;
          }
        | null
      >;
      login(
        email: string,
        password: string
      ): Promise<{
        user: AuthenticatedUser;
        sessionId: string;
        sessionSecret: string;
      }>;
      signup(
        email: string,
        password: string
      ): Promise<{
        user: AuthenticatedUser;
        sessionId: string;
        sessionSecret: string;
      }>;
    };
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
