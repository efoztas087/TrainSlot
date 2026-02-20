import { createHash } from "node:crypto";
import { createSupabaseAdminClient } from "@/server/supabase/admin";

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

async function applyCancellationByBookingId(bookingId: string) {
  const supabase = createSupabaseAdminClient();

  const { data: booking, error } = await supabase
    .from("bookings")
    .select("id,coach_id,client_id,start_at,status,credits_deducted,coaches!inner(cancellation_window_hours)")
    .eq("id", bookingId)
    .single();

  if (error || !booking) {
    throw new Error(error?.message || "Booking not found.");
  }

  if (booking.status !== "CONFIRMED") {
    return { status: booking.status, refunded: false };
  }

  const now = new Date();
  const startAt = new Date(booking.start_at);
  const cutoff = new Date(startAt.getTime() - booking.coaches.cancellation_window_hours * 60 * 60 * 1000);
  const isLate = now > cutoff;

  let refunded = false;

  if (!isLate && booking.credits_deducted > 0) {
    const { data: wallet } = await supabase
      .from("client_wallets")
      .select("id,credits_remaining")
      .eq("coach_id", booking.coach_id)
      .eq("client_id", booking.client_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (wallet) {
      await supabase
        .from("client_wallets")
        .update({ credits_remaining: wallet.credits_remaining + booking.credits_deducted })
        .eq("id", wallet.id);
      refunded = true;
    }
  }

  const status = isLate ? "LATE_CANCEL" : "CANCELLED";

  const { error: updateError } = await supabase
    .from("bookings")
    .update({ status, cancelled_at: now.toISOString() })
    .eq("id", booking.id);

  if (updateError) {
    throw new Error(`Failed to cancel booking: ${updateError.message}`);
  }

  await supabase.from("audit_events").insert({
    coach_id: booking.coach_id,
    actor: "SYSTEM",
    type: "BOOKING_CANCELLED",
    payload: { booking_id: booking.id, status, refunded }
  });

  return { status, refunded };
}

export async function cancelBookingByToken(token: string) {
  const supabase = createSupabaseAdminClient();
  const tokenHash = hashToken(token);

  const { data: booking, error } = await supabase
    .from("bookings")
    .select("id")
    .eq("cancel_token_hash", tokenHash)
    .maybeSingle();

  if (error || !booking) {
    throw new Error("Invalid cancellation link.");
  }

  return applyCancellationByBookingId(booking.id);
}

export async function cancelBookingByCoach(bookingId: string) {
  return applyCancellationByBookingId(bookingId);
}
