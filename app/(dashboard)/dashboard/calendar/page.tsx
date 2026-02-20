import { cancelBookingAsCoachAction, markBookingPaidAction } from "@/server/actions/bookings-actions";
import { requireCoach } from "@/server/auth/guard";
import { getUpcomingBookingsByCoachId } from "@/server/repositories/bookings-repo";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default async function CalendarPage() {
  const user = await requireCoach();
  const bookings = await getUpcomingBookingsByCoachId(user.id);

  const grouped = bookings.reduce<Record<string, typeof bookings>>((acc, booking) => {
    const key = booking.start_at.slice(0, 10);
    acc[key] = [...(acc[key] ?? []), booking];
    return acc;
  }, {});

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Schedule</h1>
      {Object.keys(grouped).length === 0 ? (
        <Card>
          <p className="text-sm text-slate-600">No upcoming bookings yet.</p>
        </Card>
      ) : (
        Object.entries(grouped).map(([date, dayBookings]) => (
          <Card key={date} className="space-y-2">
            <h2 className="text-lg font-medium">{date}</h2>
            {dayBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between rounded-md border border-slate-200 p-3">
                <div>
                  <p className="text-sm font-medium">{new Date(booking.start_at).toLocaleTimeString()} - {new Date(booking.end_at).toLocaleTimeString()}</p>
                  <p className="text-xs text-slate-500">Payment: {booking.payment_status}</p>
                </div>
                {booking.payment_status === "UNPAID" ? (
                  <div className="flex gap-2">
                    <form action={markBookingPaidAction}>
                      <input type="hidden" name="booking_id" value={booking.id} />
                      <Button type="submit" variant="outline">
                        Mark paid
                      </Button>
                    </form>
                    <form action={cancelBookingAsCoachAction}>
                      <input type="hidden" name="booking_id" value={booking.id} />
                      <Button type="submit" variant="outline">
                        Cancel
                      </Button>
                    </form>
                  </div>
                ) : (
                  <form action={cancelBookingAsCoachAction}>
                    <input type="hidden" name="booking_id" value={booking.id} />
                    <Button type="submit" variant="outline">
                      Cancel
                    </Button>
                  </form>
                )}
              </div>
            ))}
          </Card>
        ))
      )}
    </section>
  );
}
