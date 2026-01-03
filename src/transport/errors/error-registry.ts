import type { DomainError } from '../../domain/shared/domain-error';
import { authErrorMap } from './auth.error-map';
import { boardErrorMap } from './board.error-map';
import { workspaceErrorMap } from './workspace.error-map';

export const errorRegistry = new Map<
  new () => DomainError,
  { status: number; message: string }
>([
  ...authErrorMap,
  ...workspaceErrorMap,
  ...boardErrorMap,
]);
