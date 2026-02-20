import { addMinutes } from "date-fns";
import { createSupabaseAdminClient } from "@/server/supabase/admin";
import { generateCancelToken } from "@/lib/security/tokens";
import { applyCreditsDeduction } from "@/server/services/credits-service";

type CreateBookingInput = {
  slug: string;
  service_id: string;
  start_at: string;
  full_name: string;
  email: string;
  phone?: string;
  note?: string;
};

function overlaps(startA: Date, endA: Date, startB: Date, endB: Date) {
  return startA < endB && startB < endA;
}

export async function createBooking(input: CreateBookingInput) {
  const supabase = createSupabaseAdminClient();

  const { data: coach, error: coachError } = await supabase
    .from("coaches")
    .select("id,min_notice_hours,max_future_days")
    .eq("slug", input.slug)
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (coachError || !coach) {
    throw new Error("Coach not found.");
  }

  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("id,duration_minutes,credits_cost,is_active")
    .eq("id", input.service_id)
    .eq("coach_id", coach.id)
    .maybeSingle();

  if (serviceError || !service || !service.is_active) {
    throw new Error("Service not available.");
  }

  const startAt = new Date(input.start_at);
  const endAt = addMinutes(startAt, service.duration_minutes);

  const now = new Date();
  const noticeCutoff = new Date(now.getTime() + coach.min_notice_hours * 60 * 60 * 1000);
  const maxFutureCutoff = new Date(now.getTime() + coach.max_future_days * 24 * 60 * 60 * 1000);

  if (startAt < noticeCutoff || startAt > maxFutureCutoff) {
    throw new Error("This slot is outside booking rules.");
  }

  const { data: clashes, error: clashError } = await supabase
    .from("bookings")
    .select("start_at,end_at")
    .eq("coach_id", coach.id)
    .eq("status", "CONFIRMED")
    .lt("start_at", endAt.toISOString())
    .gt("end_at", startAt.toISOString());

  if (clashError) {
    throw new Error(`Unable to validate slot: ${clashError.message}`);
  }

  if ((clashes ?? []).some((booking) => overlaps(startAt, endAt, new Date(booking.start_at), new Date(booking.end_at)))) {
    throw new Error("Selected slot is no longer available.");
  }

  const { data: existingClient } = await supabase
    .from("clients")
    .select("id")
    .eq("coach_id", coach.id)
    .eq("email", input.email)
    .maybeSingle();

  let clientId = existingClient?.id;

  if (!clientId) {
    const { data: newClient, error: clientError } = await supabase
      .from("clients")
      .insert({
        coach_id: coach.id,
        full_name: input.full_name,
        email: input.email,
        phone: input.phone,
        notes: input.note
      })
      .select("id")
      .single();

    if (clientError || !newClient) {
      throw new Error(`Unable to create client: ${clientError?.message || "unknown"}`);
    }

    clientId = newClient.id;
  }

  const { raw, hash } = generateCancelToken();

  const { data: wallet } = await supabase
    .from("client_wallets")
    .select("id,credits_remaining")
    .eq("coach_id", coach.id)
    .eq("client_id", clientId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  let creditsDeducted = 0;
  let paymentStatus: "PAID" | "UNPAID" = "UNPAID";

  if (wallet) {
    const result = applyCreditsDeduction({
      creditsRemaining: wallet.credits_remaining,
      creditsCost: service.credits_cost
    });

    if (result.nextCredits !== wallet.credits_remaining) {
      const { error: walletError } = await supabase
        .from("client_wallets")
        .update({ credits_remaining: result.nextCredits })
        .eq("id", wallet.id);

      if (walletError) {
        throw new Error(`Unable to deduct credits: ${walletError.message}`);
      }
    }

    creditsDeducted = result.creditsDeducted;
    paymentStatus = result.paymentStatus;
  }

  const { data: booking, error: bookingError } = await supabase
    .from("bookings")
    .insert({
      coach_id: coach.id,
      client_id: clientId,
      service_id: service.id,
      start_at: startAt.toISOString(),
      end_at: endAt.toISOString(),
      status: "CONFIRMED",
      payment_status: paymentStatus,
      credits_deducted: creditsDeducted,
      cancel_token_hash: hash
    })
    .select("id,start_at")
    .single();

  if (bookingError || !booking) {
    throw new Error(`Unable to create booking: ${bookingError?.message || "unknown"}`);
  }

  await supabase.from("audit_events").insert({
    coach_id: coach.id,
    actor: "CLIENT",
    type: "BOOKING_CREATED",
    payload: { booking_id: booking.id, email: input.email }
  });

  return {
    bookingId: booking.id,
    cancelToken: raw,
    startAt: booking.start_at,
    paymentStatus
  };
}
