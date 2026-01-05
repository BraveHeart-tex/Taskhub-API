import fp from 'fastify-plugin';
import { BoardRepository } from '../board/board.repo';
import { BoardMemberRepository } from '../board-member/board-member.repo';
import { BoardMemberService } from '../board-member/board-member.service';

export default fp(async (app) => {
  const boardMemberService = new BoardMemberService(
    new BoardMemberRepository(),
    new BoardRepository()
  );

  app.decorate('boardMemberService', boardMemberService);
});
