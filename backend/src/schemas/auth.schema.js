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

module.exports = { loginSchema };
