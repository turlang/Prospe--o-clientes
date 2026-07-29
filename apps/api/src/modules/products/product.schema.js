import { z } from "zod";

const moneySchema = z.coerce.number().positive().max(99999.99);

export const listProductsQuerySchema = z.object({
  category: z.enum(["BURGER", "DRINK", "SIDE"]).optional(),
  search: z.string().trim().max(100).optional(),
  featured: z.enum(["true", "false"]).transform((value) => value === "true").optional()
});

export const productIdParamsSchema = z.object({
  id: z.string().uuid()
});

export const createProductSchema = z.object({
  name: z.string().trim().min(3).max(120),
  description: z.string().trim().min(10).max(500),
  imageUrl: z.string().url().max(500),
  price: moneySchema,
  category: z.enum(["BURGER", "DRINK", "SIDE"]),
  available: z.boolean().default(true),
  featured: z.boolean().default(false)
});

export const updateProductSchema = createProductSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  "Informe ao menos um campo para atualização."
);
