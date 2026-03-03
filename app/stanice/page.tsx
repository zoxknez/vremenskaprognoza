"use client";

import { AirQualityStatsCard } from "@/components/air-quality/AirQualityStatsCard";
import { CityCoverage } from "@/components/air-quality/CityCoverage";
import { motion } from "framer-motion";
import { ArrowLeft, Database, MapPin, TrendingUp, Wind } from "lucide-react";
import Link from "next/link";

export default function StanicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-24 pb-16">
      <div className="container mx-auto max-w-7xl px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/60 rounded-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          Nazad na pocetnu
        </Link>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Database className="w-9 h-9 text-cyan-400" />
            <h1 className="text-4xl md:text-5xl font-display font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Mreza stanica
            </h1>
          </div>
          <p className="text-lg text-slate-400 max-w-3xl mx-auto">
            Prati kvalitet vazduha iz preko 80 gradova sirom Balkana u realnom vremenu.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
        >
          <Link
            href="/kvalitet-vazduha"
            className="group rounded-2xl bg-slate-900/40 border border-cyan-500/30 hover:border-cyan-400/60 p-4 transition-all"
          >
            <div className="flex items-center gap-3 text-cyan-300 group-hover:text-cyan-200">
              <Wind className="w-5 h-5" />
              <span className="font-medium">Kvalitet vazduha</span>
            </div>
          </Link>
          <Link
            href="/mapa"
            className="group rounded-2xl bg-slate-900/40 border border-blue-500/30 hover:border-blue-400/60 p-4 transition-all"
          >
            <div className="flex items-center gap-3 text-blue-300 group-hover:text-blue-200">
              <MapPin className="w-5 h-5" />
              <span className="font-medium">Interaktivna mapa</span>
            </div>
          </Link>
          <Link
            href="/statistika"
            className="group rounded-2xl bg-slate-900/40 border border-emerald-500/30 hover:border-emerald-400/60 p-4 transition-all"
          >
            <div className="flex items-center gap-3 text-emerald-300 group-hover:text-emerald-200">
              <TrendingUp className="w-5 h-5" />
              <span className="font-medium">Statistika</span>
            </div>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-10"
        >
          <AirQualityStatsCard />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-3xl bg-slate-900/40 border border-slate-700/50 backdrop-blur-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-semibold text-white">Svi gradovi</h2>
          </div>

          <CityCoverage showSearch={true} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-700/50 backdrop-blur-xl transition-all hover:border-cyan-500/40">
            <Database className="w-8 h-8 text-cyan-400 mb-3" />
            <h3 className="text-xl font-semibold text-white mb-2">8 API izvora</h3>
            <p className="text-slate-400">
              Integrisani podaci iz WAQI, OpenWeather, OpenAQ, Sensor Community, AQICN, AirVisual, SEPA i AllThingsTalk API-ja.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-700/50 backdrop-blur-xl transition-all hover:border-blue-500/40">
            <MapPin className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-xl font-semibold text-white mb-2">11 balkanskih zemalja</h3>
            <p className="text-slate-400">
              Srbija, Hrvatska, BiH, Crna Gora, S. Makedonija, Slovenija, Albanija, Kosovo, Bugarska, Rumunija i Grcka.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-700/50 backdrop-blur-xl transition-all hover:border-emerald-500/40">
            <TrendingUp className="w-8 h-8 text-emerald-400 mb-3" />
            <h3 className="text-xl font-semibold text-white mb-2">Redovno azuriranje</h3>
            <p className="text-slate-400">
              Podaci se osvezavaju svakih 10 minuta za sto preciznije informacije o kvalitetu vazduha.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
