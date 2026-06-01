import { FastifyReply, FastifyRequest, HookHandlerDoneFunction } from "fastify";
import z from "zod";

export const validate = (schema: z.ZodSchema, from: "body" | "query" | "params") => {
  return (req: FastifyRequest, reply: FastifyReply, done: HookHandlerDoneFunction) => {
    const result = schema.safeParse(req[from]);

    if (!result.success) {
      reply.status(422).send({
        error: "Dados inválidos",
        issues: z.treeifyError(result.error)
      });
      return;
    }

    req[from] = result.data;
    done();
  };
};
