const { z } = require("zod");

const sportTypes = [
  "futbol_5",
  "tenis",
  "padel",
  "pelota_paleta",
  "salon_parrilla",
  "natacion",
];

const pricingTypes = ["hourly", "event"];

const createFacilitySchema = z.object({
  name: z
    .string({ required_error: "Name is required" })
    .min(3, "Name must be at least 3 characters")
    .max(255)
    .trim(),
  sportType: z.enum(sportTypes, {
    errorMap: () => ({ message: "Sport type is invalid" }),
  }),
  pricingType: z.enum(pricingTypes).default("hourly"),
  defaultPrice: z
    .number({ required_error: "Default price is required" })
    .nonnegative("Default price must be a positive number"),
  memberDiscountPercent: z
    .number()
    .int("Member discount percent must be an integer")
    .min(0, "Member discount percent must be at least 0")
    .max(100, "Member discount percent must be at most 100")
    .default(0),
  isActive: z.boolean().default(true),
});

const updateFacilitySchema = createFacilitySchema.partial();

module.exports = { createFacilitySchema, updateFacilitySchema };
