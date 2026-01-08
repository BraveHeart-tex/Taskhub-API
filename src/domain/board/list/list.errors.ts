import { DomainError } from '@/domain/domain-error';

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

export class DuplicateListIdError extends DomainError {
  readonly code = 'DUPLICATE_LIST_ID';
  constructor() {
    super(`Duplicate list ID`);
    this.name = 'DuplicateListIdError';
  }
}

export class InvalidReorderPayloadError extends DomainError {
  readonly code = 'INVALID_REORDER_PAYLOAD';
  constructor() {
    super(`Invalid reorder payload. Provided payload has missing list IDs`);
    this.name = 'InvalidReorderPayloadError';
  }
}
