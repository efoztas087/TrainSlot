import { z } from "zod";

export const coachProfileSchema = z.object({
  display_name: z.string().min(2).max(80),
  slug: z
    .string()
    .min(3)
    .max(40)
    .transform((value) => value.toLowerCase().trim().replace(/\s+/g, "-"))
    .refine((value) => /^[a-z0-9-]+$/.test(value), "Slug can only contain lowercase letters, numbers, and dashes."),
  contact_email: z.string().email(),
  location: z.string().max(120).optional(),
  description: z.string().max(600).optional(),
  accent_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  logo_url: z
    .string()
    .url()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : v)),
  timezone: z.string().default("Europe/Amsterdam")
});

export const bookingRulesSchema = z.object({
  min_notice_hours: z.coerce.number().int().min(0).max(168),
  cancellation_window_hours: z.coerce.number().int().min(0).max(168),
  max_future_days: z.coerce.number().int().min(1).max(365),
  default_buffer_minutes: z.coerce.number().int().min(0).max(120)
});
