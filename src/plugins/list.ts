import fp from 'fastify-plugin';
import { BoardRepository } from '@/repositories/board.repo';
import { BoardMemberRepository } from '@/repositories/board-member.repo';
import { ListRepository } from '@/repositories/list.repo';
import { ListService } from '@/services/list.service';

export default fp(async (app) => {
  const listService = new ListService(
    new ListRepository(),
    new BoardRepository(),
    new BoardMemberRepository()
  );

  app.decorate('listService', listService);
});
