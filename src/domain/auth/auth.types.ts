import type { AuthenticatedUser } from '../authenticated-user';
import type { SessionContext } from '../session-context';

export type SessionValidationResult = {
  user: AuthenticatedUser;
  session: SessionContext;
} | null;
