import 'fastify';
import type { AuthService } from '../auth/auth.service';
import type { BoardService } from '../board/board.service';
import type { BoardMemberService } from '../board-member/board-member.service';
import type { Db } from '../db/client';
import type { AuthenticatedUser } from '../domain/authenticated-user';
import type { SessionContext } from '../domain/session-context';
import type { WorkspaceService } from '../workspace/workspace.service';

declare module 'fastify' {
  interface FastifyInstance {
    db: Db;
    authService: AuthService;
    boardService: BoardService;
    boardMemberService: BoardMemberService;
    workspaceService: WorkspaceService;
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
