import { PrismaClient } from "@prisma/client";

/**
 * Instância única do Prisma Client para evitar abertura desnecessária de conexões.
 */
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
});
