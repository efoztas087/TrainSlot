import { addMinutes } from "date-fns";
import { fromZonedTime, formatInTimeZone } from "date-fns-tz";

export type TimeInterval = { start: Date; end: Date };

export function dateTimeInTzToUtc(date: string, time: string, timezone: string) {
  return fromZonedTime(`${date}T${time}:00`, timezone);
}

export function overlaps(a: TimeInterval, b: TimeInterval) {
  return a.start < b.end && b.start < a.end;
}

export function stepSlots(interval: TimeInterval, durationMinutes: number, stepMinutes = 15) {
  const slots: Date[] = [];
  let cursor = new Date(interval.start);

  while (addMinutes(cursor, durationMinutes) <= interval.end) {
    slots.push(new Date(cursor));
    cursor = addMinutes(cursor, stepMinutes);
  }

  return slots;
}

export function dateKeyInTimezone(date: Date, timezone: string) {
  return formatInTimeZone(date, timezone, "yyyy-MM-dd");
}

export function weekdayMonZero(date: Date, timezone: string) {
  const isoDay = Number(formatInTimeZone(date, timezone, "i"));
  return isoDay - 1;
}
