const { z } = require("zod");

const createCampRegistrationSchema = z.object({
  minorFullName: z
    .string({ required_error: "Name is required" })
    .min(3, { message: "Name must be at least 3 characters long" })
    .max(255)
    .trim(),
  minorBirthDate: z
    .string({ required_error: "Birth date is required" })
    .min(4)
    .max(100)
    .trim(),
  guardianName: z
    .string({ required_error: "Guardian name is required" })
    .min(3, { message: "Guardian name must be at least 3 characters long" })
    .max(255)
    .trim(),
  guardianPhone: z
    .string({ required_error: "Guardian phone is required" })
    .min(6, { message: "Guardian phone must be at least 6 characters long" })
    .max(50)
    .trim(),
  medicalNotes: z.string().max(255).optional().nullable(),
});

const updateCampRegistrationStatusSchema = z.object({
  status: z.enum(["pendiente", "confirmado", "baja"], {
    errorMap: () => ({
      message:
        "Status must be one of the following values: pendiente, confirmado, baja",
    }),
  }),
});

module.exports = {
  createCampRegistrationSchema,
  updateCampRegistrationStatusSchema,
};
