"use client";

import { motion } from "framer-motion";
import { GlassCard, AQICard } from "@/components/ui/glass-card";
import { StaggerContainer, StaggerItem, FloatingElement } from "@/components/ui/animated-container";
import { AQIGauge, LinearAQIIndicator, PollutantBar } from "@/components/ui/aqi-gauge";
import Link from "next/link";

const features = [
  {
    icon: "🗺️",
    title: "Interaktivna mapa",
    description: "Vizualizirajte zagađenje u realnom vremenu sa heatmap prikazom za ceo Balkan.",
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    icon: "📊",
    title: "Detaljne statistike",
    description: "Pratite trendove, istorijske podatke i prognoze kvaliteta vazduha.",
    gradient: "from-purple-500/20 to-pink-500/20",
  },
  {
    icon: "🔔",
    title: "Smart upozorenja",
    description: "Primajte notifikacije kada kvalitet vazduha pređe bezbedne granice.",
    gradient: "from-orange-500/20 to-red-500/20",
  },
  {
    icon: "📱",
    title: "PWA aplikacija",
    description: "Instalirajte kao aplikaciju na telefon za brz pristup informacijama.",
    gradient: "from-green-500/20 to-emerald-500/20",
  },
  {
    icon: "🌡️",
    title: "Vremenska prognoza",
    description: "Kombinovani podaci o kvalitetu vazduha i vremenskim uslovima.",
    gradient: "from-yellow-500/20 to-orange-500/20",
  },
  {
    icon: "💪",
    title: "Zdravstveni saveti",
    description: "Personalizovane preporuke bazirane na trenutnom stanju vazduha.",
    gradient: "from-rose-500/20 to-pink-500/20",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <StaggerContainer className="text-center mb-16">
          <StaggerItem>
            <motion.span
              className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
            >
              Mogućnosti
            </motion.span>
          </StaggerItem>
          <StaggerItem>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Sve što vam treba na{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
                jednom mestu
              </span>
            </h2>
          </StaggerItem>
          <StaggerItem>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Najnaprednija platforma za praćenje kvaliteta vazduha sa real-time podacima iz više izvora
            </p>
          </StaggerItem>
        </StaggerContainer>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard
                className={`h-full bg-gradient-to-br ${feature.gradient} hover:shadow-xl transition-all duration-300`}
              >
                <div className="space-y-4">
                  <motion.div
                    className="w-14 h-14 rounded-2xl bg-white/10 dark:bg-white/5 flex items-center justify-center text-3xl"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    {feature.icon}
                  </motion.div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const cities = [
  { name: "Beograd", country: "Srbija", aqi: 45, flag: "🇷🇸" },
  { name: "Zagreb", country: "Hrvatska", aqi: 38, flag: "🇭🇷" },
  { name: "Sarajevo", country: "BiH", aqi: 72, flag: "🇧🇦" },
  { name: "Skoplje", country: "S. Makedonija", aqi: 85, flag: "🇲🇰" },
  { name: "Podgorica", country: "Crna Gora", aqi: 32, flag: "🇲🇪" },
  { name: "Ljubljana", country: "Slovenija", aqi: 28, flag: "🇸🇮" },
];

export function LiveDataSection() {
  return (
    <section className="py-24 relative bg-muted/30">
      <div className="container mx-auto px-4">
        <StaggerContainer className="text-center mb-16">
          <StaggerItem>
            <motion.span
              className="inline-block px-4 py-2 rounded-full bg-green-500/10 text-green-500 text-sm font-medium mb-4"
            >
              <span className="mr-2">●</span> Live podaci
            </motion.span>
          </StaggerItem>
          <StaggerItem>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Trenutno stanje u{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-emerald-500">
                glavnim gradovima
              </span>
            </h2>
          </StaggerItem>
        </StaggerContainer>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cities.map((city, index) => (
            <motion.div
              key={city.name}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/dashboard/location/${city.name.toLowerCase()}`}>
                <AQICard aqi={city.aqi} className="cursor-pointer">
                  <div className="flex items-center gap-4">
                    <AQIGauge value={city.aqi} size="sm" showLabel={false} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{city.flag}</span>
                        <div>
                          <h3 className="font-semibold text-lg">{city.name}</h3>
                          <p className="text-sm text-muted-foreground">{city.country}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <LinearAQIIndicator value={city.aqi} showMarkers={false} />
                  </div>
                </AQICard>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <Link href="/dashboard">
            <motion.button
              className="px-8 py-4 rounded-2xl font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Pogledaj sve lokacije →
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

export function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Prikupljanje podataka",
      description: "Agregiramo podatke iz više od 10 različitih izvora u realnom vremenu.",
      icon: "📡",
    },
    {
      number: "02",
      title: "Obrada i analiza",
      description: "Napredni algoritmi analiziraju i normalizuju podatke za tačnost.",
      icon: "⚙️",
    },
    {
      number: "03",
      title: "Vizualizacija",
      description: "Intuitivni prikaz podataka kroz mape, grafikone i indikatore.",
      icon: "📊",
    },
    {
      number: "04",
      title: "Obaveštenja",
      description: "Pravovremena upozorenja i personalizovani zdravstveni saveti.",
      icon: "🔔",
    },
  ];

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <StaggerContainer className="text-center mb-16">
          <StaggerItem>
            <motion.span
              className="inline-block px-4 py-2 rounded-full bg-purple-500/10 text-purple-500 text-sm font-medium mb-4"
            >
              Kako funkcioniše
            </motion.span>
          </StaggerItem>
          <StaggerItem>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Jednostavno i{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
                efikasno
              </span>
            </h2>
          </StaggerItem>
        </StaggerContainer>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative"
              >
                <GlassCard className="text-center h-full">
                  <motion.div
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl mx-auto mb-4"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                  >
                    {step.icon}
                  </motion.div>
                  <span className="text-5xl font-bold text-muted/20">{step.number}</span>
                  <h3 className="text-xl font-semibold mt-2 mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <motion.div
          className="relative rounded-3xl overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600" />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10" />
          
          {/* Floating shapes */}
          <FloatingElement className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-white/10 blur-3xl" intensity={20}>
            <div />
          </FloatingElement>
          <FloatingElement className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full bg-white/10 blur-3xl" intensity={30} duration={5}>
            <div />
          </FloatingElement>

          <div className="relative px-8 py-16 md:px-16 md:py-24 text-center text-white">
            <motion.h2
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Spremni da pratite kvalitet vazduha?
            </motion.h2>
            <motion.p
              className="text-lg text-white/80 max-w-2xl mx-auto mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              Pridružite se hiljadama korisnika koji već koriste našu platformu za praćenje kvaliteta vazduha u realnom vremenu.
            </motion.p>
            <motion.div
              className="flex flex-wrap justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Link href="/dashboard">
                <motion.button
                  className="px-8 py-4 rounded-2xl font-semibold bg-white text-purple-600 hover:bg-white/90 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Započni besplatno
                </motion.button>
              </Link>
              <Link href="/about">
                <motion.button
                  className="px-8 py-4 rounded-2xl font-semibold border-2 border-white/30 hover:bg-white/10 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Saznaj više
                </motion.button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
