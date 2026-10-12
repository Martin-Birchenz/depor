const { z } = require("zod");

const createPelotaPaletaReservationSchema = z.object({
  facility_id: z.number().int().positive("La cancha es obligatoria"),
  reservation_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Formato de fecha inválido (YYYY-MM-DD)"),
  start_time: z.string().min(1, "Hora de inicio requerida"),
  end_time: z.string().min(1, "Hora de fin requerida"),
  client_name: z
    .string()
    .min(3, "El nombre del cliente debe tener al menos 3 caracteres"),
  client_phone: z.string().min(6, "Teléfono requerido"),
  member_id: z.number().int().positive().nullable().optional(),
  final_price: z.number().nonnegative(),
  payment_method: z
    .enum(["efectivo", "mercadopago", "pendiente"])
    .default("pendiente"),
  notes: z.string().max(150).optional().nullable(),
});

const createBuffetProductSchema = z.object({
  name: z.string().min(2, "El nombre del producto es obligatorio"),
  category: z.enum(["comida", "bebida", "kiosco", "otros"]).default("bebida"),
  cost_price: z.number().nonnegative().default(0),
  sale_price: z.number().positive("El precio de venta debe ser mayor a 0"),
  stock: z.number().int().nonnegative().default(0),
});

const createBuffetSaleSchema = z.object({
  payment_method: z
    .enum(["efectivo", "transferencia", "debito"])
    .default("efectivo"),
  notes: z.string().max(255).optional().nullable(),
  items: z
    .array(
      z.object({
        product_id: z.number().int().positive(),
        quantity: z.number().int().positive(),
        unit_price: z.number().positive(),
        subtotal: z.number().positive(),
      }),
    )
    .min(1, "La venta debe incluir al menos un producto"),
});

module.exports = {
  createPelotaPaletaReservationSchema,
  createBuffetProductSchema,
  createBuffetSaleSchema,
};
