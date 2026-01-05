import { DomainError } from '../../shared/domain-error';

export class BoardMemberNotFoundError extends DomainError {
  readonly code = 'BOARD_MEMBER_NOT_FOUND';
  constructor() {
    super(`Board member not found`);
    this.name = 'BoardMemberNotFoundError';
  }
}

export class BoardMemberAlreadyExistsError extends DomainError {
  readonly code = 'BOARD_MEMBER_ALREADY_EXISTS';
  constructor() {
    super(`Board member already exists`);
    this.name = 'BoardMemberAlreadyExistsError';
  }
}
