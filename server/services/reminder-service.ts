import { createSupabaseAdminClient } from "@/server/supabase/admin";
import { sendBookingReminderEmail } from "@/server/services/email-service";

export async function runReminderSweep() {
  const supabase = createSupabaseAdminClient();
  const now = new Date();
  const from = new Date(now.getTime() + 23 * 60 * 60 * 1000).toISOString();
  const to = new Date(now.getTime() + 25 * 60 * 60 * 1000).toISOString();

  const { data: bookings, error } = await supabase
    .from("bookings")
    .select("id,start_at,coach_id,services!inner(name),clients!inner(email),coaches!inner(display_name)")
    .eq("status", "CONFIRMED")
    .gte("start_at", from)
    .lte("start_at", to);

  if (error) {
    throw new Error(`Failed to query reminder bookings: ${error.message}`);
  }

  let sent = 0;

  for (const booking of bookings ?? []) {
    const { data: alreadySent } = await supabase
      .from("audit_events")
      .select("id")
      .eq("coach_id", booking.coach_id)
      .eq("type", "REMINDER_SENT_24H")
      .contains("payload", { booking_id: booking.id })
      .maybeSingle();

    if (alreadySent) {
      continue;
    }

    await sendBookingReminderEmail({
      bookingId: booking.id,
      coachName: booking.coaches.display_name,
      serviceName: booking.services.name,
      clientEmail: booking.clients.email,
      startAt: booking.start_at
    });

    await supabase.from("audit_events").insert({
      coach_id: booking.coach_id,
      actor: "SYSTEM",
      type: "REMINDER_SENT_24H",
      payload: { booking_id: booking.id, at: now.toISOString() }
    });

    sent += 1;
  }

  return { scanned: (bookings ?? []).length, sent };
}
