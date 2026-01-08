import fp from 'fastify-plugin';
import { BoardRepository } from '@/repositories/board.repo';
import { BoardMemberRepository } from '@/repositories/board-member.repo';
import { WorkspaceRepository } from '@/repositories/workspace.repo';
import { BoardService } from '@/services/board.service';

export default fp(async (app) => {
  const boardService = new BoardService(
    new BoardRepository(),
    new BoardMemberRepository(),
    new WorkspaceRepository()
  );
  app.decorate('boardService', boardService);
});
