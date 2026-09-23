const { z } = require("zod");

const createMemberSchema = z.object({
  dni: z
    .string()
    .min(6, "DNI must be at least 6 characters")
    .max(20, "DNI must be at most 20 characters")
    .trim(),
  firstName: z
    .string()
    .min(6, "First name must be at least 6 characters")
    .max(100)
    .trim(),
  lastName: z
    .string({ required_error: "Last name is required" })
    .min(2, "Last name must be at least 2 characters")
    .max(100)
    .trim(),
  phone: z
    .string({ required_error: "Phone is required" })
    .min(6, "Phone must be at least 6 characters")
    .max(50)
    .trim(),
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email")
    .max(150)
    .trim()
    .optional()
    .nullable(),
  status: z.enum(["active", "inactive", "debtor"]).default("active"),
  memberNumber: z
    .int("Member number must be a number")
    .positive("Member number must be a positive number")
    .optional()
    .nullable(),
});

module.exports = { createMemberSchema };
