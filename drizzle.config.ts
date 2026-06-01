import { configDotenv } from "dotenv";
import { defineConfig } from "drizzle-kit";

configDotenv();

export default defineConfig({
  out: "./api/_drizzle",
  schema: "./api/_db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!
  }
});
