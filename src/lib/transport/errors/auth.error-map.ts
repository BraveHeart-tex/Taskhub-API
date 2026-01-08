import {
  AlreadyLoggedInError,
  EmailAlreadyExistsError,
  InvalidCredentialsError,
  UnauthenticatedError,
  UnauthorizedError,
} from '@/domain/auth/auth.errors';
import type { DomainError } from '@/domain/domain-error';

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
  [AlreadyLoggedInError, { status: 409, message: 'User is already logged in' }],
  [UnauthenticatedError, { status: 401, message: 'User is not authenticated' }],
  [UnauthorizedError, { status: 403, message: 'User is not authorized' }],
]);
