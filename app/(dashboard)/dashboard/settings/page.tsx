import { AvailabilityEditor } from "@/components/settings/availability-editor";
import { BookingRulesForm } from "@/components/settings/booking-rules-form";
import { CoachProfileForm } from "@/components/settings/coach-profile-form";
import { ServicesForm } from "@/components/settings/services-form";
import { requireCoach } from "@/server/auth/guard";
import { getAvailabilityByCoachId } from "@/server/repositories/availability-repo";
import { getCoachById } from "@/server/repositories/coaches-repo";
import { getServicesByCoachId } from "@/server/repositories/services-repo";

export default async function SettingsPage() {
  const user = await requireCoach();
  const [coach, services, availability] = await Promise.all([
    getCoachById(user.id),
    getServicesByCoachId(user.id),
    getAvailabilityByCoachId(user.id)
  ]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className="text-sm text-slate-600">Manage your profile, booking rules, services, and availability.</p>
      </div>

      <CoachProfileForm coach={coach} />
      <BookingRulesForm coach={coach} />
      <AvailabilityEditor rules={availability.rules} exceptions={availability.exceptions} />
      <ServicesForm services={services ?? []} />
    </section>
  );
}
