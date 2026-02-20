import { createSupabaseAdminClient } from "@/server/supabase/admin";
import { ConsoleEmailProvider } from "@/server/email/provider";
import { ResendEmailProvider } from "@/server/email/resend-provider";
import { bookingConfirmationTemplate } from "@/server/email/templates/booking-confirmation";
import { coachNotificationTemplate } from "@/server/email/templates/coach-notification";
import { reminderTemplate } from "@/server/email/templates/reminder";

function getEmailProvider() {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL || "TrainSlot <noreply@trainslot.app>";
  if (!apiKey) return new ConsoleEmailProvider();
  return new ResendEmailProvider(apiKey, from);
}

export async function sendBookingConfirmationEmails(input: { bookingId: string; cancelToken: string }) {
  const supabase = createSupabaseAdminClient();
  const provider = getEmailProvider();

  const { data: booking, error } = await supabase
    .from("bookings")
    .select("id,start_at,payment_status,coaches!inner(slug,display_name,contact_email),services!inner(name),clients!inner(full_name,email)")
    .eq("id", input.bookingId)
    .single();

  if (error || !booking) {
    throw new Error(error?.message || "Booking not found for email notification.");
  }

  const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/bookings/cancel?token=${input.cancelToken}`;

  await provider.send({
    to: booking.clients.email,
    subject: "Booking confirmation",
    html: bookingConfirmationTemplate({
      coachName: booking.coaches.display_name,
      serviceName: booking.services.name,
      startAt: booking.start_at,
      cancelUrl
    })
  });

  await provider.send({
    to: booking.coaches.contact_email,
    subject: "New booking",
    html: coachNotificationTemplate({
      clientName: booking.clients.full_name,
      serviceName: booking.services.name,
      startAt: booking.start_at,
      paymentStatus: booking.payment_status
    })
  });
}

export async function sendBookingReminderEmail(input: {
  bookingId: string;
  coachName: string;
  serviceName: string;
  clientEmail: string;
  startAt: string;
}) {
  const provider = getEmailProvider();
  await provider.send({
    to: input.clientEmail,
    subject: "Reminder: training session tomorrow",
    html: reminderTemplate({
      coachName: input.coachName,
      serviceName: input.serviceName,
      startAt: input.startAt
    })
  });
}
