import type { CardDto } from '../card/card.types';
import type { BoardMemberRole } from './board-member/board-member.types';

export interface GetBoardResponse {
  board: {
    id: string;
    title: string;
    workspaceId: string;
    createdAt: string;
    updatedAt: string;
    myRole: BoardMemberRole;
  };
  members: {
    userId: string;
    fullName: string;
    role: BoardMemberRole;
  }[];
  lists: {
    id: string;
    title: string;
    position: string;
    cards: CardDto[];
  }[];
}
