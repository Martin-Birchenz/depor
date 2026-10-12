const { z } = require("zod");

const createSalonReservationSchema = z.object({
  facility_id: z.number().int().positive("El salón o sector es obligatorio"),
  reservation_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)"),
  shift: z.enum(["mediodia", "noche", "completo"]).default("noche"),
  client_name: z
    .string()
    .min(3, "El nombre del contratante debe tener al menos 3 caracteres"),
  client_phone: z.string().min(6, "Teléfono de contacto requerido"),
  member_id: z.number().int().positive().nullable().optional(),
  final_price: z.number().nonnegative("El precio debe ser un número positivo"),
  payment_method: z
    .enum(["efectivo", "mercadopago", "pendiente"])
    .default("pendiente"),
  notes: z.string().max(255).optional().nullable(),
});

module.exports = {
  createSalonReservationSchema,
};
