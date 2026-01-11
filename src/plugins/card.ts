import fp from 'fastify-plugin';
import { BoardMemberRepository } from '@/repositories/board-member.repo';
import { CardRepository } from '@/repositories/card.repo';
import { ListRepository } from '@/repositories/list.repo';
import { CardService } from '@/services/card.service';

export default fp(async (app) => {
  const cardService = new CardService(
    new ListRepository(),
    new BoardMemberRepository(),
    new CardRepository()
  );
  app.decorate('cardService', cardService);
});
