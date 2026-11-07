const { z } = require("zod");

const createMemberSchema = z.object({
  dni: z
    .string({ required_error: "El DNI es obligatorio" })
    .min(6, "El DNI debe tener al menos 6 caracteres")
    .max(20)
    .trim(),
  cuit: z.string().max(20).trim().optional().nullable().or(z.literal("")),
  birthDate: z.string().optional().nullable(),
  firstName: z
    .string({ required_error: "El nombre es obligatorio" })
    .min(2)
    .max(100)
    .trim(),
  lastName: z
    .string({ required_error: "El apellido es obligatorio" })
    .min(2)
    .max(100)
    .trim(),
  phone: z
    .string({ required_error: "El teléfono es obligatorio" })
    .min(6)
    .max(50)
    .trim(),
  address: z.string().max(255).trim().optional().nullable().or(z.literal("")),
  email: z
    .string()
    .email("Email inválido")
    .max(150)
    .trim()
    .optional()
    .nullable()
    .or(z.literal("")),
  photoUrl: z.string().url().optional().nullable().or(z.literal("")),
  status: z.enum(["active", "debtor", "inactive"]).default("active"),
  category: z
    .enum(["general", "cadete", "familiar", "vitalicio", "honorario"])
    .default("general"),
  memberNumber: z.number().int().positive().optional().nullable(),
  createdAt: z.string().optional().nullable(),
  paidUntil: z.string().optional().nullable(),
  tutorInfo: z.any().optional().nullable(),
  familyMembers: z.any().optional().nullable(),
});

const updateMemberSchema = createMemberSchema.partial();

const updateMemberStatusSchema = z.object({
  status: z.enum(["active", "debtor", "inactive"], {
    required_error: "El estado es obligatorio",
  }),
});

module.exports = {
  createMemberSchema,
  updateMemberSchema,
  updateMemberStatusSchema,
};
