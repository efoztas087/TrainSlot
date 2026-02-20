import { addDays, isAfter } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { dateKeyInTimezone, dateTimeInTzToUtc, overlaps, stepSlots, weekdayMonZero, type TimeInterval } from "@/lib/datetime/slots";
import { getPublicAvailabilityContext } from "@/server/repositories/availability-repo";

type Rule = { weekday: number; start_time: string; end_time: string; is_active?: boolean };
type Exception = { date: string; start_time: string; end_time: string; type: "BLOCK" | "EXTRA" };
type Booking = { start_at: string; end_at: string; status: "CONFIRMED" | "CANCELLED" | "LATE_CANCEL" };

export function computeSlots(input: {
  from: string;
  to: string;
  timezone: string;
  minNoticeHours: number;
  maxFutureDays: number;
  defaultBufferMinutes: number;
  durationMinutes: number;
  bufferBeforeMinutes: number;
  bufferAfterMinutes: number;
  rules: Rule[];
  exceptions: Exception[];
  bookings: Booking[];
}) {
  const now = new Date();
  const noticeCutoff = new Date(now.getTime() + input.minNoticeHours * 60 * 60 * 1000);
  const maxFutureCutoff = addDays(now, input.maxFutureDays);
  const startRange = new Date(`${input.from}T00:00:00.000Z`);
  const endRange = new Date(`${input.to}T23:59:59.999Z`);

  const effectiveBefore = input.bufferBeforeMinutes + input.defaultBufferMinutes;
  const effectiveAfter = input.bufferAfterMinutes + input.defaultBufferMinutes;

  const exceptionByDate = input.exceptions.reduce<Record<string, Exception[]>>((acc, exception) => {
    acc[exception.date] = [...(acc[exception.date] ?? []), exception];
    return acc;
  }, {});

  const busy = input.bookings
    .filter((booking) => booking.status === "CONFIRMED")
    .map((booking) => ({ start: new Date(booking.start_at), end: new Date(booking.end_at) }));

  const slotStarts: Date[] = [];

  for (let cursor = new Date(startRange); cursor <= endRange; cursor = addDays(cursor, 1)) {
    const dateKey = formatInTimeZone(cursor, input.timezone, "yyyy-MM-dd");
    const weekday = weekdayMonZero(cursor, input.timezone);

    const dailyIntervals: TimeInterval[] = [];

    for (const rule of input.rules.filter((item) => item.weekday === weekday && item.is_active !== false)) {
      dailyIntervals.push({
        start: dateTimeInTzToUtc(dateKey, rule.start_time, input.timezone),
        end: dateTimeInTzToUtc(dateKey, rule.end_time, input.timezone)
      });
    }

    for (const exception of exceptionByDate[dateKey] ?? []) {
      const exceptionInterval: TimeInterval = {
        start: dateTimeInTzToUtc(dateKey, exception.start_time, input.timezone),
        end: dateTimeInTzToUtc(dateKey, exception.end_time, input.timezone)
      };

      if (exception.type === "EXTRA") {
        dailyIntervals.push(exceptionInterval);
        continue;
      }

      const nextIntervals: TimeInterval[] = [];
      for (const interval of dailyIntervals) {
        if (!overlaps(interval, exceptionInterval)) {
          nextIntervals.push(interval);
          continue;
        }

        if (exceptionInterval.start > interval.start) {
          nextIntervals.push({ start: interval.start, end: exceptionInterval.start });
        }
        if (exceptionInterval.end < interval.end) {
          nextIntervals.push({ start: exceptionInterval.end, end: interval.end });
        }
      }
      dailyIntervals.length = 0;
      dailyIntervals.push(...nextIntervals);
    }

    for (const interval of dailyIntervals) {
      const starts = stepSlots(interval, input.durationMinutes + effectiveBefore + effectiveAfter, 15);
      for (const start of starts) {
        const sessionStart = new Date(start.getTime() + effectiveBefore * 60 * 1000);
        const sessionEnd = new Date(sessionStart.getTime() + input.durationMinutes * 60 * 1000);

        if (sessionStart < noticeCutoff || isAfter(sessionStart, maxFutureCutoff)) {
          continue;
        }

        const withBuffers: TimeInterval = {
          start,
          end: new Date(sessionEnd.getTime() + effectiveAfter * 60 * 1000)
        };

        const collides = busy.some((busyInterval) => overlaps(withBuffers, busyInterval));
        if (!collides) {
          slotStarts.push(sessionStart);
        }
      }
    }
  }

  const deduped = Array.from(new Set(slotStarts.map((date) => date.toISOString()))).sort();
  return deduped;
}

export async function getAvailableSlots(params: { slug: string; serviceId: string; from: string; to: string }) {
  const context = await getPublicAvailabilityContext(params.slug, params.serviceId);

  if (!context) {
    return [];
  }

  return computeSlots({
    from: params.from,
    to: params.to,
    timezone: context.coach.timezone,
    minNoticeHours: context.coach.min_notice_hours,
    maxFutureDays: context.coach.max_future_days,
    defaultBufferMinutes: context.coach.default_buffer_minutes,
    durationMinutes: context.service.duration_minutes,
    bufferBeforeMinutes: context.service.buffer_before_minutes,
    bufferAfterMinutes: context.service.buffer_after_minutes,
    rules: context.rules,
    exceptions: context.exceptions,
    bookings: context.bookings
  });
}

export function groupSlotsByDate(slots: string[], timezone: string) {
  return slots.reduce<Record<string, string[]>>((acc, iso) => {
    const dateKey = dateKeyInTimezone(new Date(iso), timezone);
    acc[dateKey] = [...(acc[dateKey] ?? []), iso];
    return acc;
  }, {});
}
