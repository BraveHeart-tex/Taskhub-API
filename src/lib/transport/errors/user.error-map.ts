import type { DomainError } from '@/domain/domain-error';
import { UserNotFoundError } from '@/domain/user/user.errors';

export const userErrorMap = new Map<
  new () => DomainError,
  { status: number; message: string }
>([[UserNotFoundError, { status: 404, message: 'User not found' }]]);
