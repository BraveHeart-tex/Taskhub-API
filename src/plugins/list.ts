import fp from 'fastify-plugin';
import { BoardRepository } from '@/board/board.repo';
import { BoardMemberRepository } from '@/board-member/board-member.repo';
import { ListRepository } from '@/list/list.repo';
import { ListService } from '@/list/list.service';

export default fp(async (app) => {
  const listService = new ListService(
    new ListRepository(),
    new BoardRepository(),
    new BoardMemberRepository()
  );

  app.decorate('listService', listService);
});
