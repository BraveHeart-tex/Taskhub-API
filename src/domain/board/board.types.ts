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
