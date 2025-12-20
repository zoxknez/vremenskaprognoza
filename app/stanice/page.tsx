"use client";

import { AirQualityStatsCard } from "@/components/air-quality/AirQualityStatsCard";
import { CityCoverage } from "@/components/air-quality/CityCoverage";
import { motion } from "framer-motion";
import { MapPin, Database, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function StanicePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Database className="w-10 h-10 text-cyan-400" />
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Mreža Stanica
            </h1>
          </div>
          <p className="text-xl text-slate-400 max-w-3xl mx-auto">
            Prati kvalitet vazduha iz preko 80+ gradova širom Balkana u realnom vremenu
          </p>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap justify-center gap-4 mb-12"
        >
          <Link
            href="/kvalitet-vazduha"
            className="px-6 py-3 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/30 transition-colors"
          >
            <span className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Kvalitet Vazduha
            </span>
          </Link>
          <Link
            href="/mapa"
            className="px-6 py-3 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-blue-500/30 transition-colors"
          >
            <span className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Interaktivna Mapa
            </span>
          </Link>
          <Link
            href="/statistika"
            className="px-6 py-3 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30 transition-colors"
          >
            <span className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Statistika
            </span>
          </Link>
        </motion.div>

        {/* Stats Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <AirQualityStatsCard />
        </motion.div>

        {/* Cities Coverage */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-3xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-6 h-6 text-cyan-400" />
            <h2 className="text-2xl font-semibold text-white">Svi Gradovi</h2>
          </div>

          <CityCoverage showSearch={true} />
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-xl">
            <Database className="w-8 h-8 text-cyan-400 mb-3" />
            <h3 className="text-xl font-semibold text-white mb-2">8 API Izvora</h3>
            <p className="text-slate-400">
              Integrisani podaci iz WAQI, OpenWeather, OpenAQ, Sensor Community, AQICN, AirVisual, SEPA i AllThingsTalk API-ja
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-xl">
            <MapPin className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-xl font-semibold text-white mb-2">11 Balkanskih Zemalja</h3>
            <p className="text-slate-400">
              Srbija, Hrvatska, BiH, Crna Gora, S. Makedonija, Slovenija, Albanija, Kosovo, Bugarska, Rumunija, Grčka
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/30 border border-slate-700/50 backdrop-blur-xl">
            <TrendingUp className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="text-xl font-semibold text-white mb-2">Real-time Ažuriranje</h3>
            <p className="text-slate-400">
              Podaci se ažuriraju svakih 10 minuta za najpreciznije informacije o kvalitetu vazduha
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
