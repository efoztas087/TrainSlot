import { z } from "zod";

export const createBookingSchema = z.object({
  slug: z.string().min(3).max(40),
  service_id: z.string().uuid(),
  start_at: z.string().datetime(),
  full_name: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().max(30).optional(),
  note: z.string().max(600).optional()
});
