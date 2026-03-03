import { Cloud, Sun } from 'lucide-react';

export default function Loading() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center gap-6 rounded-3xl border border-slate-700/50 bg-slate-900/70 px-10 py-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <div className="relative h-24 w-24">
          <div className="absolute inset-0 flex items-center justify-center animate-pulse">
            <Cloud className="h-16 w-16 text-sky-300/40" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center animate-spin [animation-duration:3.2s]">
            <Sun className="h-8 w-8 text-amber-300" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <p className="text-lg text-slate-200">Ucitavanje</p>
          <span className="flex gap-1">
            <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-400 [animation-delay:0ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-400 [animation-delay:150ms]" />
            <span className="h-2 w-2 animate-bounce rounded-full bg-cyan-400 [animation-delay:300ms]" />
          </span>
        </div>

        <div className="h-1.5 w-56 overflow-hidden rounded-full bg-slate-800">
          <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-sky-500 to-cyan-400" />
        </div>
      </div>
    </div>
  );
}
