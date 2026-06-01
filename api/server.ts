import app from "./_lib/app";
import { initRedis } from "./_lib/redis";

await initRedis();

if (process.env.NODE_ENV === "development") {
  app.listen({ port: 3000 }, () => {
    console.log("API rodando em http://localhost:3000");
  });
}

export default async function handler(req, res) {
  await app.ready();

  app.server.emit("request", req, res);
}
