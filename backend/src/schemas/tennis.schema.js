const { z } = require("zod");

const createTennisReservationSchema = z.object({
  facility_id: z.number().int().positive("La cancha es obligatoria"),
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
  reservation_type: z
    .enum(["casual", "fijo_semanal", "clase_profesor", "evento"])
    .default("casual"),
  final_price: z.number().nonnegative(),
  payment_method: z
    .enum(["efectivo", "mercadopago", "pendiente"])
    .default("pendiente"),
  notes: z.string().max(150).optional().nullable(),
});

const createTennisGroupSchema = z.object({
  facility_id: z.number().int().positive("La cancha asignada es requerida"),
  name: z.string().min(3, "Nombre de grupo o categoría requerido"),
  day_of_week: z.enum([
    "lunes",
    "martes",
    "miercoles",
    "jueves",
    "viernes",
    "sabado",
    "domingo",
  ]),
  start_time: z.string().min(1, "Hora de inicio requerida"),
  end_time: z.string().min(1, "Hora de finalización requerida"),
  coach_name: z.string().optional().nullable(),
  monthly_fee: z.number().nonnegative().default(0),
});

const createTennisStudentSchema = z.object({
  group_id: z.number().int().positive("El grupo es obligatorio"),
  member_id: z.number().int().positive().nullable().optional(),
  full_name: z.string().min(3, "Nombre y apellido obligatorio"),
  phone: z.string().min(6, "Teléfono obligatorio"),
  email: z
    .string()
    .trim()
    .transform((val) => (val === "" ? null : val))
    .pipe(z.string().email("Email inválido").nullable().optional()),
  status: z.enum(["activo", "inactivo", "al_dia", "moroso"]).default("activo"),
});

module.exports = {
  createTennisReservationSchema,
  createTennisGroupSchema,
  createTennisStudentSchema,
};
