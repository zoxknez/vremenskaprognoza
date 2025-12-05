"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { MeshGradientBackground } from "@/components/ui/backgrounds";
import { AnimatedContainer, StaggerContainer, StaggerItem } from "@/components/ui/animated-container";

const alerts = [
  {
    id: 1,
    type: "warning",
    title: "Povišen nivo PM2.5 u Skoplju",
    message: "AQI trenutno iznosi 145. Preporučuje se smanjenje aktivnosti na otvorenom.",
    location: "Skoplje, Severna Makedonija",
    time: "Pre 15 minuta",
    severity: "high",
  },
  {
    id: 2,
    type: "alert",
    title: "Zimska inverzija u Sarajevu",
    message: "Očekuje se pogoršanje kvaliteta vazduha tokom noći zbog temperaturne inverzije.",
    location: "Sarajevo, BiH",
    time: "Pre 1 sat",
    severity: "medium",
  },
  {
    id: 3,
    type: "info",
    title: "Poboljšanje u Beogradu",
    message: "Kvalitet vazduha se poboljšao sa 72 na 45 AQI zahvaljujući promeni vetra.",
    location: "Beograd, Srbija",
    time: "Pre 2 sata",
    severity: "low",
  },
  {
    id: 4,
    type: "warning",
    title: "Visok nivo ozona u Zagrebu",
    message: "Nivo ozona premašuje preporučene vrednosti. Izbegavajte fizičku aktivnost.",
    location: "Zagreb, Hrvatska",
    time: "Pre 3 sata",
    severity: "medium",
  },
];

const severityColors = {
  high: {
    bg: "bg-red-500/20",
    border: "border-red-500/30",
    icon: "🔴",
    text: "text-red-400",
  },
  medium: {
    bg: "bg-orange-500/20",
    border: "border-orange-500/30",
    icon: "🟠",
    text: "text-orange-400",
  },
  low: {
    bg: "bg-green-500/20",
    border: "border-green-500/30",
    icon: "🟢",
    text: "text-green-400",
  },
};

export default function AlertsPage() {
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low">("all");
  
  const filteredAlerts = filter === "all" 
    ? alerts 
    : alerts.filter(a => a.severity === filter);

  return (
    <div className="relative min-h-screen">
      <MeshGradientBackground className="fixed inset-0" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        <StaggerContainer className="mb-8">
          <StaggerItem>
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              Upozorenja
            </h1>
          </StaggerItem>
          <StaggerItem>
            <p className="text-muted-foreground">
              Notifikacije o promenama kvaliteta vazduha
            </p>
          </StaggerItem>
        </StaggerContainer>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <AnimatedContainer animation="slideUp" delay={0.1}>
            <GlassCard className="text-center p-4">
              <span className="text-3xl mb-2 block">🔔</span>
              <p className="text-2xl font-bold">{alerts.length}</p>
              <p className="text-sm text-muted-foreground">Aktivna upozorenja</p>
            </GlassCard>
          </AnimatedContainer>
          <AnimatedContainer animation="slideUp" delay={0.2}>
            <GlassCard className="text-center p-4">
              <span className="text-3xl mb-2 block">🔴</span>
              <p className="text-2xl font-bold text-red-400">
                {alerts.filter(a => a.severity === "high").length}
              </p>
              <p className="text-sm text-muted-foreground">Visok prioritet</p>
            </GlassCard>
          </AnimatedContainer>
          <AnimatedContainer animation="slideUp" delay={0.3}>
            <GlassCard className="text-center p-4">
              <span className="text-3xl mb-2 block">🟠</span>
              <p className="text-2xl font-bold text-orange-400">
                {alerts.filter(a => a.severity === "medium").length}
              </p>
              <p className="text-sm text-muted-foreground">Srednji prioritet</p>
            </GlassCard>
          </AnimatedContainer>
          <AnimatedContainer animation="slideUp" delay={0.4}>
            <GlassCard className="text-center p-4">
              <span className="text-3xl mb-2 block">🟢</span>
              <p className="text-2xl font-bold text-green-400">
                {alerts.filter(a => a.severity === "low").length}
              </p>
              <p className="text-sm text-muted-foreground">Informacije</p>
            </GlassCard>
          </AnimatedContainer>
        </div>

        {/* Filter */}
        <AnimatedContainer animation="slideUp" delay={0.3}>
          <GlassCard className="mb-6 p-2">
            <div className="flex flex-wrap gap-2">
              {[
                { id: "all", label: "Svi", count: alerts.length },
                { id: "high", label: "Visok", count: alerts.filter(a => a.severity === "high").length },
                { id: "medium", label: "Srednji", count: alerts.filter(a => a.severity === "medium").length },
                { id: "low", label: "Nizak", count: alerts.filter(a => a.severity === "low").length },
              ].map((item) => (
                <motion.button
                  key={item.id}
                  onClick={() => setFilter(item.id as typeof filter)}
                  className={`
                    relative px-4 py-2 rounded-xl font-medium text-sm transition-colors
                    ${filter === item.id 
                      ? "text-white" 
                      : "text-muted-foreground hover:text-foreground"
                    }
                  `}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {filter === item.id && (
                    <motion.div
                      layoutId="filterActive"
                      className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative flex items-center gap-2">
                    {item.label}
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-xs">
                      {item.count}
                    </span>
                  </span>
                </motion.button>
              ))}
            </div>
          </GlassCard>
        </AnimatedContainer>

        {/* Alerts List */}
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredAlerts.map((alert, index) => {
              const colors = severityColors[alert.severity as keyof typeof severityColors];
              
              return (
                <motion.div
                  key={alert.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  layout
                >
                  <GlassCard 
                    className={`${colors.bg} border ${colors.border}`}
                  >
                    <div className="flex gap-4">
                      <div className="text-3xl">{colors.icon}</div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="font-semibold">{alert.title}</h3>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {alert.time}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {alert.message}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>📍</span>
                          <span>{alert.location}</span>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Notification Settings */}
        <AnimatedContainer animation="slideUp" delay={0.5} className="mt-8">
          <GlassCard>
            <h3 className="text-lg font-semibold mb-4">Podešavanja notifikacija</h3>
            <div className="space-y-4">
              {[
                { label: "Push notifikacije", description: "Primajte upozorenja na telefon", enabled: true },
                { label: "Email obaveštenja", description: "Dnevni izveštaj na email", enabled: false },
                { label: "SMS upozorenja", description: "Samo za hitna upozorenja", enabled: false },
              ].map((setting) => (
                <div key={setting.label} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                  <div>
                    <p className="font-medium">{setting.label}</p>
                    <p className="text-sm text-muted-foreground">{setting.description}</p>
                  </div>
                  <motion.button
                    className={`
                      w-12 h-6 rounded-full transition-colors relative
                      ${setting.enabled ? "bg-green-500" : "bg-muted"}
                    `}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      className="absolute top-1 w-4 h-4 rounded-full bg-white"
                      animate={{ left: setting.enabled ? "calc(100% - 20px)" : "4px" }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </motion.button>
                </div>
              ))}
            </div>
          </GlassCard>
        </AnimatedContainer>
      </div>
    </div>
  );
}
