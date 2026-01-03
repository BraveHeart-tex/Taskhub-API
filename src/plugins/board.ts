import fp from 'fastify-plugin';
import { BoardRepository } from '../board/board.repo';
import { BoardService } from '../board/board.service';
import { WorkspaceRepository } from '../workspace/workspace.repo';

export default fp(async (app) => {
  const boardService = new BoardService(
    new BoardRepository(app.db),
    new WorkspaceRepository(app.db)
  );
  app.decorate('boardService', boardService);
});
