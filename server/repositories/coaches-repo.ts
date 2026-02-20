import { createSupabaseServerClient } from "@/server/supabase/server";

export async function getCoachById(coachId: string) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("coaches")
    .select(
      "id,display_name,slug,contact_email,location,description,accent_color,logo_url,timezone,min_notice_hours,cancellation_window_hours,max_future_days,default_buffer_minutes"
    )
    .eq("id", coachId)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load coach profile: ${error.message}`);
  }

  return data;
}
