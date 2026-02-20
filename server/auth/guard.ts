import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/server/supabase/server";

export async function requireCoach() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return user;
}
