import { z } from "zod";

export const createServiceSchema = z.object({
  name: z.string().min(2).max(120),
  duration_minutes: z.coerce.number().int().min(15).max(240),
  price_cents: z
    .string()
    .optional()
    .transform((value) => {
      if (!value || value.trim() === "") return null;
      const parsed = Number(value);
      return Number.isNaN(parsed) ? NaN : parsed;
    })
    .refine((value) => value === null || (Number.isInteger(value) && value >= 0), "Price must be a positive integer in cents."),
  credits_cost: z.coerce.number().int().min(0).max(20),
  buffer_before_minutes: z.coerce.number().int().min(0).max(120),
  buffer_after_minutes: z.coerce.number().int().min(0).max(120)
});

export const updateServiceSchema = createServiceSchema.extend({
  service_id: z.string().uuid()
});

export const toggleServiceSchema = z.object({
  service_id: z.string().uuid(),
  is_active: z
    .string()
    .transform((value) => value === "true")
});
