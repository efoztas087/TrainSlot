import { NextResponse } from "next/server";
import { cancelBookingByToken } from "@/server/services/cancellation-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token." }, { status: 400 });
  }

  try {
    const result = await cancelBookingByToken(token);
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Cancellation failed." },
      { status: 400 }
    );
  }
}
