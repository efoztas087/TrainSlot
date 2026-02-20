"use server";

import { revalidatePath } from "next/cache";
import { availabilityExceptionSchema, availabilityRuleSchema } from "@/lib/zod/availability";
import { requireCoach } from "@/server/auth/guard";
import { createSupabaseServerClient } from "@/server/supabase/server";

export async function createAvailabilityRuleAction(formData: FormData) {
  const user = await requireCoach();
  const parsed = availabilityRuleSchema.safeParse({
    weekday: formData.get("weekday"),
    start_time: formData.get("start_time"),
    end_time: formData.get("end_time")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid availability rule input.");
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("availability_rules").insert({
    coach_id: user.id,
    ...parsed.data,
    is_active: true
  });

  if (error) {
    throw new Error(`Failed to create availability rule: ${error.message}`);
  }

  revalidatePath("/dashboard/settings");
}

export async function deleteAvailabilityRuleAction(formData: FormData) {
  await requireCoach();
  const id = String(formData.get("rule_id") || "");
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("availability_rules").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete availability rule: ${error.message}`);
  }

  revalidatePath("/dashboard/settings");
}

export async function createAvailabilityExceptionAction(formData: FormData) {
  const user = await requireCoach();
  const parsed = availabilityExceptionSchema.safeParse({
    date: formData.get("date"),
    start_time: formData.get("start_time"),
    end_time: formData.get("end_time"),
    type: formData.get("type")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid availability exception input.");
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("availability_exceptions").insert({
    coach_id: user.id,
    ...parsed.data
  });

  if (error) {
    throw new Error(`Failed to create availability exception: ${error.message}`);
  }

  revalidatePath("/dashboard/settings");
}

export async function deleteAvailabilityExceptionAction(formData: FormData) {
  await requireCoach();
  const id = String(formData.get("exception_id") || "");
  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("availability_exceptions").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete availability exception: ${error.message}`);
  }

  revalidatePath("/dashboard/settings");
}
