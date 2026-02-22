import type { DashboardReadRepository } from '@/repositories/dashboard-read.repo';
import type { DashboardDto } from '@/routes/me/dashboard/schema';

export class DashboardService {
  constructor(private readonly dashboardRepo: DashboardReadRepository) {}

  async getDashboard(userId: string): Promise<DashboardDto> {
    const workspaces = await this.dashboardRepo.getUserWorkspaces(userId);

    if (workspaces.length === 0) {
      return {
        workspaces: [],
        boards: [],
        favorites: [],
      };
    }

    const workspaceIds: string[] = new Array(workspaces.length);

    for (let i = 0; i < workspaces.length; i++) {
      workspaceIds[i] = workspaces[i].id;
    }

    const boards = await this.dashboardRepo.getBoardsForWorkspaces(
      userId,
      workspaceIds
    );

    const favorites: string[] = [];

    for (let i = 0; i < boards.length; i++) {
      if (boards[i].isFavorited !== null) {
        favorites.push(boards[i].id);
      }
    }

    return {
      workspaces,
      boards: this.normalizeBoards(boards),
      favorites,
    };
  }

  private normalizeBoards(
    boards: {
      id: string;
      title: string;
      workspaceId: string;
      isFavorited: string | null;
    }[]
  ): DashboardDto['boards'] {
    const result = new Array(boards.length);

    for (let i = 0; i < boards.length; i++) {
      const b = boards[i];
      result[i] = {
        id: b.id,
        title: b.title,
        workspaceId: b.workspaceId,
        isFavorited: b.isFavorited !== null,
      };
    }

    return result;
  }
}
