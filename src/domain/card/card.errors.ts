import { DomainError } from '../domain-error';

export class CardNotFoundError extends DomainError {
  readonly code = 'CARD_NOT_FOUND';
  constructor() {
    super(`Card not found`);
    this.name = 'CardNotFoundError';
  }
}
