import { z } from "zod";

export const createPackageSchema = z.object({
  name: z.string().min(2).max(120),
  total_credits: z.coerce.number().int().min(1).max(500),
  price_cents: z
    .string()
    .optional()
    .transform((value) => {
      if (!value || value.trim() === "") return null;
      const parsed = Number(value);
      return Number.isNaN(parsed) ? NaN : parsed;
    })
    .refine((value) => value === null || (Number.isInteger(value) && value >= 0), "Price must be positive cents.")
});

export const assignWalletSchema = z.object({
  client_id: z.string().uuid(),
  package_id: z.string().uuid(),
  credits_remaining: z.coerce.number().int().min(0).max(500)
});

export const addCreditsSchema = z.object({
  wallet_id: z.string().uuid(),
  delta: z.coerce.number().int().min(1).max(500)
});

export const markPaidSchema = z.object({
  booking_id: z.string().uuid()
});
