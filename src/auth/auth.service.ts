import { timingSafeEqual } from 'node:crypto';
import {
  EmailAlreadyExistsError,
  InvalidCredentialsError,
} from '../domain/auth/auth.errors';
import type { AuthService } from '../domain/auth/auth.service';
import { toAuthenticatedUser, toSessionContext } from './auth.mappers';
import type { SessionValidationResult } from './auth.types';
import { hashPassword, verifyPassword } from './password';
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
): AuthService {
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
        throw new InvalidCredentialsError();
      }

      const isPasswordValid = await verifyPassword(user.passwordHash, password);
      if (!isPasswordValid) {
        throw new InvalidCredentialsError();
      }

      const sessionId = generateSecureRandomString();
      const sessionSecret = generateSecureRandomString();
      const secretHash = Buffer.from(
        await hashSessionSecret(sessionSecret)
      ).toString('base64');
      const sessionExpiresAt = getSessionExpiry(30);

      await sessionRepo.create({
        id: sessionId,
        secretHash,
        userId: user.id,
        expiresAt: sessionExpiresAt,
      });

      return {
        user: toAuthenticatedUser(user),
        sessionId,
        sessionSecret,
      };
    },
    async signup(email: string, password: string) {
      const existingUser = await userRepo.findByEmail(email);
      if (existingUser) {
        throw new EmailAlreadyExistsError();
      }

      const passwordHash = await hashPassword(password);
      const user = await userRepo.create({
        email,
        passwordHash,
      });

      const sessionId = generateSecureRandomString();
      const sessionSecret = generateSecureRandomString();
      const secretHash = Buffer.from(
        await hashSessionSecret(sessionSecret)
      ).toString('base64');

      await sessionRepo.create({
        id: sessionId,
        secretHash,
        userId: user.id,
        expiresAt: getSessionExpiry(30),
      });

      return {
        user: toAuthenticatedUser(user),
        sessionId,
        sessionSecret,
      };
    },
  };
}
