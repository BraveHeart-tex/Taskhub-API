import { DomainError } from '@/domain/domain-error';

export class WorkspaceMemberNotFoundError extends DomainError {
  readonly code = 'WORKSPACE_MEMBER_NOT_FOUND';
  constructor() {
    super(`Workspace member not found`);
    this.name = 'WorkspaceMemberNotFoundError';
  }
}

export class WorkspaceMemberAlreadyExistsError extends DomainError {
  readonly code = 'WORKSPACE_MEMBER_ALREADY_EXISTS';
  constructor() {
    super(`Workspace member already exists`);
    this.name = 'WorkspaceMemberAlreadyExistsError';
  }
}


