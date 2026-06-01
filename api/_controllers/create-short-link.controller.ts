import { FastifyReply, FastifyRequest } from "fastify";
import { linkTable } from "../_db/schema";
import db from "../_lib/drizzle";
import { BASE_URL } from "../_lib/enviroment";
import { hashId } from "../_lib/hashid";
import { redisClient } from "../_lib/redis";
import { getShortIdIfLinkExists } from "../_services/linkService";
import { CreateShortLinkRequest, CreateShortLinkResponse } from "../_types/create-short-link.types";

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
