import { z } from "zod";

const strongPassword = z
  .string()
  .min(8, "A senha deve possuir ao menos oito caracteres.")
  .regex(/[a-z]/, "A senha deve possuir letra minúscula.")
  .regex(/[A-Z]/, "A senha deve possuir letra maiúscula.")
  .regex(/[0-9]/, "A senha deve possuir número.");

export const registerSchema = z.object({
  name: z.string().trim().min(3).max(120),
  email: z.string().trim().toLowerCase().email().max(180),
  password: strongPassword
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1)
});
