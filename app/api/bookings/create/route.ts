import { NextResponse } from "next/server";
import { createBookingSchema } from "@/lib/zod/booking";
import { enforceBookingRateLimit } from "@/lib/rate-limit/booking-rate-limit";
import { createBooking } from "@/server/services/booking-service";
import { sendBookingConfirmationEmails } from "@/server/services/email-service";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createBookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid payload." }, { status: 400 });
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    enforceBookingRateLimit(`${ip}:${parsed.data.slug}`);

    const result = await createBooking(parsed.data);
    await sendBookingConfirmationEmails({
      bookingId: result.bookingId,
      cancelToken: result.cancelToken
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create booking.";
    if (message.toLowerCase().includes("too many")) {
      return NextResponse.json({ error: message }, { status: 429 });
    }
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
