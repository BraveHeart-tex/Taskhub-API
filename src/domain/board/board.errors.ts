import { DomainError } from '../domain-error';

export class InvalidBoardTitleError extends DomainError {
  readonly code = 'INVALID_BOARD_TITLE';
  constructor() {
    super(`Invalid board title`);
    this.name = 'InvalidBoardTitleError';
  }
}

export class BoardNotFoundError extends DomainError {
  readonly code = 'BOARD_NOT_FOUND';
  constructor() {
    super(`Board not found`);
    this.name = 'BoardNotFoundError';
  }
}

export class BoardTitleAlreadyExistsError extends DomainError {
  readonly code = 'BOARD_TITLE_ALREADY_EXISTS';
  constructor() {
    super(`Board title already exists`);
    this.name = 'BoardTitleAlreadyExistsError';
  }
}
