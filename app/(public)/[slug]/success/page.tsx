import Link from "next/link";
import { Card } from "@/components/ui/card";

export default function BookingSuccessPage({ params }: { params: { slug: string } }) {
  return (
    <main className="mx-auto max-w-xl p-4">
      <Card className="space-y-3">
        <h1 className="text-2xl font-semibold">Booking confirmed 🎉</h1>
        <p className="text-sm text-slate-700">We've sent a confirmation email with cancellation link and calendar invite details.</p>
        <p className="text-sm text-slate-600">You can now close this page.</p>
        <Link className="text-sm font-medium text-slate-900 underline" href={`/${params.slug}`}>
          Back to coach page
        </Link>
      </Card>
    </main>
  );
}
