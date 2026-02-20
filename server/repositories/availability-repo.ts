import { createSupabaseServerClient } from "@/server/supabase/server";

export async function getAvailabilityByCoachId(coachId: string) {
  const supabase = createSupabaseServerClient();

  const [{ data: rules, error: rulesError }, { data: exceptions, error: exceptionsError }] = await Promise.all([
    supabase
      .from("availability_rules")
      .select("id,weekday,start_time,end_time,is_active")
      .eq("coach_id", coachId)
      .order("weekday", { ascending: true })
      .order("start_time", { ascending: true }),
    supabase
      .from("availability_exceptions")
      .select("id,date,start_time,end_time,type")
      .eq("coach_id", coachId)
      .order("date", { ascending: true })
      .order("start_time", { ascending: true })
  ]);

  if (rulesError) {
    throw new Error(`Failed to fetch availability rules: ${rulesError.message}`);
  }

  if (exceptionsError) {
    throw new Error(`Failed to fetch availability exceptions: ${exceptionsError.message}`);
  }

  return { rules: rules ?? [], exceptions: exceptions ?? [] };
}

export async function getPublicAvailabilityContext(slug: string, serviceId: string) {
  const supabase = createSupabaseServerClient();

  const { data: coach, error: coachError } = await supabase
    .from("coaches")
    .select("id,slug,timezone,min_notice_hours,max_future_days,default_buffer_minutes")
    .eq("slug", slug)
    .eq("is_active", true)
    .is("deleted_at", null)
    .maybeSingle();

  if (coachError) {
    throw new Error(`Failed to load coach: ${coachError.message}`);
  }

  if (!coach) {
    return null;
  }

  const [{ data: service, error: serviceError }, { data: rules, error: rulesError }, { data: exceptions, error: exceptionsError }] = await Promise.all([
    supabase
      .from("services")
      .select("id,duration_minutes,buffer_before_minutes,buffer_after_minutes,is_active")
      .eq("id", serviceId)
      .eq("coach_id", coach.id)
      .maybeSingle(),
    supabase
      .from("availability_rules")
      .select("weekday,start_time,end_time,is_active")
      .eq("coach_id", coach.id)
      .eq("is_active", true),
    supabase
      .from("availability_exceptions")
      .select("date,start_time,end_time,type")
      .eq("coach_id", coach.id)
  ]);

  if (serviceError || rulesError || exceptionsError) {
    throw new Error(serviceError?.message || rulesError?.message || exceptionsError?.message || "Failed to load availability context.");
  }

  const { data: bookings, error: bookingsError } = await supabase
    .from("bookings")
    .select("start_at,end_at,status")
    .eq("coach_id", coach.id)
    .eq("status", "CONFIRMED");

  if (bookingsError) {
    throw new Error(`Failed to load bookings: ${bookingsError.message}`);
  }

  if (!service || !service.is_active) {
    return null;
  }

  return {
    coach,
    service,
    rules: rules ?? [],
    exceptions: exceptions ?? [],
    bookings: bookings ?? []
  };
}
