import type { SessionRow, UserRow } from '@/db/schema';
import type { AuthenticatedUser } from '@/domain/authenticated-user';
import type { SessionContext } from '@/domain/session-context';

export function toAuthenticatedUser(user: UserRow): AuthenticatedUser {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    avatarUrl: user.avatarUrl,
  };
}

export function toSessionContext(session: SessionRow): SessionContext {
  return {
    id: session.id,
    userId: session.userId,
    expiresAt: session.expiresAt,
  };
}
