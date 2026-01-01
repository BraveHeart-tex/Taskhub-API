import { timingSafeEqual } from 'node:crypto';
import { toAuthenticatedUser, toSessionContext } from './auth.mappers';
import type { SessionValidationResult } from './auth.types';
import { verifyPassword } from './password';
import {
  generateSecureRandomString,
  getSessionExpiry,
  hashSessionSecret,
} from './session';
import type { SessionRepo } from './session.repo';
import type { UserRepo } from './user.repo';

export function createAuthService(
  userRepo: UserRepo,
  sessionRepo: SessionRepo
) {
  return {
    async validateSession(
      token: string | undefined
    ): Promise<SessionValidationResult | null> {
      if (!token) return null;

      const [sessionId, secret] = token.split('.');

      if (!sessionId || !secret) return null;

      const session = await sessionRepo.findById(sessionId);
      if (!session) return null;

      if (session.expiresAt <= new Date()) {
        await sessionRepo.delete(session.id);
        return null;
      }

      const storedHash = Buffer.from(session.secretHash, 'base64');
      const computedHash = Buffer.from(await hashSessionSecret(secret));

      if (storedHash.length !== computedHash.length) {
        return null;
      }

      if (!timingSafeEqual(storedHash, computedHash)) {
        return null;
      }

      const user = await userRepo.findById(session.userId);
      if (!user) return null;

      const newExpiresAt = getSessionExpiry(30);
      await sessionRepo.updateExpiresAt(session.id, newExpiresAt);

      const updatedSession = { ...session, expiresAt: newExpiresAt };

      return {
        user: toAuthenticatedUser(user),
        session: toSessionContext(updatedSession),
      };
    },
    async login(email: string, password: string) {
      const user = await userRepo.findByEmail(email);
      if (!user) {
        return {
          ok: false as const,
        };
      }

      const isPasswordValid = await verifyPassword(user.passwordHash, password);
      if (!isPasswordValid) {
        return {
          ok: false as const,
        };
      }

      const sessionId = generateSecureRandomString();
      const sessionSecret = generateSecureRandomString();
      const secretHash = Buffer.from(
        await hashSessionSecret(sessionSecret)
      ).toString('base64');
      const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

      await sessionRepo.create({
        id: sessionId,
        secretHash,
        userId: user.id,
        expiresAt: sessionExpiresAt,
      });

      return {
        ok: true as const,
        user: toAuthenticatedUser(user),
        sessionId,
        sessionSecret,
      };
    },
  };
}
