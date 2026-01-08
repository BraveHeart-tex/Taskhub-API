import { DomainError } from '../domain-error';

export class WorkspaceNameAlreadyExistsError extends DomainError {
  readonly code = 'WORKSPACE_NAME_ALREADY_EXISTS';

  constructor() {
    super('Workspace name already exists');
    this.name = 'WorkspaceNameAlreadyExistsError';
  }
}

export class WorkspaceNotFoundError extends DomainError {
  readonly code = 'WORKSPACE_NOT_FOUND';

  constructor() {
    super('Workspace not found');
    this.name = 'WorkspaceNotFoundError';
  }
}
