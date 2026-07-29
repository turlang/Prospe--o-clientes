import "dotenv/config";
import { z } from "zod";

/**
 * O schema centraliza a leitura e a validação das variáveis de ambiente.
 * A aplicação é interrompida cedo quando há configuração inválida.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3333),
  DATABASE_URL: z.string().min(1, "DATABASE_URL é obrigatória."),
  CLIENT_ORIGIN: z.string().url().default("http://localhost:5173"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET deve possuir ao menos 32 caracteres."),
  JWT_ISSUER: z.string().min(3).default("delivery-burger-api"),
  JWT_AUDIENCE: z.string().min(3).default("delivery-burger-web"),
  JWT_EXPIRES_IN: z.string().min(2).default("2h")
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Configuração de ambiente inválida:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
