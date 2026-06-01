import { config } from "dotenv";

config();

export const DATABASE_URL = String(process.env.DATABASE_URL);
export const BASE_URL = String(process.env.BASE_URL);
export const SALT_HASHID = String(process.env.SALT_HASHID);
export const INITIAL_COUNTER = String(process.env.INITIAL_COUNTER);

export const REDIS_CLIENT_PASSWORD = String(process.env.REDIS_CLIENT_PASSWORD);
export const REDIS_CLIENT_HOST = String(process.env.REDIS_CLIENT_HOST);
export const REDIS_CLIENT_PORT = Number(process.env.REDIS_CLIENT_PORT);
export const REDIS_CLIENT_USERNAME = String(process.env.REDIS_CLIENT_USERNAME);
