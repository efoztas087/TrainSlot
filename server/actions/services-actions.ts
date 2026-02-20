"use server";

import { revalidatePath } from "next/cache";
import { createServiceSchema, toggleServiceSchema, updateServiceSchema } from "@/lib/zod/service";
import { requireCoach } from "@/server/auth/guard";
import { createSupabaseServerClient } from "@/server/supabase/server";

export async function createServiceAction(formData: FormData) {
  const user = await requireCoach();

  const parsed = createServiceSchema.safeParse({
    name: formData.get("name"),
    duration_minutes: formData.get("duration_minutes"),
    price_cents: formData.get("price_cents"),
    credits_cost: formData.get("credits_cost"),
    buffer_before_minutes: formData.get("buffer_before_minutes"),
    buffer_after_minutes: formData.get("buffer_after_minutes")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid service input.");
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("services").insert({
    coach_id: user.id,
    ...parsed.data,
    is_active: true
  });

  if (error) {
    throw new Error(`Failed to create service: ${error.message}`);
  }

  revalidatePath("/dashboard/settings");
}

export async function updateServiceAction(formData: FormData) {
  await requireCoach();

  const parsed = updateServiceSchema.safeParse({
    service_id: formData.get("service_id"),
    name: formData.get("name"),
    duration_minutes: formData.get("duration_minutes"),
    price_cents: formData.get("price_cents"),
    credits_cost: formData.get("credits_cost"),
    buffer_before_minutes: formData.get("buffer_before_minutes"),
    buffer_after_minutes: formData.get("buffer_after_minutes")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid service update input.");
  }

  const { service_id, ...payload } = parsed.data;
  const supabase = createSupabaseServerClient();

  const { error } = await supabase.from("services").update(payload).eq("id", service_id);

  if (error) {
    throw new Error(`Failed to update service: ${error.message}`);
  }

  revalidatePath("/dashboard/settings");
}

export async function toggleServiceAction(formData: FormData) {
  await requireCoach();

  const parsed = toggleServiceSchema.safeParse({
    service_id: formData.get("service_id"),
    is_active: formData.get("is_active")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid service toggle input.");
  }

  const supabase = createSupabaseServerClient();

  const { error } = await supabase
    .from("services")
    .update({ is_active: parsed.data.is_active })
    .eq("id", parsed.data.service_id);

  if (error) {
    throw new Error(`Failed to toggle service: ${error.message}`);
  }

  revalidatePath("/dashboard/settings");
}
