'use client';

import { RefreshCw, WifiOff } from 'lucide-react';

export default function OfflinePage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-lg rounded-3xl border border-slate-700/50 bg-slate-900/70 p-8 text-center shadow-2xl shadow-black/25 backdrop-blur-xl">
        <div className="mx-auto mb-7 flex h-24 w-24 items-center justify-center rounded-full border border-slate-700/50 bg-slate-950/80">
          <WifiOff className="h-12 w-12 text-slate-400" />
        </div>

        <h1 className="mb-3 text-3xl font-bold text-white">Trenutno ste offline</h1>
        <p className="mb-7 text-slate-300">
          Internet konekcija nije dostupna. Proverite mrezu i pokusajte ponovo.
        </p>

        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-6 py-3 font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:from-emerald-400 hover:to-green-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
        >
          <RefreshCw className="h-5 w-5" />
          Pokusaj ponovo
        </button>

        <div className="mt-8 rounded-2xl border border-slate-700/60 bg-slate-950/60 p-5 text-left">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-300">Dok ste offline</h2>
          <ul className="space-y-1.5 text-sm text-slate-400">
            <li>- Kesirani podaci mogu ostati dostupni.</li>
            <li>- Ranije otvorene stranice mogu raditi bez mreze.</li>
            <li>- Novi podaci stizu automatski kad se veza vrati.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
