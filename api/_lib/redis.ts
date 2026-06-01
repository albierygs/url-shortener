import { desc } from "drizzle-orm";
import { createClient } from "redis";
import { linkTable } from "../_db/schema.js";
import db from "./drizzle.js";
import {
  INITIAL_COUNTER,
  REDIS_CLIENT_HOST,
  REDIS_CLIENT_PASSWORD,
  REDIS_CLIENT_PORT,
  REDIS_CLIENT_USERNAME
} from "./enviroment.js";
import { hashId } from "./hashid.js";

export const redisClient = await createClient({
  username: REDIS_CLIENT_USERNAME,
  password: REDIS_CLIENT_PASSWORD,
  socket: {
    host: REDIS_CLIENT_HOST,
    port: REDIS_CLIENT_PORT
  }
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

let redisInitialized = false;

export async function initRedis() {
  if (redisInitialized) return;

  if (!redisClient.isOpen) {
    await redisClient.connect();
  }

  const maxId = await db
    .select({ shortId: linkTable.shortId })
    .from(linkTable)
    .orderBy(desc(linkTable.createdAt))
    .limit(1);

  const numericId =
    maxId.length > 0 ? hashId.decode(maxId[0].shortId)[0].toString() : INITIAL_COUNTER;
  console.log("Numeric ID for Redis initialization:", numericId);

  await redisClient.setNX("shortLink:id", numericId);

  redisInitialized = true;
}
