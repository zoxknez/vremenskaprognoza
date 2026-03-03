import Link from 'next/link';
import { CloudOff, Home, Map } from 'lucide-react';

const QUICK_LINKS = [
  { href: '/prognoza', label: 'Prognoza' },
  { href: '/kvalitet-vazduha', label: 'Kvalitet vazduha' },
  { href: '/statistika', label: 'Statistika' },
  { href: '/kontakt', label: 'Kontakt' },
];

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 px-4 py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-2xl rounded-3xl border border-slate-700/60 bg-slate-900/75 px-7 py-10 text-center shadow-2xl shadow-black/25 backdrop-blur-xl md:px-10">
        <div className="relative mx-auto mb-7 flex h-36 w-36 items-center justify-center rounded-full border border-slate-700/50 bg-slate-950/70">
          <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-br from-sky-500/10 to-cyan-500/10" />
          <CloudOff className="relative z-10 h-16 w-16 text-slate-300" />
        </div>

        <p className="mb-2 text-7xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-300 to-cyan-400">
          404
        </p>
        <h1 className="mb-3 text-3xl font-semibold text-white">Stranica nije pronadjena</h1>
        <p className="mx-auto mb-8 max-w-md text-slate-300">
          Adresa koju ste otvorili ne postoji ili je pomerena na drugo mesto.
        </p>

        <div className="mb-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-3 font-semibold text-white shadow-lg shadow-sky-500/20 transition-all hover:from-sky-400 hover:to-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
          >
            <Home className="h-4 w-4" />
            Pocetna stranica
          </Link>

          <Link
            href="/mapa"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700/70 bg-slate-900/70 px-5 py-3 font-semibold text-white transition-all hover:border-slate-500 hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
          >
            <Map className="h-4 w-4" />
            Otvori mapu
          </Link>
        </div>

        <div className="border-t border-slate-700/60 pt-6">
          <p className="mb-3 text-sm text-slate-400">Mozda trazite:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg border border-slate-700/60 bg-slate-950/50 px-3 py-1.5 text-sm text-slate-300 transition-all hover:border-slate-500 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/70"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
