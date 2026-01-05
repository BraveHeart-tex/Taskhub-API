import type { FastifyRequest } from 'fastify';
import { UnauthenticatedError } from '../../domain/auth/auth.errors';

export function requireAuth(request: FastifyRequest) {
  if (!request.user || !request.session) {
    throw new UnauthenticatedError();
  }

  return {
    user: request.user,
    session: request.session,
  };
}
