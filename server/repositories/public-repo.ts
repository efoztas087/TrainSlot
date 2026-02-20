import { createSupabaseServerClient } from "@/server/supabase/server";

export async function getPublicCoachPage(slug: string) {
  const supabase = createSupabaseServerClient();

  const { data: coach, error: coachError } = await supabase
    .from("coaches")
    .select("id,slug,display_name,description,location,accent_color")
    .eq("slug", slug)
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (coachError || !coach) {
    return null;
  }

  const { data: services, error: servicesError } = await supabase
    .from("services")
    .select("id,name,duration_minutes,price_cents,credits_cost")
    .eq("coach_id", coach.id)
    .eq("is_active", true)
    .order("created_at", { ascending: true });

  if (servicesError) {
    throw new Error(`Failed to load services: ${servicesError.message}`);
  }

  return { coach, services: services ?? [] };
}
