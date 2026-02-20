import { assignPackageWalletAction, createPackageAction } from "@/server/actions/packages-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireCoach } from "@/server/auth/guard";
import { getPackagesByCoachId } from "@/server/repositories/packages-repo";

export default async function PackagesPage() {
  const user = await requireCoach();
  const data = await getPackagesByCoachId(user.id);

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Packages</h1>

      <Card className="space-y-3">
        <h2 className="font-medium">Create package</h2>
        <form action={createPackageAction} className="grid gap-2 sm:grid-cols-3">
          <input name="name" placeholder="10 sessies" className="rounded-md border border-slate-300 px-3 py-2" required />
          <input name="total_credits" type="number" min={1} defaultValue={10} className="rounded-md border border-slate-300 px-3 py-2" required />
          <input name="price_cents" type="number" min={0} placeholder="Price cents (optional)" className="rounded-md border border-slate-300 px-3 py-2" />
          <div className="sm:col-span-3">
            <Button type="submit">Create package</Button>
          </div>
        </form>
      </Card>

      <Card className="space-y-3">
        <h2 className="font-medium">Assign package to client</h2>
        <form action={assignPackageWalletAction} className="grid gap-2 sm:grid-cols-3">
          <select name="client_id" className="rounded-md border border-slate-300 px-3 py-2" required>
            <option value="">Select client</option>
            {data.clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.full_name} ({client.email})
              </option>
            ))}
          </select>
          <select name="package_id" className="rounded-md border border-slate-300 px-3 py-2" required>
            <option value="">Select package</option>
            {data.packages.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.name} ({pkg.total_credits} credits)
              </option>
            ))}
          </select>
          <input name="credits_remaining" type="number" min={0} placeholder="Initial credits" className="rounded-md border border-slate-300 px-3 py-2" required />
          <div className="sm:col-span-3">
            <Button type="submit" variant="outline">
              Assign wallet
            </Button>
          </div>
        </form>
      </Card>

      <Card className="space-y-2">
        <h2 className="font-medium">Active wallets</h2>
        {data.wallets.length === 0 ? (
          <p className="text-sm text-slate-600">No wallets assigned yet.</p>
        ) : (
          data.wallets.map((wallet) => (
            <div key={wallet.id} className="rounded-md border border-slate-200 p-3 text-sm">
              Wallet {wallet.id.slice(0, 8)}... · Credits: {wallet.credits_remaining}
            </div>
          ))
        )}
      </Card>
    </section>
  );
}
