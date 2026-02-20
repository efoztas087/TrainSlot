import {
  createAvailabilityExceptionAction,
  createAvailabilityRuleAction,
  deleteAvailabilityExceptionAction,
  deleteAvailabilityRuleAction
} from "@/server/actions/availability-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Rule = {
  id: string;
  weekday: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
};

type Exception = {
  id: string;
  date: string;
  start_time: string;
  end_time: string;
  type: "BLOCK" | "EXTRA";
};

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function AvailabilityEditor({ rules, exceptions }: { rules: Rule[]; exceptions: Exception[] }) {
  return (
    <div className="space-y-4">
      <Card className="space-y-4">
        <div>
          <h2 className="text-lg font-medium">Weekly availability</h2>
          <p className="text-sm text-slate-600">Define recurring hours clients can book.</p>
        </div>

        <form action={createAvailabilityRuleAction} className="grid gap-3 sm:grid-cols-4">
          <select name="weekday" defaultValue="0" className="rounded-md border border-slate-300 px-3 py-2">
            {weekdays.map((weekday, index) => (
              <option key={weekday} value={index}>
                {weekday}
              </option>
            ))}
          </select>
          <input type="time" name="start_time" required className="rounded-md border border-slate-300 px-3 py-2" />
          <input type="time" name="end_time" required className="rounded-md border border-slate-300 px-3 py-2" />
          <Button type="submit">Add block</Button>
        </form>

        <div className="space-y-2">
          {rules.length === 0 ? (
            <p className="text-sm text-slate-600">No weekly rules yet.</p>
          ) : (
            rules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2">
                <p className="text-sm">
                  <span className="font-medium">{weekdays[rule.weekday]}</span> {rule.start_time.slice(0, 5)} - {rule.end_time.slice(0, 5)}
                </p>
                <form action={deleteAvailabilityRuleAction}>
                  <input type="hidden" name="rule_id" value={rule.id} />
                  <Button type="submit" variant="outline">
                    Remove
                  </Button>
                </form>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card className="space-y-4">
        <div>
          <h2 className="text-lg font-medium">Date exceptions</h2>
          <p className="text-sm text-slate-600">Block holidays or add extra slots for specific dates.</p>
        </div>

        <form action={createAvailabilityExceptionAction} className="grid gap-3 sm:grid-cols-5">
          <input type="date" name="date" required className="rounded-md border border-slate-300 px-3 py-2" />
          <input type="time" name="start_time" required className="rounded-md border border-slate-300 px-3 py-2" />
          <input type="time" name="end_time" required className="rounded-md border border-slate-300 px-3 py-2" />
          <select name="type" defaultValue="BLOCK" className="rounded-md border border-slate-300 px-3 py-2">
            <option value="BLOCK">Block</option>
            <option value="EXTRA">Extra</option>
          </select>
          <Button type="submit">Add exception</Button>
        </form>

        <div className="space-y-2">
          {exceptions.length === 0 ? (
            <p className="text-sm text-slate-600">No exceptions yet.</p>
          ) : (
            exceptions.map((exception) => (
              <div key={exception.id} className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2">
                <p className="text-sm">
                  <span className="font-medium">{exception.date}</span> {exception.start_time.slice(0, 5)} - {exception.end_time.slice(0, 5)} ({exception.type})
                </p>
                <form action={deleteAvailabilityExceptionAction}>
                  <input type="hidden" name="exception_id" value={exception.id} />
                  <Button type="submit" variant="outline">
                    Remove
                  </Button>
                </form>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
