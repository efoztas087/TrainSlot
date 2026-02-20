import { z } from "zod";

export const availabilityRuleSchema = z
  .object({
    weekday: z.coerce.number().int().min(0).max(6),
    start_time: z.string().regex(/^\d{2}:\d{2}$/),
    end_time: z.string().regex(/^\d{2}:\d{2}$/)
  })
  .refine((value) => value.start_time < value.end_time, "Start time must be before end time.");

export const availabilityExceptionSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    start_time: z.string().regex(/^\d{2}:\d{2}$/),
    end_time: z.string().regex(/^\d{2}:\d{2}$/),
    type: z.enum(["BLOCK", "EXTRA"])
  })
  .refine((value) => value.start_time < value.end_time, "Start time must be before end time.");

export const getSlotsSchema = z.object({
  slug: z.string().min(3),
  serviceId: z.string().uuid(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});
