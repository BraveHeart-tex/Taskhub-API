import { DomainError } from '@/domain/shared/domain-error';

export class ListNotFoundError extends DomainError {
  readonly code = 'LIST_NOT_FOUND';
  constructor() {
    super(`List not found`);
    this.name = 'ListNotFoundError';
  }
}

export class InvalidListTitleError extends DomainError {
  readonly code = 'INVALID_LIST_TITLE';
  constructor() {
    super(`Invalid list title`);
    this.name = 'InvalidListTitleError';
  }
}
