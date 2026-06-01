import { FastifyReply, FastifyRequest } from "fastify";
import { linkTable } from "../_db/schema.js";
import db from "../_lib/drizzle.js";
import { BASE_URL } from "../_lib/enviroment.js";
import { hashId } from "../_lib/hashid.js";
import { redisClient } from "../_lib/redis.js";
import { getShortIdIfLinkExists } from "../_services/linkService.js";
import {
  CreateShortLinkRequest,
  CreateShortLinkResponse
} from "../_types/create-short-link.types.js";

export const createShortLinkController = async (
  req: FastifyRequest<{ Body: CreateShortLinkRequest }>,
  reply: FastifyReply<{ Reply: CreateShortLinkResponse }>
) => {
  const { url } = req.body;

  let shortId = await getShortIdIfLinkExists(url);

  if (shortId) {
    console.info(`Link already exists for ${url} with id ${shortId}`);
    return reply.send({ shortLink: `${BASE_URL}/${shortId}` });
  }

  const counter = await redisClient.INCR("shortLink:id");
  shortId = hashId.encode(counter);

  console.info(`Creating link for ${url} with id ${shortId} and counter ${counter}`);
  await db.insert(linkTable).values({ fullLink: url, shortId });

  reply.send({ shortLink: `${BASE_URL}/${shortId}` });
};
