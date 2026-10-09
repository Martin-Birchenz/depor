const { z } = require("zod");

const createYouthPlayerSchema = z.object({
  categoryId: z.number().int().positive(),
  firstName: z.string().min(2).max(100).trim(),
  lastName: z.string().min(2).max(100).trim(),
  dni: z.string().min(6).max(20).trim(),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Formato YYYY-MM-DD"),
  guardianName: z.string().min(2).max(150).trim(),
  guardianPhone: z.string().min(6).max(50).trim(),
});

module.exports = { createYouthPlayerSchema };
