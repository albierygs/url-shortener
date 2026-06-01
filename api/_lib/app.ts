import cors from "@fastify/cors";
import Fastify from "fastify";
import { analyticsLinkController } from "../_controllers/analyttics-link.controller";
import { createShortLinkController } from "../_controllers/create-short-link.controller";
import { findFullLinkController } from "../_controllers/find-full-link.controller";
import { AppException } from "../_exceptions/AppException";
import { validate } from "../_middlewares/validator";
import { analyticsLinkSchema } from "../_schemas/analyttics-link.schema";
import { createShortLinkSchema } from "../_schemas/create-short-link.schema";
import { findFullLinkSchema } from "../_schemas/find-full-link.schema";
import {
  AnalyticsLinkParams,
  AnalyticsLinkQuery,
  AnalyticsLinkResponse
} from "../_types/analyttics-link.types";
import { CreateShortLinkRequest, CreateShortLinkResponse } from "../_types/create-short-link.types";
import { FindFullLinkQuery, FindFullLinkResponse } from "../_types/find-full-link.types";

const app = Fastify();

app.register(cors);

// rotas
app.get<{ Querystring: FindFullLinkQuery; Reply: FindFullLinkResponse }>(
  "/api/find",
  { preHandler: validate(findFullLinkSchema.shape.query, "query") },
  findFullLinkController
);
app.post<{ Body: CreateShortLinkRequest; Reply: CreateShortLinkResponse }>(
  "/api/shorten",
  { preHandler: validate(createShortLinkSchema.shape.request, "body") },
  createShortLinkController
);

app.get<{
  Querystring: AnalyticsLinkQuery;
  Params: AnalyticsLinkParams;
  Reply: AnalyticsLinkResponse;
}>(
  "/api/:shortId/analytics",
  {
    preHandler: [
      validate(analyticsLinkSchema.shape.params, "params"),
      validate(analyticsLinkSchema.shape.query, "query")
    ]
  },
  analyticsLinkController
);

app.setErrorHandler((error, _req, reply) => {
  let statusCode = Number(500);
  let message;

  console.log("Error:", error);

  if (error instanceof AppException) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof Error) {
    statusCode = 500;
    message = "Internal Server Error: " + error.message;
  }
  reply.status(statusCode).send({
    message
  });
});

export default app;
