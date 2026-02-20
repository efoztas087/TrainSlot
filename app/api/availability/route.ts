import { NextResponse } from "next/server";
import { getSlotsSchema } from "@/lib/zod/availability";
import { getAvailableSlots } from "@/server/services/availability-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = getSlotsSchema.safeParse({
    slug: searchParams.get("slug"),
    serviceId: searchParams.get("serviceId"),
    from: searchParams.get("from"),
    to: searchParams.get("to")
  });

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid params." }, { status: 400 });
  }

  const slots = await getAvailableSlots(parsed.data);
  return NextResponse.json({ slots });
}
