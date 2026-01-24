import {
  AlreadyLoggedInError,
  EmailAlreadyExistsError,
  ForbiddenError,
  InvalidCredentialsError,
  UnauthenticatedError,
  UnauthorizedError,
} from '@/domain/auth/auth.errors';
import type { DomainError } from '@/domain/domain-error';
import { HttpStatus } from '@/http/http-status';

export const authErrorMap = new Map<
  new () => DomainError,
  { status: number; message: string }
>([
  [
    InvalidCredentialsError,
    { status: HttpStatus.UNAUTHORIZED, message: 'Invalid email or password' },
  ],
  [
    EmailAlreadyExistsError,
    {
      status: HttpStatus.CONFLICT,
      message: 'An account with this email already exists',
    },
  ],
  [
    AlreadyLoggedInError,
    { status: HttpStatus.CONFLICT, message: 'User is already logged in' },
  ],
  [
    UnauthenticatedError,
    { status: HttpStatus.UNAUTHORIZED, message: 'User is not authenticated' },
  ],
  [
    UnauthorizedError,
    { status: HttpStatus.FORBIDDEN, message: 'User is not authorized' },
  ],
  [
    ForbiddenError,
    {
      status: HttpStatus.FORBIDDEN,
      message: 'User is not allowed to perform this action',
    },
  ],
]);
