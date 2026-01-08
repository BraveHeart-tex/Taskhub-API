import { timingSafeEqual } from 'node:crypto';
import {
  EmailAlreadyExistsError,
  InvalidCredentialsError,
} from '@/domain/auth/auth.errors';
import type {
  SessionValidationResult,
  SignUpInput,
} from '@/domain/auth/auth.types';
import { toAuthenticatedUser, toSessionContext } from '@/lib/auth';
import { hashPassword, verifyPassword } from '@/lib/password';
import {
  generateSecureRandomString,
  getSessionExpiry,
  hashSessionSecret,
} from '@/lib/session';
import type { SessionRepo } from '@/repositories/session.repo';
import type { UserRepository } from '@/repositories/user.repo';

export class AuthService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly sessionRepo: SessionRepo
  ) {}

  async validateSession(
    token: string | undefined
  ): Promise<SessionValidationResult | null> {
    if (!token) return null;

    const [sessionId, secret] = token.split('.');

    if (!sessionId || !secret) return null;

    const session = await this.sessionRepo.findById(sessionId);
    if (!session) return null;

    if (new Date(session.expiresAt) <= new Date()) {
      await this.sessionRepo.delete(session.id);
      return null;
    }

    const storedHash = Buffer.from(session.secretHash, 'base64');
    const computedHash = Buffer.from(await hashSessionSecret(secret));

    if (storedHash.length !== computedHash.length) {
      await this.sessionRepo.delete(session.id);
      return null;
    }

    if (!timingSafeEqual(storedHash, computedHash)) {
      return null;
    }

    const user = await this.userRepo.findById(session.userId);
    if (!user) return null;

    const newExpiresAt = getSessionExpiry(30);
    await this.sessionRepo.updateExpiresAt(
      session.id,
      newExpiresAt.toISOString()
    );

    const updatedSession = {
      ...session,
      expiresAt: newExpiresAt.toISOString(),
    };

    return {
      user: toAuthenticatedUser(user),
      session: toSessionContext(updatedSession),
    };
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findByEmail(email);
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

    await this.sessionRepo.create({
      id: sessionId,
      secretHash,
      userId: user.id,
      expiresAt: sessionExpiresAt.toISOString(),
    });

    return {
      user: toAuthenticatedUser(user),
      sessionId,
      sessionSecret,
    };
  }

  async signup(values: SignUpInput) {
    const existingUser = await this.userRepo.findByEmail(values.email);
    if (existingUser) {
      throw new EmailAlreadyExistsError();
    }

    const passwordHash = await hashPassword(values.password);
    const user = await this.userRepo.create({
      email: values.email,
      passwordHash,
      fullName: values.fullName,
    });

    const sessionId = generateSecureRandomString();
    const sessionSecret = generateSecureRandomString();
    const secretHash = Buffer.from(
      await hashSessionSecret(sessionSecret)
    ).toString('base64');

    await this.sessionRepo.create({
      id: sessionId,
      secretHash,
      userId: user.id,
      expiresAt: getSessionExpiry(30).toISOString(),
    });

    return {
      user: toAuthenticatedUser(user),
      sessionId,
      sessionSecret,
    };
  }

  async logout(sessionId: string, userId: string) {
    await this.sessionRepo.deleteByIdAndUserId(sessionId, userId);
  }
}
