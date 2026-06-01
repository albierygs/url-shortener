import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./../_db/schema.js";
import { DATABASE_URL } from "./enviroment.js";

const db = drizzle(DATABASE_URL, {
  schema,
  casing: "snake_case"
});

export default db;
