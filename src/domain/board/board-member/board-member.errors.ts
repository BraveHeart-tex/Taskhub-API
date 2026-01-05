import { DomainError } from '../../shared/domain-error';

export class BoardMemberNotFoundError extends DomainError {
  readonly code = 'BOARD_MEMBER_NOT_FOUND';
  constructor() {
    super(`Board member not found`);
    this.name = 'BoardMemberNotFoundError';
  }
}
