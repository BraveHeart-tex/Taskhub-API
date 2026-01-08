import type { AuthenticatedUser } from '../authenticated-user';
import type { SessionContext } from '../session-context';

export type SessionValidationResult = {
  user: AuthenticatedUser;
  session: SessionContext;
} | null;

export interface SignUpInput {
  email: string;
  password: string;
  fullName: string;
}
