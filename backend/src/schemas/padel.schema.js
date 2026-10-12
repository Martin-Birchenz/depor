const { z } = require("zod");

const createPadelReservationSchema = z.object({
  facility_id: z.number().int().positive("La cancha de pádel es obligatoria"),
  reservation_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)"),
  start_time: z.string().min(1, "Hora de inicio requerida"),
  end_time: z.string().min(1, "Hora de fin requerida"),
  client_name: z
    .string()
    .min(3, "El nombre del cliente debe tener al menos 3 caracteres"),
  client_phone: z.string().min(6, "Teléfono de contacto requerido"),
  member_id: z.number().int().positive().nullable().optional(),
  final_price: z.number().nonnegative("El precio debe ser un número positivo"),
  payment_method: z
    .enum(["efectivo", "mercadopago", "pendiente"])
    .default("pendiente"),
  notes: z.string().max(150).optional().nullable(),
});

module.exports = {
  createPadelReservationSchema,
};
