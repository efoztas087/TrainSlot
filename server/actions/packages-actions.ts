"use server";

import { revalidatePath } from "next/cache";
import { addCreditsSchema, assignWalletSchema, createPackageSchema } from "@/lib/zod/package";
import { requireCoach } from "@/server/auth/guard";
import { createSupabaseServerClient } from "@/server/supabase/server";

export async function createPackageAction(formData: FormData) {
  const user = await requireCoach();
  const parsed = createPackageSchema.safeParse({
    name: formData.get("name"),
    total_credits: formData.get("total_credits"),
    price_cents: formData.get("price_cents")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid package data.");
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("packages").insert({
    coach_id: user.id,
    ...parsed.data,
    is_active: true
  });

  if (error) {
    throw new Error(`Failed to create package: ${error.message}`);
  }

  revalidatePath("/dashboard/packages");
}

export async function assignPackageWalletAction(formData: FormData) {
  const user = await requireCoach();
  const parsed = assignWalletSchema.safeParse({
    client_id: formData.get("client_id"),
    package_id: formData.get("package_id"),
    credits_remaining: formData.get("credits_remaining")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid wallet assignment data.");
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("client_wallets").insert({
    coach_id: user.id,
    ...parsed.data
  });

  if (error) {
    throw new Error(`Failed to assign package: ${error.message}`);
  }

  revalidatePath("/dashboard/packages");
  revalidatePath(`/dashboard/clients/${parsed.data.client_id}`);
}

export async function addCreditsAction(formData: FormData) {
  await requireCoach();
  const parsed = addCreditsSchema.safeParse({
    wallet_id: formData.get("wallet_id"),
    delta: formData.get("delta")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid credits input.");
  }

  const supabase = createSupabaseServerClient();
  const { data: wallet, error: walletError } = await supabase
    .from("client_wallets")
    .select("id,credits_remaining,client_id")
    .eq("id", parsed.data.wallet_id)
    .maybeSingle();

  if (walletError || !wallet) {
    throw new Error(walletError?.message || "Wallet not found.");
  }

  const { error } = await supabase
    .from("client_wallets")
    .update({ credits_remaining: wallet.credits_remaining + parsed.data.delta })
    .eq("id", wallet.id);

  if (error) {
    throw new Error(`Failed to add credits: ${error.message}`);
  }

  revalidatePath("/dashboard/packages");
  revalidatePath(`/dashboard/clients/${wallet.client_id}`);
}
