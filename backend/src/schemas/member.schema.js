const { z } = require("zod");

const createMemberSchema = z.object({
  dni: z
    .string({ required_error: "DNI is required" })
    .min(6, "DNI must be at least 6 characters")
    .max(20)
    .trim(),
  firstName: z
    .string({ required_error: "First name is required" })
    .min(2)
    .max(100)
    .trim(),
  lastName: z
    .string({ required_error: "Last name is required" })
    .min(2)
    .max(100)
    .trim(),
  phone: z
    .string({ required_error: "Phone is required" })
    .min(6)
    .max(50)
    .trim(),
  email: z
    .string()
    .email("Invalid email")
    .max(150)
    .trim()
    .optional()
    .nullable()
    .or(z.literal("")),
  status: z.enum(["active", "debtor", "inactive"]).default("active"),
  memberNumber: z.number().int().positive().optional().nullable(),
});

const updateMemberSchema = createMemberSchema.partial();

const updateMemberStatusSchema = z.object({
  status: z.enum(["active", "debtor", "inactive"], {
    required_error: "Status is required",
  }),
});

module.exports = {
  createMemberSchema,
  updateMemberSchema,
  updateMemberStatusSchema,
};
