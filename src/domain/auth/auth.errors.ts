import { DomainError } from '../domain-error';

export class InvalidCredentialsError extends DomainError {
  readonly code = 'INVALID_CREDENTIALS';

  constructor() {
    super('Invalid email or password');
    this.name = 'InvalidCredentialsError';
  }
}

export class EmailAlreadyExistsError extends DomainError {
  readonly code = 'EMAIL_ALREADY_EXISTS';

  constructor() {
    super('An account with this email already exists.');
    this.name = 'EmailAlreadyExistsError';
  }
}

export class AlreadyLoggedInError extends DomainError {
  readonly code = 'ALREADY_LOGGED_IN';

  constructor() {
    super('User is already logged in');
    this.name = 'AlreadyLoggedInError';
  }
}

export class UnauthenticatedError extends DomainError {
  readonly code = 'UNAUTHENTICATED';

  constructor() {
    super('Authentication required');
    this.name = 'UnauthenticatedError';
  }
}

export class UnauthorizedError extends DomainError {
  readonly code = 'UNAUTHORIZED';

  constructor() {
    super('You are not authorized to perform this action');
    this.name = 'UnauthorizedError';
  }
}
