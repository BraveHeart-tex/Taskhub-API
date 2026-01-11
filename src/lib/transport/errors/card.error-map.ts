import { CardNotFoundError } from '@/domain/card/card.errors';
import type { DomainError } from '@/domain/domain-error';

export const cardErrorMap = new Map<
  new () => DomainError,
  { status: number; message: string }
>([[CardNotFoundError, { status: 404, message: 'Card not found' }]]);
