import cors from "@fastify/cors";
import Fastify from "fastify";
import { analyticsLinkController } from "../_controllers/analyttics-link.controller.js";
import { createShortLinkController } from "../_controllers/create-short-link.controller.js";
import { findFullLinkController } from "../_controllers/find-full-link.controller.js";
import { AppException } from "../_exceptions/AppException.js";
import { validate } from "../_middlewares/validator.js";
import { analyticsLinkSchema } from "../_schemas/analyttics-link.schema.js";
import { createShortLinkSchema } from "../_schemas/create-short-link.schema.js";
import { findFullLinkSchema } from "../_schemas/find-full-link.schema.js";
import {
  AnalyticsLinkParams,
  AnalyticsLinkQuery,
  AnalyticsLinkResponse
} from "../_types/analyttics-link.types.js";
import {
  CreateShortLinkRequest,
  CreateShortLinkResponse
} from "../_types/create-short-link.types.js";
import { FindFullLinkQuery, FindFullLinkResponse } from "../_types/find-full-link.types.js";

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
