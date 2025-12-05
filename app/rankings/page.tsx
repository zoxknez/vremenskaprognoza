"use client";

import { motion } from "framer-motion";
import { GlassCard, AQICard } from "@/components/ui/glass-card";
import { MeshGradientBackground } from "@/components/ui/backgrounds";
import { AnimatedContainer, StaggerContainer, StaggerItem } from "@/components/ui/animated-container";
import { AQIGauge } from "@/components/ui/aqi-gauge";

const rankings = {
  best: [
    { rank: 1, city: "Ljubljana", country: "Slovenija", flag: "🇸🇮", aqi: 25, trend: "↓" },
    { rank: 2, city: "Podgorica", country: "Crna Gora", flag: "🇲🇪", aqi: 32, trend: "→" },
    { rank: 3, city: "Zagreb", country: "Hrvatska", flag: "🇭🇷", aqi: 38, trend: "↓" },
    { rank: 4, city: "Split", country: "Hrvatska", flag: "🇭🇷", aqi: 40, trend: "↑" },
    { rank: 5, city: "Beograd", country: "Srbija", flag: "🇷🇸", aqi: 45, trend: "→" },
  ],
  worst: [
    { rank: 1, city: "Skoplje", country: "S. Makedonija", flag: "🇲🇰", aqi: 145, trend: "↑" },
    { rank: 2, city: "Sarajevo", country: "BiH", flag: "🇧🇦", aqi: 125, trend: "↑" },
    { rank: 3, city: "Priština", country: "Kosovo", flag: "🇽🇰", aqi: 115, trend: "→" },
    { rank: 4, city: "Tuzla", country: "BiH", flag: "🇧🇦", aqi: 98, trend: "↓" },
    { rank: 5, city: "Novi Sad", country: "Srbija", flag: "🇷🇸", aqi: 72, trend: "↑" },
  ],
};

export default function RankingsPage() {
  return (
    <div className="relative min-h-screen">
      <MeshGradientBackground className="fixed inset-0" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <StaggerContainer className="mb-8">
          <StaggerItem>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              Rangiranje Gradova
            </h1>
          </StaggerItem>
          <StaggerItem>
            <p className="text-muted-foreground">
              Uporedite kvalitet vazduha u gradovima Balkana
            </p>
          </StaggerItem>
        </StaggerContainer>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Najčistiji grad", value: "Ljubljana", icon: "🏆" },
            { label: "Prosečan AQI regiona", value: "68", icon: "📊" },
            { label: "Gradova praćeno", value: "42", icon: "🏙️" },
            { label: "Poboljšanje danas", value: "+12%", icon: "📈" },
          ].map((stat, index) => (
            <AnimatedContainer key={stat.label} animation="slideUp" delay={index * 0.1}>
              <GlassCard className="text-center p-4">
                <span className="text-3xl mb-2 block">{stat.icon}</span>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </GlassCard>
            </AnimatedContainer>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Best Cities */}
          <AnimatedContainer animation="slideRight" delay={0.2}>
            <GlassCard>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">✅</span>
                <div>
                  <h2 className="text-xl font-bold">Najčistiji gradovi</h2>
                  <p className="text-sm text-muted-foreground">Najbolji kvalitet vazduha</p>
                </div>
              </div>

              <div className="space-y-4">
                {rankings.best.map((item, index) => (
                  <motion.div
                    key={item.city}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center font-bold
                      ${index === 0 ? "bg-yellow-500/20 text-yellow-400" : 
                        index === 1 ? "bg-gray-400/20 text-gray-300" : 
                        index === 2 ? "bg-orange-700/20 text-orange-400" : 
                        "bg-white/10 text-muted-foreground"}
                    `}>
                      {item.rank}
                    </div>
                    <span className="text-2xl">{item.flag}</span>
                    <div className="flex-1">
                      <p className="font-semibold">{item.city}</p>
                      <p className="text-xs text-muted-foreground">{item.country}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-500">{item.aqi}</p>
                      <p className="text-xs text-muted-foreground">{item.trend}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </AnimatedContainer>

          {/* Worst Cities */}
          <AnimatedContainer animation="slideLeft" delay={0.2}>
            <GlassCard>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">⚠️</span>
                <div>
                  <h2 className="text-xl font-bold">Najzagađeniji gradovi</h2>
                  <p className="text-sm text-muted-foreground">Potrebna je pažnja</p>
                </div>
              </div>

              <div className="space-y-4">
                {rankings.worst.map((item, index) => (
                  <motion.div
                    key={item.city}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold bg-red-500/20 text-red-400">
                      {item.rank}
                    </div>
                    <span className="text-2xl">{item.flag}</span>
                    <div className="flex-1">
                      <p className="font-semibold">{item.city}</p>
                      <p className="text-xs text-muted-foreground">{item.country}</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        item.aqi > 100 ? "text-red-500" : 
                        item.aqi > 50 ? "text-orange-500" : "text-yellow-500"
                      }`}>
                        {item.aqi}
                      </p>
                      <p className={`text-xs ${
                        item.trend === "↑" ? "text-red-400" : 
                        item.trend === "↓" ? "text-green-400" : "text-muted-foreground"
                      }`}>
                        {item.trend}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </AnimatedContainer>
        </div>

        {/* AQI Scale Legend */}
        <AnimatedContainer animation="slideUp" delay={0.6} className="mt-8">
          <GlassCard>
            <h3 className="text-lg font-semibold mb-4">Skala kvaliteta vazduha (AQI)</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { range: "0-50", label: "Dobar", color: "bg-green-500", textColor: "text-green-400" },
                { range: "51-100", label: "Umeren", color: "bg-yellow-500", textColor: "text-yellow-400" },
                { range: "101-150", label: "Nezdrav za osetljive", color: "bg-orange-500", textColor: "text-orange-400" },
                { range: "151-200", label: "Nezdrav", color: "bg-red-500", textColor: "text-red-400" },
                { range: "201-300", label: "Veoma nezdrav", color: "bg-purple-500", textColor: "text-purple-400" },
                { range: "301+", label: "Opasan", color: "bg-rose-900", textColor: "text-rose-400" },
              ].map((item) => (
                <div key={item.range} className="text-center space-y-2">
                  <div className={`h-3 rounded-full ${item.color}`} />
                  <p className={`font-bold ${item.textColor}`}>{item.range}</p>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </AnimatedContainer>
      </div>
    </div>
  );
}
