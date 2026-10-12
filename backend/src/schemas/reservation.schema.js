const { z } = require("zod");

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const createReservationSchema = z.object({
  facilityId: z.number().int().positive(),
  reservationDate: z
    .string()
    .regex(dateRegex, "La fecha debe tener formato YYYY-MM-DD"),
  startTime: z.string().regex(timeRegex, "La hora de inicio debe ser HH:MM"),
  endTime: z.string().regex(timeRegex, "La hora de fin debe ser HH:MM"),
  clientName: z.string().min(2).max(100),
  clientPhone: z.string().min(6).max(50),
  isMember: z.boolean().optional().default(false),
  depositPaid: z.number().min(0).optional().default(0),
  finalPrice: z.number().min(0).optional().default(0),
  paymentMethod: z
    .enum(["efectivo", "transferencia", "debito"])
    .optional()
    .default("efectivo"),
  notes: z.string().max(255).optional().nullable(),
  status: z
    .enum(["pendiente", "confirmado", "cancelado"])
    .optional()
    .default("confirmado"),
});

const updateReservationStatusSchema = z.object({
  status: z.enum(["pendiente", "confirmado", "cancelado"]),
});

module.exports = {
  createReservationSchema,
  updateReservationStatusSchema,
};
