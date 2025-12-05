"use client";

import { Suspense, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GlassCard, StatCard } from "@/components/ui/glass-card";
import { AQIGauge, LinearAQIIndicator, PollutantBar } from "@/components/ui/aqi-gauge";
import { AnimatedContainer, StaggerContainer, StaggerItem } from "@/components/ui/animated-container";
import { MapSkeleton, ListSkeleton, AQICardSkeleton } from "@/components/ui/loading";
import { MeshGradientBackground, ParticleBackground } from "@/components/ui/backgrounds";
import { AirQualityData } from "@/lib/types/air-quality";

interface DashboardClientProps {
  initialData: AirQualityData[];
}

const tabs = [
  { id: "map", label: "Mapa", icon: "🗺️" },
  { id: "list", label: "Lista", icon: "📋" },
  { id: "compare", label: "Uporedi", icon: "⚖️" },
];

export function DashboardClient({ initialData }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState("map");
  const [data] = useState(initialData);
  const [selectedLocation, setSelectedLocation] = useState<AirQualityData | null>(
    initialData[0] || null
  );

  // Calculate stats
  const avgAQI = Math.round(data.reduce((acc, item) => acc + item.aqi, 0) / data.length) || 0;
  const goodStations = data.filter((d) => d.aqi <= 50).length;
  const moderateStations = data.filter((d) => d.aqi > 50 && d.aqi <= 100).length;
  const unhealthyStations = data.filter((d) => d.aqi > 100).length;

  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <MeshGradientBackground className="fixed inset-0" />

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <StaggerContainer className="mb-8">
          <StaggerItem>
            <motion.h1 
              className="text-3xl sm:text-4xl font-bold mb-2"
            >
              Dashboard
            </motion.h1>
          </StaggerItem>
          <StaggerItem>
            <p className="text-muted-foreground">
              Praćenje kvaliteta vazduha u realnom vremenu
            </p>
          </StaggerItem>
        </StaggerContainer>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <AnimatedContainer delay={0.1} animation="slideUp">
            <StatCard
              label="Aktivnih stanica"
              value={data.length}
              icon={<span className="text-2xl">📡</span>}
            />
          </AnimatedContainer>
          <AnimatedContainer delay={0.2} animation="slideUp">
            <StatCard
              label="Prosečan AQI"
              value={avgAQI}
              icon={<span className="text-2xl">📊</span>}
              trend={avgAQI <= 50 ? "down" : avgAQI <= 100 ? "stable" : "up"}
              trendValue={avgAQI <= 50 ? "Dobar" : avgAQI <= 100 ? "Umeren" : "Loš"}
            />
          </AnimatedContainer>
          <AnimatedContainer delay={0.3} animation="slideUp">
            <StatCard
              label="Dobar kvalitet"
              value={goodStations}
              icon={<span className="text-2xl">✅</span>}
            />
          </AnimatedContainer>
          <AnimatedContainer delay={0.4} animation="slideUp">
            <StatCard
              label="Upozorenja"
              value={unhealthyStations}
              icon={<span className="text-2xl">⚠️</span>}
            />
          </AnimatedContainer>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel - Map/List */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tab Navigation */}
            <GlassCard className="p-2">
              <div className="flex gap-2">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      relative flex-1 px-4 py-3 rounded-xl font-medium text-sm transition-colors
                      ${activeTab === tab.id 
                        ? "text-white" 
                        : "text-muted-foreground hover:text-foreground"
                      }
                    `}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <span className="relative flex items-center justify-center gap-2">
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </span>
                  </motion.button>
                ))}
              </div>
            </GlassCard>

            {/* Content */}
            <AnimatePresence mode="wait">
              {activeTab === "map" && (
                <motion.div
                  key="map"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <GlassCard className="p-0 overflow-hidden">
                    <div className="aspect-video bg-muted/20 flex items-center justify-center">
                      <MapPlaceholder data={data} onSelectLocation={setSelectedLocation} />
                    </div>
                  </GlassCard>
                </motion.div>
              )}

              {activeTab === "list" && (
                <motion.div
                  key="list"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <StationListView data={data} onSelectLocation={setSelectedLocation} />
                </motion.div>
              )}

              {activeTab === "compare" && (
                <motion.div
                  key="compare"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <CompareView data={data} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Panel - Selected Location Details */}
          <div className="space-y-6">
            {selectedLocation ? (
              <LocationDetail location={selectedLocation} />
            ) : (
              <GlassCard className="h-full flex items-center justify-center text-center p-8">
                <div className="space-y-4">
                  <span className="text-6xl">📍</span>
                  <h3 className="text-xl font-semibold">Izaberite lokaciju</h3>
                  <p className="text-sm text-muted-foreground">
                    Kliknite na stanicu na mapi ili listi za detaljne podatke
                  </p>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function MapPlaceholder({ 
  data,
  onSelectLocation 
}: { 
  data: AirQualityData[];
  onSelectLocation: (loc: AirQualityData) => void;
}) {
  return (
    <div className="w-full h-full min-h-[400px] p-6 flex flex-col items-center justify-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="text-center space-y-4"
      >
        <span className="text-8xl">🗺️</span>
        <h3 className="text-xl font-semibold">Interaktivna mapa</h3>
        <p className="text-muted-foreground max-w-md">
          {data.length} aktivnih mernih stanica na Balkanu
        </p>
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {data.slice(0, 6).map((item) => (
            <motion.button
              key={item.id}
              onClick={() => onSelectLocation(item)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-sm transition-colors"
            >
              {item.location.name || item.location.city}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function StationListView({ 
  data,
  onSelectLocation 
}: { 
  data: AirQualityData[];
  onSelectLocation: (loc: AirQualityData) => void;
}) {
  const sortedData = [...data].sort((a, b) => a.aqi - b.aqi);

  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
      {sortedData.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.02 }}
        >
          <GlassCard 
            className="p-4 cursor-pointer hover:bg-white/10 transition-colors"
            onClick={() => onSelectLocation(item)}
          >
            <div className="flex items-center gap-4">
              <AQIGauge value={item.aqi} size="sm" showLabel={false} />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold truncate">
                  {item.location.name || item.location.city}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {item.location.city}{item.location.region ? `, ${item.location.region}` : ''}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-muted-foreground">{item.source}</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );
}

function CompareView({ data }: { data: AirQualityData[] }) {
  const sortedData = [...data].sort((a, b) => a.aqi - b.aqi);
  const best = sortedData.slice(0, 5);
  const worst = sortedData.slice(-5).reverse();

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <GlassCard>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-2xl">✅</span> Najbolji kvalitet
        </h3>
        <div className="space-y-3">
          {best.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              <span className="text-lg font-bold text-muted-foreground w-6">
                {index + 1}
              </span>
              <div className="flex-1">
                <p className="font-medium">{item.location.name || item.location.city}</p>
                <p className="text-xs text-muted-foreground">{item.location.region}</p>
              </div>
              <span className="font-bold text-green-500">{item.aqi}</span>
            </motion.div>
          ))}
        </div>
      </GlassCard>

      <GlassCard>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span className="text-2xl">⚠️</span> Najlošiji kvalitet
        </h3>
        <div className="space-y-3">
          {worst.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              <span className="text-lg font-bold text-muted-foreground w-6">
                {index + 1}
              </span>
              <div className="flex-1">
                <p className="font-medium">{item.location.name || item.location.city}</p>
                <p className="text-xs text-muted-foreground">{item.location.region}</p>
              </div>
              <span className="font-bold text-red-500">{item.aqi}</span>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

function LocationDetail({ location }: { location: AirQualityData }) {
  return (
    <AnimatedContainer animation="slideLeft">
      <GlassCard className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h3 className="text-xl font-semibold">
            {location.location.name || location.location.city}
          </h3>
          <p className="text-sm text-muted-foreground">
            {location.location.city}{location.location.region ? `, ${location.location.region}` : ''}
          </p>
        </div>

        {/* AQI Gauge */}
        <div className="flex justify-center">
          <AQIGauge value={location.aqi} size="lg" />
        </div>

        {/* Linear Indicator */}
        <LinearAQIIndicator value={location.aqi} />

        {/* Pollutants */}
        <div className="space-y-4">
          <h4 className="font-semibold">Zagađivači</h4>
          {location.parameters.pm25 !== undefined && (
            <PollutantBar
              name="PM2.5"
              value={location.parameters.pm25}
              unit="µg/m³"
              maxValue={75}
              color="#ef4444"
            />
          )}
          {location.parameters.pm10 !== undefined && (
            <PollutantBar
              name="PM10"
              value={location.parameters.pm10}
              unit="µg/m³"
              maxValue={150}
              color="#f97316"
            />
          )}
          {location.parameters.o3 !== undefined && (
            <PollutantBar
              name="Ozon (O₃)"
              value={location.parameters.o3}
              unit="ppb"
              maxValue={100}
              color="#8b5cf6"
            />
          )}
          {location.parameters.no2 !== undefined && (
            <PollutantBar
              name="NO₂"
              value={location.parameters.no2}
              unit="ppb"
              maxValue={100}
              color="#3b82f6"
            />
          )}
          {location.parameters.so2 !== undefined && (
            <PollutantBar
              name="SO₂"
              value={location.parameters.so2}
              unit="ppb"
              maxValue={75}
              color="#eab308"
            />
          )}
          {location.parameters.co !== undefined && (
            <PollutantBar
              name="CO"
              value={location.parameters.co}
              unit="ppm"
              maxValue={10}
              color="#6b7280"
            />
          )}
        </div>

        {/* Metadata */}
        <div className="pt-4 border-t border-border/50 text-xs text-muted-foreground space-y-1">
          <p>Izvor: {location.source}</p>
          <p>Koordinate: {location.location.coordinates[1].toFixed(4)}, {location.location.coordinates[0].toFixed(4)}</p>
          <p>Poslednje ažuriranje: {new Date(location.timestamp).toLocaleString("sr-RS")}</p>
        </div>
      </GlassCard>
    </AnimatedContainer>
  );
}
