import { FastifyReply, FastifyRequest } from "fastify";
import { UAParser } from "ua-parser-js";
import { accessLogTable } from "../_db/schema.js";
import db from "../_lib/drizzle.js";
import { redisClient } from "../_lib/redis.js";
import { findLinkByShortId } from "../_services/linkService.js";
import { FindFullLinkQuery, FindFullLinkResponse } from "../_types/find-full-link.types.js";

export const findFullLinkController = async (
  req: FastifyRequest<{ Querystring: FindFullLinkQuery }>,
  reply: FastifyReply<{ Reply: FindFullLinkResponse }>
) => {
  const { shortId } = req.query;

  const link = await findLinkByShortId(shortId);

  const parser = new UAParser(req.headers["user-agent"]);

  const result = parser.getResult();

  let deviceType: "desktop" | "mobile" | "tablet" | "bot";

  if (result.device.type === "mobile") {
    deviceType = "mobile";
  } else if (result.device.type === "tablet") {
    deviceType = "tablet";
  } else if (!result.browser.name && !result.os.name && !result.device.type) {
    deviceType = "bot";
  } else {
    deviceType = "desktop";
  }

  await db.insert(accessLogTable).values({
    device_type: deviceType,
    linkShortId: shortId,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"] || ""
  });

  await redisClient.del(`analytics:${shortId}:*`);

  return reply.status(200).send({ fullLink: link.fullLink });
};
