import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireCoach } from "@/server/auth/guard";
import { getUpcomingBookingsByCoachId } from "@/server/repositories/bookings-repo";

export default async function DashboardHomePage() {
  const user = await requireCoach();
  const bookings = await getUpcomingBookingsByCoachId(user.id);

  const today = new Date().toISOString().slice(0, 10);
  const todaysSessions = bookings.filter((booking) => booking.start_at.slice(0, 10) === today).length;
  const unpaid = bookings.filter((booking) => booking.payment_status === "UNPAID").length;

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-sm text-slate-500">Today's sessions</p>
          <p className="text-2xl font-semibold">{todaysSessions}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Upcoming</p>
          <p className="text-2xl font-semibold">{bookings.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Unpaid sessions</p>
          <p className="text-2xl font-semibold">{unpaid}</p>
        </Card>
        <Card>
          <p className="text-sm text-slate-500">Next session</p>
          <p className="text-sm font-medium">{bookings[0] ? new Date(bookings[0].start_at).toLocaleString() : "None"}</p>
        </Card>
      </div>
      <Card>
        <h2 className="mb-2 text-lg font-medium">Quick actions</h2>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/packages">
            <Button>Create package</Button>
          </Link>
          <Link href="/dashboard/clients">
            <Button variant="outline">View clients</Button>
          </Link>
          <Link href="/dashboard/calendar">
            <Button variant="outline">Open schedule</Button>
          </Link>
        </div>
      </Card>
    </section>
  );
}
