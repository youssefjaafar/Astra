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

  const label = useMemo(() => {
    if (!now) return "Synchronizing cockpit time";

    try {
      return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: resolvedTimezone,
      })
        .format(now)
        .replace(" at ", " · ");
    } catch {
      return new Intl.DateTimeFormat("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: DEFAULT_TIMEZONE,
      })
        .format(now)
        .replace(" at ", " · ");
    }
  }, [now, resolvedTimezone]);

  return (
    <div className="flex min-w-0 items-center gap-2 text-sm text-slate-400">
      <CalendarDays className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </div>
  );
}
