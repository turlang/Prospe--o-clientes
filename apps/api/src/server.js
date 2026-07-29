import "dotenv/config";
import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";

const app = createApp();
const server = app.listen(env.PORT, () => {
  console.log(`Delivery Burger API disponível em http://localhost:${env.PORT}`);
});

/**
 * Encerramento coordenado para não abandonar conexões do banco.
 */
async function shutdown(signal) {
  console.log(`\nSinal ${signal} recebido. Encerrando aplicação...`);
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
