import { saveCoachProfileAction } from "@/server/actions/settings-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type CoachProfile = {
  display_name?: string;
  slug?: string;
  contact_email?: string;
  location?: string | null;
  description?: string | null;
  accent_color?: string | null;
  logo_url?: string | null;
  timezone?: string;
};

export function CoachProfileForm({ coach }: { coach: CoachProfile | null }) {
  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-medium">Coach profile</h2>
        <p className="text-sm text-slate-600">This controls your public booking page.</p>
      </div>

      <form action={saveCoachProfileAction} className="grid gap-4">
        <div className="grid gap-1">
          <label className="text-sm font-medium">Display name</label>
          <input name="display_name" defaultValue={coach?.display_name ?? ""} required className="rounded-md border border-slate-300 px-3 py-2" />
        </div>

        <div className="grid gap-1">
          <label className="text-sm font-medium">Booking slug</label>
          <input name="slug" defaultValue={coach?.slug ?? ""} required className="rounded-md border border-slate-300 px-3 py-2" placeholder="jan-pt" />
        </div>

        <div className="grid gap-1">
          <label className="text-sm font-medium">Contact email</label>
          <input
            type="email"
            name="contact_email"
            defaultValue={coach?.contact_email ?? ""}
            required
            className="rounded-md border border-slate-300 px-3 py-2"
          />
        </div>

        <div className="grid gap-1 sm:grid-cols-2 sm:gap-4">
          <div className="grid gap-1">
            <label className="text-sm font-medium">Location (optional)</label>
            <input name="location" defaultValue={coach?.location ?? ""} className="rounded-md border border-slate-300 px-3 py-2" />
          </div>
          <div className="grid gap-1">
            <label className="text-sm font-medium">Timezone</label>
            <input name="timezone" defaultValue={coach?.timezone ?? "Europe/Amsterdam"} className="rounded-md border border-slate-300 px-3 py-2" />
          </div>
        </div>

        <div className="grid gap-1">
          <label className="text-sm font-medium">Description (optional)</label>
          <textarea
            name="description"
            defaultValue={coach?.description ?? ""}
            rows={4}
            className="rounded-md border border-slate-300 px-3 py-2"
          />
        </div>

        <div className="grid gap-1 sm:grid-cols-2 sm:gap-4">
          <div className="grid gap-1">
            <label className="text-sm font-medium">Accent color (hex)</label>
            <input name="accent_color" defaultValue={coach?.accent_color ?? ""} className="rounded-md border border-slate-300 px-3 py-2" placeholder="#0f172a" />
          </div>
          <div className="grid gap-1">
            <label className="text-sm font-medium">Logo URL</label>
            <input name="logo_url" defaultValue={coach?.logo_url ?? ""} className="rounded-md border border-slate-300 px-3 py-2" />
          </div>
        </div>

        <Button type="submit" className="w-full sm:w-fit">
          Save profile
        </Button>
      </form>
    </Card>
  );
}
