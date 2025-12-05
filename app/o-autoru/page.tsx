"use client";

import Link from "next/link";
import { Github, ExternalLink, Code2, Globe, Mail, MapPin } from "lucide-react";

export default function OAutoruPage() {
  return (
    <main className="min-h-screen bg-slate-950 pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            O Autoru
          </h1>
          <p className="text-slate-400 text-lg">
            Programer i kreator ove platforme
          </p>
        </div>

        {/* Profile Card */}
        <div className="neo-card p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white text-4xl font-bold shadow-lg shadow-sky-500/20">
              Z
            </div>
            
            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-white mb-2">zoxknez</h2>
              <p className="text-slate-400 mb-4">Full Stack Developer</p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <Link
                  href="https://github.com/zoxknez"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary flex items-center gap-2 text-sm"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </Link>
                <Link
                  href="https://mojportfolio.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary flex items-center gap-2 text-sm"
                >
                  <Globe className="w-4 h-4" />
                  Portfolio
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="neo-card p-8 mb-8">
          <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <Code2 className="w-5 h-5 text-sky-400" />
            O Projektu
          </h3>
          <p className="text-slate-300 leading-relaxed mb-4">
            Vremenska Prognoza je moderna web aplikacija za praćenje vremenskih uslova 
            i kvaliteta vazduha na Balkanu. Projekat je razvijen sa ciljem da pruži 
            korisnicima jednostavan i intuitivan način za praćenje meteoroloških podataka.
          </p>
          <p className="text-slate-300 leading-relaxed">
            Aplikacija koristi najnovije tehnologije uključujući Next.js 16, React, 
            TypeScript i Tailwind CSS, sa integracijom različitih API servisa za 
            prikupljanje vremenskih podataka u realnom vremenu.
          </p>
        </div>

        {/* Tech Stack */}
        <div className="neo-card p-8 mb-8">
          <h3 className="text-xl font-semibold text-white mb-6">Tehnologije</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Next.js 16", color: "from-gray-600 to-gray-800" },
              { name: "React", color: "from-sky-500 to-cyan-500" },
              { name: "TypeScript", color: "from-blue-500 to-blue-700" },
              { name: "Tailwind CSS", color: "from-teal-500 to-cyan-500" },
              { name: "Mapbox GL", color: "from-indigo-500 to-purple-500" },
              { name: "Framer Motion", color: "from-pink-500 to-rose-500" },
              { name: "OpenWeather API", color: "from-orange-500 to-amber-500" },
              { name: "WAQI API", color: "from-green-500 to-emerald-500" },
            ].map((tech) => (
              <div
                key={tech.name}
                className={`bg-gradient-to-r ${tech.color} p-3 rounded-lg text-white text-sm font-medium text-center shadow-lg`}
              >
                {tech.name}
              </div>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="neo-card p-8">
          <h3 className="text-xl font-semibold text-white mb-6">Linkovi</h3>
          <div className="space-y-4">
            <Link
              href="https://github.com/zoxknez/vremenskaprognoza"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors group"
            >
              <div className="w-12 h-12 rounded-lg bg-slate-900 flex items-center justify-center">
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
              className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors group"
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
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
        </div>
      </div>
    </main>
  );
}
