import type { AuthenticatedUser } from '../authenticated-user';
import type { SessionContext } from '../session-context';

export interface AuthService {
  validateSession(token: string | undefined): Promise<{
    user: AuthenticatedUser;
    session: SessionContext;
  } | null>;

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
}
