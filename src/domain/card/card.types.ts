export interface CardDto {
  id: string;
  title: string;
  description: string | null;
  position: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCardParams {
  currentUserId: string;
  title: string;
  description?: string;
  listId: string;
  boardId: string;
}

export interface DeleteCardParams {
  currentUserId: string;
  cardId: string;
  listId: string;
  boardId: string;
}

export interface UpdateCardParams {
  currentUserId: string;
  cardId: string;
  listId: string;
  boardId: string;
  title?: string;
  description?: string;
}

export interface MoveCardParams {
  currentUserId: string;
  boardId: string;
  cardId: string;
  targetListId: string;
  beforeCardId?: string;
  afterCardId?: string;
}
