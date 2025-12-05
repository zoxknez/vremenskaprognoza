'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import {
  Wind,
  Droplets,
  ArrowLeft,
  AlertTriangle,
  Activity,
  Leaf,
  Factory,
  Car,
  Flame,
  Info,
  MapPin,
  RefreshCw,
  ChevronDown,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';

interface PollutantData {
  name: string;
  fullName: string;
  value: number;
  unit: string;
  limit: number;
  trend: 'up' | 'down' | 'stable';
  description: string;
}

const pollutants: PollutantData[] = [
  { name: 'PM2.5', fullName: 'Fine Particulate Matter', value: 45, unit: 'µg/m³', limit: 25, trend: 'up', description: 'Fine particles that can penetrate deep into lungs' },
  { name: 'PM10', fullName: 'Coarse Particulate Matter', value: 72, unit: 'µg/m³', limit: 50, trend: 'stable', description: 'Coarse particles from dust and pollen' },
  { name: 'O₃', fullName: 'Ozone', value: 38, unit: 'ppb', limit: 70, trend: 'down', description: 'Ground-level ozone, main smog component' },
  { name: 'NO₂', fullName: 'Nitrogen Dioxide', value: 28, unit: 'ppb', limit: 53, trend: 'stable', description: 'From vehicle and industrial emissions' },
  { name: 'SO₂', fullName: 'Sulfur Dioxide', value: 12, unit: 'ppb', limit: 35, trend: 'down', description: 'From burning fossil fuels' },
  { name: 'CO', fullName: 'Carbon Monoxide', value: 0.8, unit: 'ppm', limit: 9, trend: 'stable', description: 'From incomplete combustion' },
];

const aqiHistory = [
  { time: '00:00', value: 58 },
  { time: '03:00', value: 52 },
  { time: '06:00', value: 65 },
  { time: '09:00', value: 78 },
  { time: '12:00', value: 72 },
  { time: '15:00', value: 68 },
  { time: '18:00', value: 75 },
  { time: '21:00', value: 62 },
];

const stations = [
  { name: 'Novi Beograd', aqi: 72, distance: '2.1 km', status: 'moderate' },
  { name: 'Stari Grad', aqi: 85, distance: '3.5 km', status: 'sensitive' },
  { name: 'Vračar', aqi: 68, distance: '4.2 km', status: 'moderate' },
  { name: 'Zemun', aqi: 55, distance: '5.8 km', status: 'moderate' },
  { name: 'Voždovac', aqi: 78, distance: '6.1 km', status: 'moderate' },
];

function getAqiInfo(aqi: number) {
  if (aqi <= 50) return { label: 'Dobar', color: 'text-aqi-good', bg: 'bg-aqi-good', description: 'Kvalitet vazduha je zadovoljavajuć' };
  if (aqi <= 100) return { label: 'Umeren', color: 'text-aqi-moderate', bg: 'bg-aqi-moderate', description: 'Prihvatljiv za većinu populacije' };
  if (aqi <= 150) return { label: 'Nezdrav za osetljive', color: 'text-aqi-sensitive', bg: 'bg-aqi-sensitive', description: 'Osetljive grupe mogu imati smetnje' };
  if (aqi <= 200) return { label: 'Nezdrav', color: 'text-aqi-unhealthy', bg: 'bg-aqi-unhealthy', description: 'Svako može početi osećati efekte' };
  if (aqi <= 300) return { label: 'Veoma nezdrav', color: 'text-aqi-veryUnhealthy', bg: 'bg-aqi-veryUnhealthy', description: 'Zdravstvena upozorenja za sve' };
  return { label: 'Opasan', color: 'text-red-500', bg: 'bg-red-600', description: 'Hitna zdravstvena upozorenja' };
}

function getPollutantStatus(value: number, limit: number) {
  const ratio = value / limit;
  if (ratio < 0.5) return { color: 'text-aqi-good', bg: 'bg-aqi-good/20', status: 'Nizak' };
  if (ratio < 1) return { color: 'text-aqi-moderate', bg: 'bg-aqi-moderate/20', status: 'Umeren' };
  if (ratio < 1.5) return { color: 'text-aqi-sensitive', bg: 'bg-aqi-sensitive/20', status: 'Visok' };
  return { color: 'text-aqi-unhealthy', bg: 'bg-aqi-unhealthy/20', status: 'Kritičan' };
}

