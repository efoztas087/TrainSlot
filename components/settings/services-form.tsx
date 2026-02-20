import { createServiceAction, toggleServiceAction, updateServiceAction } from "@/server/actions/services-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Service = {
  id: string;
  name: string;
  duration_minutes: number;
  price_cents: number | null;
  credits_cost: number;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  is_active: boolean;
};

export function ServicesForm({ services }: { services: Service[] }) {
  return (
    <div className="space-y-4">
      <Card className="space-y-4">
        <div>
          <h2 className="text-lg font-medium">Create service</h2>
          <p className="text-sm text-slate-600">Add the session types clients can book.</p>
        </div>

        <form action={createServiceAction} className="grid gap-3 sm:grid-cols-2">
          <input name="name" required placeholder="PT sessie 60 min" className="rounded-md border border-slate-300 px-3 py-2 sm:col-span-2" />
          <input type="number" name="duration_minutes" min={15} defaultValue={60} className="rounded-md border border-slate-300 px-3 py-2" />
          <input type="number" name="price_cents" min={0} placeholder="Price (cents, optional)" className="rounded-md border border-slate-300 px-3 py-2" />
          <input type="number" name="credits_cost" min={0} defaultValue={1} className="rounded-md border border-slate-300 px-3 py-2" />
          <input type="number" name="buffer_before_minutes" min={0} defaultValue={0} className="rounded-md border border-slate-300 px-3 py-2" />
          <input type="number" name="buffer_after_minutes" min={0} defaultValue={0} className="rounded-md border border-slate-300 px-3 py-2" />

          <div className="sm:col-span-2">
            <Button type="submit" className="w-full sm:w-fit">
              Add service
            </Button>
          </div>
        </form>
      </Card>

      <div className="space-y-3">
        {services.length === 0 ? (
          <Card>
            <p className="text-sm text-slate-600">No services yet. Add your first one above.</p>
          </Card>
        ) : (
          services.map((service) => (
            <Card key={service.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{service.name}</h3>
                <span className={`rounded-full px-2 py-1 text-xs ${service.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"}`}>
                  {service.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              <form action={updateServiceAction} className="grid gap-2 sm:grid-cols-3">
                <input type="hidden" name="service_id" value={service.id} />
                <input name="name" defaultValue={service.name} className="rounded-md border border-slate-300 px-3 py-2 sm:col-span-3" />
                <input type="number" name="duration_minutes" min={15} defaultValue={service.duration_minutes} className="rounded-md border border-slate-300 px-3 py-2" />
                <input type="number" name="price_cents" min={0} defaultValue={service.price_cents ?? undefined} placeholder="Price cents" className="rounded-md border border-slate-300 px-3 py-2" />
                <input type="number" name="credits_cost" min={0} defaultValue={service.credits_cost} className="rounded-md border border-slate-300 px-3 py-2" />
                <input type="number" name="buffer_before_minutes" min={0} defaultValue={service.buffer_before_minutes} className="rounded-md border border-slate-300 px-3 py-2" />
                <input type="number" name="buffer_after_minutes" min={0} defaultValue={service.buffer_after_minutes} className="rounded-md border border-slate-300 px-3 py-2" />

                <div className="sm:col-span-3">
                  <Button type="submit" variant="outline">
                    Save changes
                  </Button>
                </div>
              </form>

              <form action={toggleServiceAction}>
                <input type="hidden" name="service_id" value={service.id} />
                <input type="hidden" name="is_active" value={service.is_active ? "false" : "true"} />
                <Button type="submit">{service.is_active ? "Deactivate" : "Activate"}</Button>
              </form>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
