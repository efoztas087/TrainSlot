import { saveBookingRulesAction } from "@/server/actions/settings-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type BookingRules = {
  min_notice_hours?: number;
  cancellation_window_hours?: number;
  max_future_days?: number;
  default_buffer_minutes?: number;
};

export function BookingRulesForm({ coach }: { coach: BookingRules | null }) {
  return (
    <Card className="space-y-4">
      <div>
        <h2 className="text-lg font-medium">Booking rules</h2>
        <p className="text-sm text-slate-600">Set notice and cancellation windows for new bookings.</p>
      </div>

      <form action={saveBookingRulesAction} className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1">
          <label className="text-sm font-medium">Minimum notice (hours)</label>
          <input
            type="number"
            min={0}
            name="min_notice_hours"
            defaultValue={coach?.min_notice_hours ?? 6}
            className="rounded-md border border-slate-300 px-3 py-2"
          />
        </div>

        <div className="grid gap-1">
          <label className="text-sm font-medium">Cancellation window (hours)</label>
          <input
            type="number"
            min={0}
            name="cancellation_window_hours"
            defaultValue={coach?.cancellation_window_hours ?? 12}
            className="rounded-md border border-slate-300 px-3 py-2"
          />
        </div>

        <div className="grid gap-1">
          <label className="text-sm font-medium">Max future booking days</label>
          <input
            type="number"
            min={1}
            name="max_future_days"
            defaultValue={coach?.max_future_days ?? 30}
            className="rounded-md border border-slate-300 px-3 py-2"
          />
        </div>

        <div className="grid gap-1">
          <label className="text-sm font-medium">Default buffer (minutes)</label>
          <input
            type="number"
            min={0}
            name="default_buffer_minutes"
            defaultValue={coach?.default_buffer_minutes ?? 0}
            className="rounded-md border border-slate-300 px-3 py-2"
          />
        </div>

        <div className="sm:col-span-2">
          <Button type="submit" className="w-full sm:w-fit">
            Save booking rules
          </Button>
        </div>
      </form>
    </Card>
  );
}
