"use client";

import { AlertTriangle } from "lucide-react";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
        <main className="mx-auto grid min-h-[80vh] max-w-xl place-items-center">
          <section className="rounded-xl border border-white/10 bg-slate-950/80 p-6 text-center shadow-2xl">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-amber-300/25 bg-amber-300/10">
              <AlertTriangle className="h-5 w-5 text-amber-100" />
            </div>
            <h1 className="mt-5 text-2xl font-semibold">Astra could not load this cockpit.</h1>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              A production configuration or network dependency may be unavailable. Retry once, then review deployment logs.
            </p>
            <button
              className="mt-6 rounded-md bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950"
              onClick={reset}
              type="button"
            >
              Retry Astra
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