export default function AirQualityPage() {
  const [currentAqi] = useState(72);
  const aqiInfo = getAqiInfo(currentAqi);
  
  return (
    <div className="min-h-screen bg-[#0a0e17]">
      <Navigation />
      
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors">
              <ArrowLeft size={20} />
              <span>Nazad na početnu</span>
            </Link>
            
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-display font-bold text-white">Kvalitet Vazduha</h1>
                <div className="flex items-center gap-2 mt-1 text-slate-400">
                  <MapPin size={16} />
                  <span>Beograd, Srbija</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-500">Ažurirano pre 5 min</span>
                </div>
              </div>
              
              <button className="btn-secondary">
                <RefreshCw size={18} />
                Osveži
              </button>
            </div>
          </motion.div>

          {/* Main AQI Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="neo-card p-8 mb-8"
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-8">
              {/* AQI Circle */}
              <div className="flex-shrink-0">
                <div className="relative w-48 h-48 mx-auto lg:mx-0">
                  {/* Background ring */}
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      className="text-slate-800"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="8"
                      strokeDasharray={`${(currentAqi / 300) * 283} 283`}
                      strokeLinecap="round"
                      className={aqiInfo.color}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`text-5xl font-display font-bold ${aqiInfo.color}`}>{currentAqi}</span>
                    <span className="text-slate-400 text-sm mt-1">AQI</span>
                  </div>
                </div>
              </div>
              
              {/* AQI Info */}
              <div className="flex-1 text-center lg:text-left">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${aqiInfo.bg}/20 border border-current/30 ${aqiInfo.color} mb-4`}>
                  <Activity size={18} />
                  <span className="font-semibold">{aqiInfo.label}</span>
                </div>
                <p className="text-slate-300 text-lg mb-4">{aqiInfo.description}</p>
                
                {/* Health Recommendations */}
                <div className="grid sm:grid-cols-2 gap-4 mt-6">
                  <div className="p-4 bg-slate-800/30 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                      <Activity size={16} />
                      <span className="text-sm font-medium">Fizička aktivnost</span>
                    </div>
                    <p className="text-white text-sm">Umerena aktivnost na otvorenom je bezbedna</p>
                  </div>
                  <div className="p-4 bg-slate-800/30 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-400 mb-2">
                      <Wind size={16} />
                      <span className="text-sm font-medium">Ventilacija</span>
                    </div>
                    <p className="text-white text-sm">Provetravanje prostorija je preporučljivo</p>
                  </div>
                </div>
              </div>
              
              {/* Mini Stats */}
              <div className="grid grid-cols-2 gap-4 lg:w-56">
                <div className="stat-card">
                  <span className="stat-label">PM2.5</span>
                  <span className="stat-value text-aqi-moderate">45</span>
                  <span className="text-xs text-slate-500">µg/m³</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">PM10</span>
                  <span className="stat-value text-aqi-sensitive">72</span>
                  <span className="text-xs text-slate-500">µg/m³</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">O₃</span>
                  <span className="stat-value text-aqi-good">38</span>
                  <span className="text-xs text-slate-500">ppb</span>
                </div>
                <div className="stat-card">
                  <span className="stat-label">NO₂</span>
                  <span className="stat-value text-aqi-good">28</span>
                  <span className="text-xs text-slate-500">ppb</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Grid Layout */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Pollutants */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-2 neo-card p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-6">Zagađivači</h2>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {pollutants.map((pollutant, index) => {
                  const status = getPollutantStatus(pollutant.value, pollutant.limit);
                  return (
                    <div key={index} className={`p-4 rounded-xl ${status.bg} border border-slate-800/50`}>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className={`font-bold ${status.color}`}>{pollutant.name}</h3>
                          <p className="text-xs text-slate-500">{pollutant.fullName}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {pollutant.trend === 'up' && <TrendingUp size={14} className="text-red-400" />}
                          {pollutant.trend === 'down' && <TrendingDown size={14} className="text-green-400" />}
                          <span className={`text-xs ${status.color}`}>{status.status}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-end gap-2">
                        <span className="text-2xl font-bold text-white">{pollutant.value}</span>
                        <span className="text-slate-500 text-sm mb-1">{pollutant.unit}</span>
                      </div>
                      
                      {/* Progress bar */}
                      <div className="mt-3 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${status.bg} rounded-full`}
                          style={{ width: `${Math.min((pollutant.value / pollutant.limit) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-1">Limit: {pollutant.limit} {pollutant.unit}</p>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Nearby Stations */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="neo-card p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-6">Obližnje stanice</h2>
              
              <div className="space-y-3">
                {stations.map((station, index) => {
                  const info = getAqiInfo(station.aqi);
                  return (
                    <Link
                      key={index}
                      href={`/stanica/${station.name.toLowerCase().replace(' ', '-')}`}
                      className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/30 transition-colors group"
                    >
                      <div>
                        <p className="text-white font-medium group-hover:text-primary-400 transition-colors">{station.name}</p>
                        <p className="text-slate-500 text-sm">{station.distance}</p>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${info.bg}/20`}>
                        <span className={`font-bold ${info.color}`}>{station.aqi}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* 24h History Chart */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="neo-card p-6 mt-8"
          >
            <h2 className="text-xl font-semibold text-white mb-6">AQI tokom dana</h2>
            
            <div className="h-48">
              <div className="flex items-end justify-between h-full gap-2">
                {aqiHistory.map((point, index) => {
                  const info = getAqiInfo(point.value);
                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                      <span className={`text-xs font-medium ${info.color}`}>{point.value}</span>
                      <div 
                        className={`w-full rounded-t-lg transition-all hover:opacity-80 ${info.bg}`}
                        style={{ height: `${(point.value / 150) * 100}%`, minHeight: '20px' }}
                      />
                      <span className="text-xs text-slate-500">{point.time}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Sources Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            {[
              { icon: Factory, label: 'Industrija', value: '35%' },
              { icon: Car, label: 'Saobraćaj', value: '40%' },
              { icon: Flame, label: 'Grejanje', value: '20%' },
              { icon: Leaf, label: 'Ostalo', value: '5%' },
            ].map((source, index) => (
              <div key={index} className="flat-card p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-800/50 flex items-center justify-center">
                    <source.icon size={20} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">{source.label}</p>
                    <p className="text-white font-bold">{source.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
