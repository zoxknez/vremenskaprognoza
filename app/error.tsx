'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { AlertTriangle, Bug, Home, MessageSquare, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-red-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-xl rounded-3xl border border-slate-700/60 bg-slate-900/75 p-8 text-center shadow-2xl shadow-black/25 backdrop-blur-xl">
        <div className="relative mx-auto mb-7 h-20 w-20">
          <div className="absolute inset-0 animate-ping rounded-full bg-red-500/20" />
          <div className="relative flex h-full w-full items-center justify-center rounded-full border border-red-400/40 bg-red-500/15">
            <AlertTriangle className="h-10 w-10 text-red-300" />
          </div>
        </div>

        <h1 className="mb-3 text-3xl font-bold text-white">Nesto je poslo po zlu</h1>
        <p className="mb-4 text-slate-300">
          {error.message || 'Doslo je do neocekivane greske. Pokusajte ponovo.'}
        </p>

        {error.digest && (
          <details className="mb-6 rounded-xl border border-slate-700/60 bg-slate-950/60 p-3 text-left">
            <summary className="cursor-pointer text-sm text-slate-400 transition-colors hover:text-slate-200">
              Tehnicki detalji
            </summary>
            <pre className="mt-2 overflow-auto rounded-lg bg-slate-900/70 p-2 text-xs text-slate-400">
              Error ID: {error.digest}
            </pre>
          </details>
        )}

        <div className="mb-7 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-sky-500/20 transition-all hover:from-sky-400 hover:to-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
          >
            <RefreshCw className="h-4 w-4" />
            Pokusaj ponovo
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700/70 bg-slate-900/70 px-5 py-3 font-semibold text-white transition-all hover:border-slate-500 hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
          >
            <Home className="h-4 w-4" />
            Pocetna stranica
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
          <Link
            href="https://github.com/zoxknez/vremenskaprognoza/issues"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-slate-400 transition-colors hover:text-slate-200"
          >
            <Bug className="h-4 w-4" />
            Prijavi problem
          </Link>
          <Link
            href="/kontakt"
            className="inline-flex items-center gap-2 text-slate-400 transition-colors hover:text-slate-200"
          >
            <MessageSquare className="h-4 w-4" />
            Kontakt
          </Link>
        </div>
      </div>
    </div>
  );
}
