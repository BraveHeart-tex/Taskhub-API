import type { DomainError } from '../../domain/shared/domain-error';
import { authErrorMap } from './auth.error-map';

export const errorRegistry = new Map<
  new () => DomainError,
  { status: number; message: string }
>([
  ...authErrorMap,
  // Future domain error maps go here:
  // ...userErrorMap,
  // ...taskErrorMap,
]);
