"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ParticleBackground, MeshGradientBackground } from "@/components/ui/backgrounds";
import { AQIGauge } from "@/components/ui/aqi-gauge";
import { AnimatedContainer, StaggerContainer, StaggerItem, FloatingElement } from "@/components/ui/animated-container";

interface HeroSectionProps {
  currentAQI?: number;
  locationName?: string;
}

export function HeroSection({ currentAQI = 42, locationName = "Beograd" }: HeroSectionProps) {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background Effects */}
      <MeshGradientBackground />
      <ParticleBackground 
        particleCount={40} 
        colors={["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981"]}
        speed={0.3}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <StaggerContainer className="space-y-8">
            <StaggerItem>
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20"
                whileHover={{ scale: 1.05 }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="text-sm font-medium">Podaci u realnom vremenu</span>
              </motion.div>
            </StaggerItem>

            <StaggerItem>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight">
                <span className="block">Pratite</span>
                <span className="block bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">
                  kvalitet vazduha
                </span>
                <span className="block">na Balkanu</span>
              </h1>
            </StaggerItem>

            <StaggerItem>
              <p className="text-lg sm:text-xl text-muted-foreground max-w-lg">
                Real-time monitoring zagađenja vazduha za Srbiju, Hrvatsku, Bosnu i Hercegovinu, 
                Crnu Goru, Severnu Makedoniju i druge zemlje regiona.
              </p>
            </StaggerItem>

            <StaggerItem>
              <div className="flex flex-wrap gap-4">
                <Link href="/dashboard">
                  <motion.button
                    className="group relative px-8 py-4 rounded-2xl font-semibold text-white overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <span className="relative flex items-center gap-2">
                      Pogledaj Dashboard
                      <motion.span
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        →
                      </motion.span>
                    </span>
                  </motion.button>
                </Link>

                <Link href="/map">
                  <motion.button
                    className="px-8 py-4 rounded-2xl font-semibold border-2 border-border hover:border-primary/50 hover:bg-primary/5 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="flex items-center gap-2">
                      🗺️ Interaktivna mapa
                    </span>
                  </motion.button>
                </Link>
              </div>
            </StaggerItem>

            {/* Stats */}
            <StaggerItem>
              <div className="flex flex-wrap gap-8 pt-4">
                {[
                  { value: "50+", label: "Stanica" },
                  { value: "7", label: "Zemalja" },
                  { value: "24/7", label: "Monitoring" },
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    className="space-y-1"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                  >
                    <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
                      {stat.value}
                    </p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </StaggerItem>
          </StaggerContainer>

          {/* Right Content - AQI Display */}
          <div className="relative lg:pl-8">
            <FloatingElement intensity={15} duration={4}>
              <motion.div
                className="relative p-8 rounded-3xl bg-white/5 dark:bg-black/20 backdrop-blur-xl border border-white/10"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                {/* Glow effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-2xl -z-10" />
                
                <div className="text-center space-y-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Trenutni AQI</p>
                    <p className="text-lg font-semibold">{locationName}</p>
                  </div>

                  <AQIGauge value={currentAQI} size="lg" />

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/10">
                    {[
                      { label: "PM2.5", value: "12", unit: "µg/m³" },
                      { label: "PM10", value: "28", unit: "µg/m³" },
                      { label: "O₃", value: "45", unit: "ppb" },
                    ].map((item) => (
                      <div key={item.label} className="text-center">
                        <p className="text-xs text-muted-foreground">{item.label}</p>
                        <p className="text-lg font-semibold">{item.value}</p>
                        <p className="text-xs text-muted-foreground">{item.unit}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </FloatingElement>

            {/* Floating badges */}
            <motion.div
              className="absolute -top-4 -right-4 p-3 rounded-2xl bg-green-500/20 backdrop-blur-xl border border-green-500/30"
              animate={{ y: [-5, 5, -5], rotate: [-5, 5, -5] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <span className="text-2xl">🌿</span>
            </motion.div>

            <motion.div
              className="absolute -bottom-4 -left-4 p-3 rounded-2xl bg-blue-500/20 backdrop-blur-xl border border-blue-500/30"
              animate={{ y: [5, -5, 5], rotate: [5, -5, 5] }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              <span className="text-2xl">💨</span>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <span className="text-sm">Scroll za više</span>
          <div className="w-6 h-10 rounded-full border-2 border-current p-1">
            <motion.div
              className="w-1.5 h-1.5 rounded-full bg-current mx-auto"
              animate={{ y: [0, 16, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
