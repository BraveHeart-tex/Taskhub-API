import type { DomainError } from '@/domain/domain-error';
import {
  WorkspaceNameAlreadyExistsError,
  WorkspaceNotFoundError,
} from '@/domain/workspace/workspace.errors';

export const workspaceErrorMap = new Map<
  new () => DomainError,
  { status: number; message: string }
>([
  [
    WorkspaceNameAlreadyExistsError,
    { status: 409, message: 'Workspace name already exists' },
  ],
  [WorkspaceNotFoundError, { status: 404, message: 'Workspace not found' }],
]);
