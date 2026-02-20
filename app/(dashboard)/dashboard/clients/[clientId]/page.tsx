import { addCreditsAction } from "@/server/actions/packages-actions";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireCoach } from "@/server/auth/guard";
import { getClientDetails } from "@/server/repositories/clients-repo";
import { notFound } from "next/navigation";

export default async function ClientDetailPage({ params }: { params: { clientId: string } }) {
  const user = await requireCoach();
  const details = await getClientDetails(user.id, params.clientId);

  if (!details) {
    notFound();
  }

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">{details.client.full_name}</h1>
      <Card>
        <p className="text-sm text-slate-700">Email: {details.client.email}</p>
        <p className="text-sm text-slate-700">Phone: {details.client.phone || "-"}</p>
      </Card>

      <Card className="space-y-2">
        <h2 className="font-medium">Wallets</h2>
        {details.wallets.length === 0 ? (
          <p className="text-sm text-slate-600">No package assigned yet.</p>
        ) : (
          details.wallets.map((wallet) => (
            <div key={wallet.id} className="rounded-md border border-slate-200 p-3">
              <p className="text-sm">Credits remaining: {wallet.credits_remaining}</p>
              <form action={addCreditsAction} className="mt-2 flex items-center gap-2">
                <input type="hidden" name="wallet_id" value={wallet.id} />
                <input type="number" min={1} defaultValue={1} name="delta" className="w-24 rounded-md border border-slate-300 px-2 py-1 text-sm" />
                <Button type="submit" variant="outline">
                  Add credits
                </Button>
              </form>
            </div>
          ))
        )}
      </Card>

      <Card className="space-y-2">
        <h2 className="font-medium">Booking history</h2>
        {details.bookings.length === 0 ? (
          <p className="text-sm text-slate-600">No bookings yet.</p>
        ) : (
          details.bookings.map((booking) => (
            <div key={booking.id} className="rounded-md border border-slate-200 p-3 text-sm">
              {new Date(booking.start_at).toLocaleString()} - {booking.status} - {booking.payment_status}
            </div>
          ))
        )}
      </Card>
    </section>
  );
}
