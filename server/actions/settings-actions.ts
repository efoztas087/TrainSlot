"use server";

import { revalidatePath } from "next/cache";
import { coachProfileSchema, bookingRulesSchema } from "@/lib/zod/coach";
import { requireCoach } from "@/server/auth/guard";
import { createSupabaseServerClient } from "@/server/supabase/server";

export async function saveCoachProfileAction(formData: FormData) {
  const user = await requireCoach();
  const parsed = coachProfileSchema.safeParse({
    display_name: formData.get("display_name"),
    slug: formData.get("slug"),
    contact_email: formData.get("contact_email"),
    location: formData.get("location") || undefined,
    description: formData.get("description") || undefined,
    accent_color: formData.get("accent_color") || undefined,
    logo_url: formData.get("logo_url") || undefined,
    timezone: formData.get("timezone") || "Europe/Amsterdam"
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid coach profile input.");
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("coaches").upsert(
    {
      id: user.id,
      ...parsed.data,
      is_active: true
    },
    { onConflict: "id" }
  );

  if (error) {
    if (error.message.toLowerCase().includes("slug")) {
      throw new Error("This booking slug is already in use.");
    }
    throw new Error(`Failed to save coach profile: ${error.message}`);
  }

  revalidatePath("/dashboard/settings");
}

export async function saveBookingRulesAction(formData: FormData) {
  const user = await requireCoach();
  const parsed = bookingRulesSchema.safeParse({
    min_notice_hours: formData.get("min_notice_hours"),
    cancellation_window_hours: formData.get("cancellation_window_hours"),
    max_future_days: formData.get("max_future_days"),
    default_buffer_minutes: formData.get("default_buffer_minutes")
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Invalid booking rules input.");
  }

  const supabase = createSupabaseServerClient();
  const { error } = await supabase.from("coaches").upsert(
    {
      id: user.id,
      ...parsed.data
    },
    { onConflict: "id" }
  );

  if (error) {
    throw new Error(`Failed to save booking rules: ${error.message}`);
  }

  revalidatePath("/dashboard/settings");
}
