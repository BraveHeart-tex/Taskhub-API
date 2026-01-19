import type { DomainError } from '@/domain/domain-error';
import { authErrorMap } from './auth.error-map';
import { boardErrorMap } from './board.error-map';
import { boardMemberErrorMap } from './board-member.error-map';
import { cardErrorMap } from './card.error-map';
import { listErrorMap } from './list.error-map';
import { workspaceErrorMap } from './workspace.error-map';
import { workspaceMemberErrorMap } from './workspace-member.error-map';

export const errorRegistry = new Map<
  new () => DomainError,
  { status: number; message: string }
>([
  ...authErrorMap,
  ...workspaceErrorMap,
  ...workspaceMemberErrorMap,
  ...boardErrorMap,
  ...boardMemberErrorMap,
  ...listErrorMap,
  ...cardErrorMap,
]);
