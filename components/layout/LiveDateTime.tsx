"use client";

import { CalendarDays } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const DEFAULT_TIMEZONE = "America/Detroit";

type LiveDateTimeProps = {
  timezone?: string | null;
};

export function LiveDateTime({ timezone }: LiveDateTimeProps) {
  const [now, setNow] = useState<Date | null>(null);
  const resolvedTimezone = timezone || DEFAULT_TIMEZONE;

  useEffect(() => {
    setNow(new Date());

    let interval: ReturnType<typeof setInterval> | undefined;
    const timeout = setTimeout(
      () => {
        setNow(new Date());
        interval = setInterval(() => setNow(new Date()), 60_000);
      },
      60_000 - (Date.now() % 60_000),
    );

    return () => {
      clearTimeout(timeout);
      if (interval) clearInterval(interval);
    };
  }, [resolvedTimezone]);

  // The formatter only depends on the timezone; rebuilding it on every
  // minute tick (`now` change) would pay Intl construction cost each time.
  const formatter = useMemo(() => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    };

    try {
      return new Intl.DateTimeFormat("en-US", { ...options, timeZone: resolvedTimezone });
    } catch {
      return new Intl.DateTimeFormat("en-US", { ...options, timeZone: DEFAULT_TIMEZONE });
    }
  }, [resolvedTimezone]);

  const label = now ? formatter.format(now).replace(" at ", " · ") : "Synchronizing cockpit time";

  return (
    <div className="flex min-w-0 items-center gap-2 text-sm text-slate-400">
      <CalendarDays className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </div>
  );
}
