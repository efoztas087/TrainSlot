import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 p-6 text-center">
      <h1 className="text-3xl font-semibold">TrainSlot MVP</h1>
      <p className="text-slate-600">Booking links, credits, and reminders for personal trainers.</p>
      <div className="flex gap-3">
        <Link href="/login">
          <Button>Coach login</Button>
        </Link>
      </div>
    </main>
  );
}
