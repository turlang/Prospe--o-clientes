import { z } from "zod";

const addressSchema = z.object({
  street: z.string().trim().min(3).max(180),
  number: z.string().trim().min(1).max(30),
  district: z.string().trim().min(2).max(120),
  city: z.string().trim().min(2).max(120),
  state: z.string().trim().length(2).transform((value) => value.toUpperCase()),
  zipCode: z.string().trim().regex(/^\d{5}-?\d{3}$/, "CEP inválido."),
  complement: z.string().trim().max(180).optional().or(z.literal(""))
});

export const createOrderSchema = z
  .object({
    deliveryMode: z.enum(["DELIVERY", "PICKUP"]),
    paymentMethod: z.enum(["PIX", "CARD", "CASH"]),
    address: addressSchema.optional(),
    notes: z.string().trim().max(500).optional().or(z.literal("")),
    items: z
      .array(
        z.object({
          productId: z.string().uuid(),
          quantity: z.coerce.number().int().min(1).max(20)
        })
      )
      .min(1)
      .max(30)
  })
  .superRefine((value, context) => {
    if (value.deliveryMode === "DELIVERY" && !value.address) {
      context.addIssue({
        code: "custom",
        path: ["address"],
        message: "Endereço é obrigatório para entrega."
      });
    }
  });

export const orderIdParamsSchema = z.object({
  id: z.string().uuid()
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "READY",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
    "CANCELED"
  ])
});
