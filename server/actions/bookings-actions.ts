"use server";

import { revalidatePath } from "next/cache";
import { markPaidSchema } from "@/lib/zod/package";
import { requireCoach } from "@/server/auth/guard";
import { createSupabaseServerClient } from "@/server/supabase/server";
import { cancelBookingByCoach } from "@/server/services/cancellation-service";

export async function markBookingPaidAction(formData: FormData) {
  const user = await requireCoach();
  const parsed = markPaidSchema.safeParse({ booking_id: formData.get("booking_id") });

  if (!parsed.success) {
    throw new Error("Invalid booking id.");
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase
    .from("bookings")
    .update({ payment_status: "PAID" })
    .eq("id", parsed.data.booking_id)
    .eq("coach_id", user.id);

  if (error) {
    throw new Error(`Failed to mark booking paid: ${error.message}`);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/calendar");
}

export async function cancelBookingAsCoachAction(formData: FormData) {
  const user = await requireCoach();
  const parsed = markPaidSchema.safeParse({ booking_id: formData.get("booking_id") });

  if (!parsed.success) {
    throw new Error("Invalid booking id.");
  }

  const supabase = createSupabaseServerClient();
  const { data: booking, error } = await supabase
    .from("bookings")
    .select("id")
    .eq("id", parsed.data.booking_id)
    .eq("coach_id", user.id)
    .maybeSingle();

  if (error || !booking) {
    throw new Error("Booking not found.");
  }

  await cancelBookingByCoach(booking.id);

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/calendar");
}
