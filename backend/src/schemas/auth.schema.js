const { z } = require("zod");

const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .email("Invalid email")
    .trim(),
  password: z
    .string({ required_error: "Password is required" })
    .min(1, "Password must be at least 1 character"),
});

const registerUserSchema = z.object({
  roleId: z
    .number({ required_error: "El ID de rol es obligatorio" })
    .int()
    .positive(),
  name: z
    .string({ required_error: "El nombre es obligatorio" })
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(100)
    .trim(),
  email: z
    .string({ required_error: "El email es obligatorio" })
    .email("Formato de email inválido")
    .trim(),
  password: z
    .string({ required_error: "La contraseña es obligatoria" })
    .min(6, "La contraseña debe tener al menos 6 caracteres"),
});

module.exports = { loginSchema, registerUserSchema };
