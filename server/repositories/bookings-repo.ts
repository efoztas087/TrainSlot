import { createSupabaseServerClient } from "@/server/supabase/server";

export async function getUpcomingBookingsByCoachId(coachId: string) {
  const supabase = createSupabaseServerClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("bookings")
    .select("id,start_at,end_at,status,payment_status,client_id,service_id")
    .eq("coach_id", coachId)
    .eq("status", "CONFIRMED")
    .gte("start_at", now)
    .order("start_at", { ascending: true })
    .limit(50);

  if (error) {
    throw new Error(`Failed to load bookings: ${error.message}`);
  }

  return data ?? [];
}
