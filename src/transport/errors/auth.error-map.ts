import type { DomainError } from '../../domain/shared/domain-error';
import {
  AlreadyLoggedInError,
  EmailAlreadyExistsError,
  InvalidCredentialsError,
} from '../../domain/auth/auth.errors';

export const authErrorMap = new Map<
  new () => DomainError,
  { status: number; message: string }
>([
  [
    InvalidCredentialsError,
    { status: 400, message: 'Invalid email or password' },
  ],
  [
    EmailAlreadyExistsError,
    { status: 409, message: 'An account with this email already exists' },
  ],
  [
    AlreadyLoggedInError,
    { status: 409, message: 'User is already logged in' },
  ],
]);

