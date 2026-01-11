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
