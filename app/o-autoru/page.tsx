"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Github, ExternalLink, Code2, Globe, Sparkles, Heart, Zap, Coffee } from "lucide-react";

export default function OAutoruPage() {
  return (
    <div className="min-h-screen bg-slate-950 pt-20 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm mb-6">
            <Sparkles className="w-4 h-4" />
            Upoznajte kreatora
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            O Autoru
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Strastveni developer koji voli da stvara korisne aplikacije
          </p>
        </motion.div>

        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="neo-card p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg shadow-sky-500/30">
                o0o
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-green-500 border-4 border-slate-900 flex items-center justify-center">
                <Coffee className="w-4 h-4 text-white" />
              </div>
            </div>
            
            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-3xl font-bold text-white mb-2">o0o0o0o</h2>
              <p className="text-sky-400 font-medium mb-4">Full Stack Developer</p>
              <p className="text-slate-400 mb-6">
                Kreator web aplikacija sa fokusom na moderni dizajn i korisničko iskustvo.
              </p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <Link
                  href="https://github.com/zoxknez"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-all"
                >
                  <Github className="w-5 h-5" />
                  GitHub
                </Link>
                <Link
                  href="https://mojportfolio.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-medium transition-all shadow-lg shadow-sky-500/25"
                >
                  <Globe className="w-5 h-5" />
                  Portfolio
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* About Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="neo-card p-8 mb-8"
        >
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-sky-400" />
            O Projektu
          </h3>
          <p className="text-slate-300 leading-relaxed mb-4">
            <span className="text-white font-semibold">VremenskaPrognoza</span> je moderna web aplikacija za praćenje vremenskih uslova 
            i kvaliteta vazduha na Balkanu. Projekat je razvijen sa ciljem da pruži 
            korisnicima jednostavan i intuitivan način za praćenje meteoroloških podataka.
          </p>
          <p className="text-slate-300 leading-relaxed">
            Aplikacija koristi najnovije tehnologije i integrira podatke iz više izvora
            za prikupljanje vremenskih podataka u realnom vremenu.
          </p>
        </motion.div>

        {/* Tech Stack */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="neo-card p-8 mb-8"
        >
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Tehnologije
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: "Next.js 16", color: "from-slate-600 to-slate-800", icon: "⚡" },
              { name: "React", color: "from-sky-500 to-cyan-600", icon: "⚛️" },
              { name: "TypeScript", color: "from-blue-500 to-blue-700", icon: "📘" },
              { name: "Tailwind CSS", color: "from-teal-500 to-cyan-600", icon: "🎨" },
              { name: "Mapbox GL", color: "from-indigo-500 to-purple-600", icon: "🗺️" },
              { name: "Framer Motion", color: "from-pink-500 to-rose-600", icon: "✨" },
              { name: "OpenWeather", color: "from-orange-500 to-amber-600", icon: "🌤️" },
              { name: "WAQI API", color: "from-green-500 to-emerald-600", icon: "🌿" },
            ].map((tech) => (
              <div
                key={tech.name}
                className={`bg-gradient-to-br ${tech.color} p-4 rounded-xl text-white text-sm font-medium shadow-lg hover:scale-105 transition-transform cursor-default`}
              >
                <span className="text-lg mr-2">{tech.icon}</span>
                {tech.name}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Links */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="neo-card p-8"
        >
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-400" />
            Povežite se
          </h3>
          <div className="space-y-4">
            <Link
              href="https://github.com/zoxknez/vremenskaprognoza"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Github className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium group-hover:text-sky-400 transition-colors">
                  GitHub Repozitorijum
                </p>
                <p className="text-slate-400 text-sm">Izvorni kod projekta</p>
              </div>
              <ExternalLink className="w-5 h-5 text-slate-500 group-hover:text-sky-400 transition-colors" />
            </Link>

            <Link
              href="https://mojportfolio.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-sky-500/50 transition-all group"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-sky-500/20">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-white font-medium group-hover:text-sky-400 transition-colors">
                  Moj Portfolio
                </p>
                <p className="text-slate-400 text-sm">Pogledajte moje ostale projekte</p>
              </div>
              <ExternalLink className="w-5 h-5 text-slate-500 group-hover:text-sky-400 transition-colors" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
