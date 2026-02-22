export interface CardDto {
  id: string;
  title: string;
  description: string | null;
  position: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCardInput {
  currentUserId: string;
  title: string;
  description?: string;
  listId: string;
}

export interface DeleteCardInput {
  currentUserId: string;
  cardId: string;
  listId: string;
  boardId: string;
}

export interface UpdateCardInput {
  currentUserId: string;
  cardId: string;
  listId: string;
  boardId: string;
  title?: string;
  description?: string;
}

export interface MoveCardInput {
  currentUserId: string;
  boardId: string;
  cardId: string;
  targetListId: string;
  beforeCardId?: string;
  afterCardId?: string;
}
