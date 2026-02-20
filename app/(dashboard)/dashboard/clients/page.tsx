import Link from "next/link";
import { Card } from "@/components/ui/card";
import { requireCoach } from "@/server/auth/guard";
import { getClientsByCoachId } from "@/server/repositories/clients-repo";

export default async function ClientsPage() {
  const user = await requireCoach();
  const clients = await getClientsByCoachId(user.id);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Clients</h1>
      {clients.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-600">No clients yet. They will appear after their first booking.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {clients.map((client) => (
            <Link key={client.id} href={`/dashboard/clients/${client.id}`}>
              <Card className="hover:bg-slate-50">
                <p className="font-medium">{client.full_name}</p>
                <p className="text-sm text-slate-600">{client.email}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
