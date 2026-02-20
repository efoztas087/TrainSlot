import { createSupabaseServerClient } from "@/server/supabase/server";

export async function getServicesByCoachId(coachId: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("services")
    .select("id,name,duration_minutes,price_cents,credits_cost,buffer_before_minutes,buffer_after_minutes,is_active")
    .eq("coach_id", coachId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Failed to load services: ${error.message}`);
  }

  return data;
}
