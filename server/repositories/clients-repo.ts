import { createSupabaseServerClient } from "@/server/supabase/server";

export async function getClientsByCoachId(coachId: string) {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from("clients")
    .select("id,full_name,email,phone,created_at")
    .eq("coach_id", coachId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load clients: ${error.message}`);
  }

  return data ?? [];
}

export async function getClientDetails(coachId: string, clientId: string) {
  const supabase = createSupabaseServerClient();

  const [{ data: client, error: clientError }, { data: wallets, error: walletError }, { data: bookings, error: bookingsError }] = await Promise.all([
    supabase
      .from("clients")
      .select("id,full_name,email,phone,notes,created_at")
      .eq("coach_id", coachId)
      .eq("id", clientId)
      .maybeSingle(),
    supabase
      .from("client_wallets")
      .select("id,credits_remaining,created_at,package_id")
      .eq("coach_id", coachId)
      .eq("client_id", clientId)
      .order("created_at", { ascending: false }),
    supabase
      .from("bookings")
      .select("id,start_at,end_at,status,payment_status,credits_deducted,service_id")
      .eq("coach_id", coachId)
      .eq("client_id", clientId)
      .order("start_at", { ascending: false })
  ]);

  if (clientError || walletError || bookingsError) {
    throw new Error(clientError?.message || walletError?.message || bookingsError?.message || "Failed to load client details.");
  }

  if (!client) {
    return null;
  }

  return { client, wallets: wallets ?? [], bookings: bookings ?? [] };
}
