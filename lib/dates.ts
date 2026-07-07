// Timezone-aware day/week boundaries. Server code must never use
// setHours(0,0,0,0) etc. directly: that yields the *server's* midnight, which
// shifts every daily window for users in other timezones (e.g. a UTC host
// rolls a Detroit user's day over at 8 PM). All helpers take an IANA timezone
// (from profiles.timezone) and return exact UTC instants.

const FALLBACK_TIMEZONE = "America/Detroit";

export function resolveTimeZone(timeZone: string | null | undefined): string {
  if (timeZone) {
    try {
      new Intl.DateTimeFormat("en-US", { timeZone });
      return timeZone;
    } catch {
      // invalid/free-text timezone from onboarding input — fall back
    }
  }
  return FALLBACK_TIMEZONE;
}

type DateParts = { year: number; month: number; day: number };

function getDateParts(date: Date, timeZone: string): DateParts {
  const [year, month, day] = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(date)
    .split("-")
    .map(Number);
  return { year, month, day };
}

function timeZoneOffsetMs(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {});

  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour) % 24,
    Number(parts.minute),
    Number(parts.second),
  );

  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

// UTC instant of local midnight for the given calendar date. Date.UTC absorbs
// day overflow/underflow, so callers can pass day + n; the double offset
// lookup corrects for DST transitions around midnight.
function zonedMidnight(parts: DateParts, timeZone: string): Date {
  const utcGuess = Date.UTC(parts.year, parts.month - 1, parts.day);
  const firstOffset = timeZoneOffsetMs(new Date(utcGuess), timeZone);
  let timestamp = utcGuess - firstOffset;
  const secondOffset = timeZoneOffsetMs(new Date(timestamp), timeZone);
  if (secondOffset !== firstOffset) timestamp = utcGuess - secondOffset;
  return new Date(timestamp);
}

export function startOfDayInTimeZone(now: Date, timeZone: string): Date {
  return zonedMidnight(getDateParts(now, timeZone), timeZone);
}

/** UTC instant of local midnight for a "YYYY-MM-DD" string in the given zone. */
export function midnightInTimeZone(dateString: string, timeZone: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  return zonedMidnight({ year, month, day }, timeZone);
}

export function addDaysInTimeZone(base: Date, days: number, timeZone: string): Date {
  const parts = getDateParts(base, timeZone);
  return zonedMidnight({ ...parts, day: parts.day + days }, timeZone);
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Sunday-based, matching the client-side getDay() logic used elsewhere. */
export function startOfWeekInTimeZone(now: Date, timeZone: string): Date {
  const weekday = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" }).format(now);
  const index = Math.max(0, WEEKDAYS.indexOf(weekday));
  const parts = getDateParts(now, timeZone);
  return zonedMidnight({ ...parts, day: parts.day - index }, timeZone);
}

/** YYYY-MM-DD of "today" as the user experiences it (for review_date lookups). */
export function dateStringInTimeZone(now: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}
