"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Service = {
  id: string;
  name: string;
  duration_minutes: number;
  price_cents: number | null;
  credits_cost: number;
};

export function BookingStepper({ slug, services, initialServiceId }: { slug: string; services: Service[]; initialServiceId?: string }) {
  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState(initialServiceId || services[0]?.id || "");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");

  const selectedService = useMemo(() => services.find((service) => service.id === serviceId), [serviceId, services]);

  async function loadSlots() {
    const today = new Date();
    const from = format(today, "yyyy-MM-dd");
    const toDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
    const to = format(toDate, "yyyy-MM-dd");

    const response = await fetch(`/api/availability?slug=${slug}&serviceId=${serviceId}&from=${from}&to=${to}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to load slots.");
    }

    setSlots(data.slots);
  }

  async function submitBooking() {
    setSubmitting(true);
    setError(null);
    const response = await fetch("/api/bookings/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug,
        service_id: serviceId,
        start_at: selectedSlot,
        full_name: fullName,
        email,
        phone,
        note
      })
    });

    const data = await response.json();
    setSubmitting(false);

    if (!response.ok) {
      setError(data.error || "Could not create booking.");
      return;
    }

    window.location.href = `/${slug}/success?booking=${data.bookingId}`;
  }

  return (
    <Card className="space-y-4">
      <p className="text-sm text-slate-500">Step {step} of 4</p>

      {step === 1 && (
        <div className="space-y-3">
          <h2 className="text-lg font-medium">Choose service</h2>
          <div className="space-y-2">
            {services.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => setServiceId(service.id)}
                className={`w-full rounded-md border px-3 py-3 text-left ${serviceId === service.id ? "border-slate-900" : "border-slate-300"}`}
              >
                <p className="font-medium">{service.name}</p>
                <p className="text-sm text-slate-600">{service.duration_minutes} min · {service.credits_cost} credit(s)</p>
              </button>
            ))}
          </div>
          <Button
            type="button"
            onClick={async () => {
              await loadSlots();
              setStep(2);
            }}
            disabled={!serviceId}
          >
            Next: choose time
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <h2 className="text-lg font-medium">Choose time</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {slots.length === 0 ? (
              <p className="text-sm text-slate-600">No slots found for this period.</p>
            ) : (
              slots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => setSelectedSlot(slot)}
                  className={`rounded-md border px-3 py-2 text-sm ${selectedSlot === slot ? "border-slate-900" : "border-slate-300"}`}
                >
                  {new Date(slot).toLocaleString()}
                </button>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button type="button" onClick={() => setStep(3)} disabled={!selectedSlot}>
              Next: your details
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <h2 className="text-lg font-medium">Your details</h2>
          <input placeholder="Full name" value={fullName} onChange={(event) => setFullName(event.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2" />
          <input type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2" />
          <input placeholder="Phone (optional)" value={phone} onChange={(event) => setPhone(event.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2" />
          <textarea
            placeholder="Note (optional). Avoid medical details."
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            className="w-full rounded-md border border-slate-300 px-3 py-2"
          />
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button type="button" onClick={() => setStep(4)} disabled={!fullName || !email}>
              Review
            </Button>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-3">
          <h2 className="text-lg font-medium">Confirm booking</h2>
          <p className="text-sm text-slate-700">Service: {selectedService?.name}</p>
          <p className="text-sm text-slate-700">Time: {selectedSlot ? new Date(selectedSlot).toLocaleString() : "-"}</p>
          <p className="text-sm text-slate-700">Email: {email}</p>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(3)}>
              Back
            </Button>
            <Button type="button" onClick={submitBooking} disabled={submitting}>
              {submitting ? "Booking..." : "Confirm booking"}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
