import { createSupabaseServerClient } from "@/server/supabase/server";

export async function getPackagesByCoachId(coachId: string) {
  const supabase = createSupabaseServerClient();

  const [{ data: packages, error: packagesError }, { data: wallets, error: walletsError }, { data: clients, error: clientsError }] = await Promise.all([
    supabase
      .from("packages")
      .select("id,name,total_credits,price_cents,is_active,created_at")
      .eq("coach_id", coachId)
      .order("created_at", { ascending: false }),
    supabase
      .from("client_wallets")
      .select("id,client_id,package_id,credits_remaining,created_at")
      .eq("coach_id", coachId)
      .order("created_at", { ascending: false }),
    supabase.from("clients").select("id,full_name,email").eq("coach_id", coachId)
  ]);

  if (packagesError || walletsError || clientsError) {
    throw new Error(packagesError?.message || walletsError?.message || clientsError?.message || "Failed to load packages.");
  }

  return {
    packages: packages ?? [],
    wallets: wallets ?? [],
    clients: clients ?? []
  };
}
