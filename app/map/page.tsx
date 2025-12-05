"use client";

import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { MeshGradientBackground, ParticleBackground } from "@/components/ui/backgrounds";
import { AnimatedContainer, StaggerContainer, StaggerItem } from "@/components/ui/animated-container";

export default function MapPage() {
  return (
    <div className="relative min-h-screen">
      <MeshGradientBackground className="fixed inset-0" />
      <ParticleBackground 
        particleCount={30} 
        colors={["#3b82f6", "#10b981", "#f59e0b"]}
        className="fixed inset-0"
      />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <StaggerContainer className="mb-8">
          <StaggerItem>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              Interaktivna Mapa
            </h1>
          </StaggerItem>
          <StaggerItem>
            <p className="text-muted-foreground">
              Vizualizacija kvaliteta vazduha na Balkanu
            </p>
          </StaggerItem>
        </StaggerContainer>

        <AnimatedContainer animation="scale" delay={0.2}>
          <GlassCard className="p-0 overflow-hidden">
            <div className="aspect-[16/9] min-h-[500px] flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center space-y-6 p-8"
              >
                <motion.div
                  className="text-9xl"
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  🗺️
                </motion.div>
                <h2 className="text-2xl font-bold">Mapbox mapa u pripremi</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Interaktivna mapa sa prikazom svih mernih stanica, 
                  heatmap slojem zagađenja i real-time podacima.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <motion.div
                    className="px-4 py-2 rounded-xl bg-green-500/20 text-green-400 text-sm"
                    whileHover={{ scale: 1.05 }}
                  >
                    🟢 Dobar (0-50)
                  </motion.div>
                  <motion.div
                    className="px-4 py-2 rounded-xl bg-yellow-500/20 text-yellow-400 text-sm"
                    whileHover={{ scale: 1.05 }}
                  >
                    🟡 Umeren (51-100)
                  </motion.div>
                  <motion.div
                    className="px-4 py-2 rounded-xl bg-orange-500/20 text-orange-400 text-sm"
                    whileHover={{ scale: 1.05 }}
                  >
                    🟠 Nezdrav za osetljive (101-150)
                  </motion.div>
                  <motion.div
                    className="px-4 py-2 rounded-xl bg-red-500/20 text-red-400 text-sm"
                    whileHover={{ scale: 1.05 }}
                  >
                    🔴 Nezdrav (151-200)
                  </motion.div>
                  <motion.div
                    className="px-4 py-2 rounded-xl bg-purple-500/20 text-purple-400 text-sm"
                    whileHover={{ scale: 1.05 }}
                  >
                    🟣 Veoma nezdrav (201-300)
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </GlassCard>
        </AnimatedContainer>

        {/* Legend and Info */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <AnimatedContainer animation="slideUp" delay={0.3}>
            <GlassCard className="h-full">
              <div className="text-center space-y-3">
                <span className="text-4xl">📍</span>
                <h3 className="font-semibold">50+ Stanica</h3>
                <p className="text-sm text-muted-foreground">
                  Merne stanice širom regiona Balkana
                </p>
              </div>
            </GlassCard>
          </AnimatedContainer>
          <AnimatedContainer animation="slideUp" delay={0.4}>
            <GlassCard className="h-full">
              <div className="text-center space-y-3">
                <span className="text-4xl">🔥</span>
                <h3 className="font-semibold">Heatmap sloj</h3>
                <p className="text-sm text-muted-foreground">
                  Vizualizacija intenziteta zagađenja
                </p>
              </div>
            </GlassCard>
          </AnimatedContainer>
          <AnimatedContainer animation="slideUp" delay={0.5}>
            <GlassCard className="h-full">
              <div className="text-center space-y-3">
                <span className="text-4xl">⚡</span>
                <h3 className="font-semibold">Real-time</h3>
                <p className="text-sm text-muted-foreground">
                  Ažuriranje podataka svakih 5 minuta
                </p>
              </div>
            </GlassCard>
          </AnimatedContainer>
        </div>
      </div>
    </div>
  );
}
