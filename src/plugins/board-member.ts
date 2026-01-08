import fp from 'fastify-plugin';
import { BoardRepository } from '../repositories/board.repo';
import { BoardMemberRepository } from '../repositories/board-member.repo';
import { UserRepository } from '../repositories/user.repo';
import { BoardMemberService } from '../services/board-member.service';

export default fp(async (app) => {
  const boardMemberService = new BoardMemberService(
    new BoardMemberRepository(),
    new BoardRepository(),
    new UserRepository()
  );

  app.decorate('boardMemberService', boardMemberService);
});
