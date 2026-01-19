import type { Db } from '@/db/client';
import type { AuthenticatedUser } from '@/domain/authenticated-user';
import type { SessionContext } from '@/domain/session-context';
import type { AuthService } from '@/services/auth.service';
import type { BoardService } from '@/services/board.service';
import type { BoardMemberService } from '@/services/board-member.service';
import type { ListService } from '@/services/list.service';
import type { WorkspaceService } from '@/services/workspace.service';
import type { WorkspaceMemberService } from '@/services/workspace-member.service';
import 'fastify';
import type { CardService } from '@/services/card.service';

declare module 'fastify' {
  interface FastifyInstance {
    db: Db;
    authService: AuthService;
    boardService: BoardService;
    boardMemberService: BoardMemberService;
    cardService: CardService;
    workspaceService: WorkspaceService;
    workspaceMemberService: WorkspaceMemberService;
    listService: ListService;
    config: {
      NODE_ENV: string;
      PORT: number;
      DATABASE_URL: string;
    };
  }
  interface FastifyRequest {
    user?: AuthenticatedUser;
    session?: SessionContext;
  }
}
