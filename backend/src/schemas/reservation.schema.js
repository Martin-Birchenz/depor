const { z } = require("zod");

const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

const createReservationSchema = z.object({
  facilityId: z
    .number({ required_error: "Facility ID is required" })
    .int()
    .positive(),
  memberId: z.number().int().positive().optional().nullable(),
  clientName: z
    .string({ required_error: "Client name is required" })
    .min(2)
    .max(120)
    .trim(),
  clientPhone: z
    .string({ required_error: "Client phone is required" })
    .min(6)
    .max(150)
    .trim(),
  reservationDate: z
    .string({ required_error: "Reservation date is required" })
    .regex(timeRegex),
  startTime: z
    .string({ required_error: "Start time is required" })
    .regex(timeRegex),
  endTime: z
    .string({ required_error: "End time is required" })
    .regex(timeRegex),
  reservationType: z
    .enum(["casual", "evento", "fijo_semanal", "clase_profesor"])
    .default("casual"),
  paymentMethod: z
    .enum(["efectivo", "mercadopago", "pendiente"])
    .default("pendiente"),
  notes: z.string().max(45).optional().nullable(),
});

const updateReservationStatusSchema = z.object({
  status: z.enum(["confirmada", "cancelada", "completada"]),
  paymentMethod: z.enum(["efectivo", "mercadopago", "pendiente"]).optional(),
});

module.exports = {
  createReservationSchema,
  updateReservationStatusSchema,
};
