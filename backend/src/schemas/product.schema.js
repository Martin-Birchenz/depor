const { z } = require("zod");

const variantItemSchema = z.object({
  size: z.string({ required_error: "Size is required" }).min(1).max(20).trim(),
  stock: z.number().int().nonnegative().default(0),
});

const createProductSchema = z.object({
  name: z.string({ required_error: "Name is required" }).min(2).max(255).trim(),
  description: z.string().max(255).trim().optional().nullable(),
  price: z.number({ required_error: "Price is required" }).positive(),
  memberPrice: z.number().positive().optional().nullable(),
  imageUrl: z.string().url().max(255).optional().nullable(),
  isActive: z.boolean().default(true),
  variants: z.array(variantItemSchema).optional().default([]),
});

const updateProductSchema = createProductSchema
  .partial()
  .omit({ variants: true });

const updatedVariantStockSchema = z.object({
  stock: z.number({ required_error: "Stock is required" }).int().nonnegative(),
});

const addVariantSchema = variantItemSchema;

module.exports = {
  createProductSchema,
  updateProductSchema,
  updatedVariantStockSchema,
  addVariantSchema,
};
