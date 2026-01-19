import {
  WorkspaceMemberAlreadyExistsError,
  WorkspaceMemberNotFoundError,
} from '@/domain/workspace/workspace-member/workspace-member.errors';
import type { DomainError } from '@/domain/domain-error';
import { HttpStatus } from '@/http/http-status';

export const workspaceMemberErrorMap = new Map<
  new () => DomainError,
  { status: number; message: string }
>([
  [
    WorkspaceMemberNotFoundError,
    { status: HttpStatus.NOT_FOUND, message: 'Workspace member not found' },
  ],
  [
    WorkspaceMemberAlreadyExistsError,
    { status: HttpStatus.CONFLICT, message: 'Workspace member already exists' },
  ],
]);



