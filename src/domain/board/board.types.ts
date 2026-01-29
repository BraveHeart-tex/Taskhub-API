export interface GetBoardContextResponse {
  id: string;
  title: string;
  workspaceId: string;
  myRole: 'owner' | 'member';
  permissions: {
    canEditBoard: boolean;
    canDeleteBoard: boolean;
    canManageMembers: boolean;
  };
}

export interface WorkspaceBoardPreviewDto {
  id: string;
  title: string;
  workspaceId: string;
  isCurrentUserOwner: boolean;
  memberCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BoardContentDto {
  boardId: string;
  lists: {
    id: string;
    title: string;
    position: string;
    cards: {
      id: string;
      listId: string;
      title: string;
      description: string | null;
      position: string;
      createdBy: string;
      createdAt: string;
      updatedAt: string;
    }[];
  }[];
  users: Record<
    string,
    {
      id: string;
      fullName: string;
      avatarUrl: string | null;
    }
  >;
}
