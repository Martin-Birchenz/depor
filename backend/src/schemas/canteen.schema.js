const { z } = require("zod");

const createCanteenSaleSchema = z.object({
  paymentMethod: z
    .enum(["efectivo", "transferencia", "debito"])
    .default("efectivo"),
  notes: z.string().max(255).optional().nullable(),
  items: z
    .array(
      z.object({
        productId: z.number().int().positive(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1, "Debe incluir al menos un producto"),
});

module.exports = { createCanteenSaleSchema };
