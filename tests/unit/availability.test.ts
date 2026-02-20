import { describe, expect, it } from "vitest";
import { computeSlots } from "@/server/services/availability-service";

describe("computeSlots", () => {
  it("removes blocked exception time from weekly rule", () => {
    const slots = computeSlots({
      from: "2026-03-02",
      to: "2026-03-02",
      timezone: "Europe/Amsterdam",
      minNoticeHours: 0,
      maxFutureDays: 365,
      defaultBufferMinutes: 0,
      durationMinutes: 60,
      bufferBeforeMinutes: 0,
      bufferAfterMinutes: 0,
      rules: [{ weekday: 0, start_time: "09:00", end_time: "12:00", is_active: true }],
      exceptions: [{ date: "2026-03-02", start_time: "10:00", end_time: "11:00", type: "BLOCK" }],
      bookings: []
    });

    expect(slots.some((iso) => iso.includes("T09:00:00"))).toBe(true);
    expect(slots.some((iso) => iso.includes("T10:00:00"))).toBe(false);
  });

  it("filters out slots that overlap with confirmed bookings", () => {
    const slots = computeSlots({
      from: "2026-03-03",
      to: "2026-03-03",
      timezone: "Europe/Amsterdam",
      minNoticeHours: 0,
      maxFutureDays: 365,
      defaultBufferMinutes: 0,
      durationMinutes: 60,
      bufferBeforeMinutes: 0,
      bufferAfterMinutes: 0,
      rules: [{ weekday: 1, start_time: "09:00", end_time: "12:00", is_active: true }],
      exceptions: [],
      bookings: [{ start_at: "2026-03-03T09:30:00.000Z", end_at: "2026-03-03T10:30:00.000Z", status: "CONFIRMED" }]
    });

    expect(slots.some((iso) => iso === "2026-03-03T09:30:00.000Z")).toBe(false);
  });
});
