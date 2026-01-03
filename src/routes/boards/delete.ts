import { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { UnauthenticatedError } from "../../domain/auth/auth.errors";

const route: FastifyPluginAsyncZod = async (app) => {
  app.delete("/:id", (request,reply) => {
    if (!request.user || !request.session?.id) {
      throw new UnauthenticatedError()
    }
  })
}

export default route;
