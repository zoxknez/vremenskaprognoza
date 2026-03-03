"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Code2,
  Coffee,
  ExternalLink,
  Github,
  Globe,
  Heart,
  Sparkles,
  Zap,
} from "lucide-react";

const TECH_STACK = [
  { name: "Next.js 16", accent: "from-slate-600 to-slate-800" },
  { name: "React", accent: "from-sky-500 to-cyan-600" },
  { name: "TypeScript", accent: "from-blue-500 to-blue-700" },
  { name: "Tailwind CSS", accent: "from-teal-500 to-cyan-600" },
  { name: "Mapbox GL", accent: "from-indigo-500 to-sky-700" },
  { name: "Framer Motion", accent: "from-rose-500 to-pink-600" },
  { name: "OpenWeather", accent: "from-orange-500 to-amber-600" },
  { name: "WAQI API", accent: "from-emerald-500 to-green-700" },
];

export default function OAutoruPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 pt-24 pb-16">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-36 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="container relative z-10 mx-auto max-w-5xl px-4">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm text-cyan-300 transition-colors hover:text-cyan-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Nazad na pocetnu
        </Link>

        <motion.header
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-10 text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-sky-400/25 bg-sky-500/10 px-4 py-2 text-sm text-sky-300">
            <Sparkles className="h-4 w-4" />
            Upoznaj autora
          </div>
          <h1 className="mb-3 text-4xl font-bold text-white md:text-5xl">O autoru</h1>
          <p className="mx-auto max-w-2xl text-slate-300">
            Fokus je na prakticnim aplikacijama koje su brze, jasne i korisne u svakodnevici.
          </p>
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="glass-effect mb-8 rounded-2xl p-8 shadow-xl shadow-black/20"
        >
          <div className="flex flex-col items-center gap-8 md:flex-row">
            <div className="relative">
              <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-blue-600 text-3xl font-bold text-white shadow-lg shadow-sky-500/25">
                OOO
              </div>
              <div className="absolute -bottom-1 -right-1 flex h-10 w-10 items-center justify-center rounded-full border-4 border-slate-900 bg-emerald-500">
                <Coffee className="h-4 w-4 text-white" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <h2 className="mb-1 text-3xl font-bold text-white">o0o0o0o</h2>
              <p className="mb-4 font-medium text-sky-300">Full Stack Developer</p>
              <p className="mb-6 max-w-2xl text-slate-300">
                Razvijam web aplikacije sa naglaskom na UX, performanse i pouzdane API integracije.
              </p>

              <div className="flex flex-wrap justify-center gap-3 md:justify-start">
                <Link
                  href="https://github.com/zoxknez"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-700/70 bg-slate-900/60 px-5 py-2.5 font-medium text-white transition-all hover:border-slate-500 hover:bg-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70"
                >
                  <Github className="h-5 w-5" />
                  GitHub
                </Link>
                <Link
                  href="https://mojportfolio.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 px-5 py-2.5 font-medium text-white shadow-lg shadow-sky-500/20 transition-all hover:from-sky-400 hover:to-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
                >
                  <Globe className="h-5 w-5" />
                  Portfolio
                </Link>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.12 }}
          className="glass-effect mb-8 rounded-2xl p-8"
        >
          <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-white">
            <Code2 className="h-5 w-5 text-sky-300" />
            O projektu
          </h3>
          <p className="mb-4 leading-relaxed text-slate-300">
            <span className="font-semibold text-white">VremeVazduh</span> je aplikacija za pracenje
            vremenskih uslova i kvaliteta vazduha na Balkanu. Prioritet je jasan prikaz podataka, brzo
            ucitavanje i konzistentan UX na mobilnim i desktop uredjajima.
          </p>
          <p className="leading-relaxed text-slate-300">
            Podaci se agregiraju iz vise izvora i prikazuju u formi koja olaksava donosenje odluka u realnom
            vremenu.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.18 }}
          className="glass-effect mb-8 rounded-2xl p-8"
        >
          <h3 className="mb-5 flex items-center gap-2 text-xl font-semibold text-white">
            <Zap className="h-5 w-5 text-amber-300" />
            Tehnologije
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TECH_STACK.map((tech) => (
              <div
                key={tech.name}
                className={`rounded-xl bg-gradient-to-br ${tech.accent} p-4 text-center text-sm font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5`}
              >
                {tech.name}
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.24 }}
          className="glass-effect rounded-2xl p-8"
        >
          <h3 className="mb-5 flex items-center gap-2 text-xl font-semibold text-white">
            <Heart className="h-5 w-5 text-rose-300" />
            Korisni linkovi
          </h3>
          <div className="space-y-3">
            <Link
              href="https://github.com/zoxknez/vremenskaprognoza"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-xl border border-slate-700/60 bg-slate-900/50 p-4 transition-all hover:border-slate-500 hover:bg-slate-900/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-950 text-white transition-transform group-hover:scale-105">
                <Github className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">GitHub repozitorijum</p>
                <p className="text-sm text-slate-400">Izvorni kod projekta</p>
              </div>
              <ExternalLink className="h-5 w-5 text-slate-500 transition-colors group-hover:text-sky-300" />
            </Link>

            <Link
              href="https://mojportfolio.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-xl border border-slate-700/60 bg-slate-900/50 p-4 transition-all hover:border-sky-500/40 hover:bg-slate-900/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/20 transition-transform group-hover:scale-105">
                <Globe className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-white">Portfolio</p>
                <p className="text-sm text-slate-400">Ostali projekti i iskustvo</p>
              </div>
              <ExternalLink className="h-5 w-5 text-slate-500 transition-colors group-hover:text-sky-300" />
            </Link>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
