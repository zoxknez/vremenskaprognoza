'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  Download,
  Filter,
  ChevronDown,
} from 'lucide-react';

// Mock statistics data
const monthlyAverages = [
  { month: 'Jan', temp: 2, aqi: 85, precipitation: 45 },
  { month: 'Feb', temp: 5, aqi: 78, precipitation: 40 },
  { month: 'Mar', temp: 10, aqi: 65, precipitation: 50 },
  { month: 'Apr', temp: 15, aqi: 55, precipitation: 55 },
  { month: 'Maj', temp: 20, aqi: 48, precipitation: 70 },
  { month: 'Jun', temp: 24, aqi: 52, precipitation: 65 },
  { month: 'Jul', temp: 27, aqi: 58, precipitation: 45 },
  { month: 'Avg', temp: 26, aqi: 62, precipitation: 40 },
  { month: 'Sep', temp: 21, aqi: 55, precipitation: 50 },
  { month: 'Okt', temp: 14, aqi: 68, precipitation: 55 },
  { month: 'Nov', temp: 8, aqi: 82, precipitation: 60 },
  { month: 'Dec', temp: 3, aqi: 90, precipitation: 50 },
];

const yearlyComparison = [
  { year: 2020, avgTemp: 13.2, avgAqi: 72, extremeHot: 38, extremeCold: -12 },
  { year: 2021, avgTemp: 12.8, avgAqi: 68, extremeHot: 36, extremeCold: -15 },
  { year: 2022, avgTemp: 14.1, avgAqi: 65, extremeHot: 40, extremeCold: -8 },
  { year: 2023, avgTemp: 14.5, avgAqi: 62, extremeHot: 41, extremeCold: -10 },
  { year: 2024, avgTemp: 15.2, avgAqi: 58, extremeHot: 42, extremeCold: -6 },
];

const topPollutedDays = [
  { date: '15. Jan 2024', aqi: 156, cause: 'Grejanje + bezvetrije' },
  { date: '22. Dec 2023', aqi: 148, cause: 'Inverzija vazduha' },
  { date: '8. Feb 2024', aqi: 142, cause: 'Gust saobraćaj' },
  { date: '3. Jan 2024', aqi: 138, cause: 'Grejanje' },
  { date: '28. Nov 2023', aqi: 135, cause: 'Industrijski izvori' },
];

const records = [
  { label: 'Najviša temperatura', value: '42.6°C', date: '24. Jul 2023', trend: 'up' },
  { label: 'Najniža temperatura', value: '-26.2°C', date: '12. Jan 2017', trend: 'down' },
  { label: 'Najviši AQI', value: '312', date: '15. Jan 2020', trend: 'up' },
  { label: 'Najviše padavina (dan)', value: '89mm', date: '2. Jun 2022', trend: 'up' },
];

export default function StatisticsPage() {
  const [timeRange, setTimeRange] = useState<'year' | '5years' | 'all'>('year');
  const [dataType, setDataType] = useState<'temperature' | 'aqi' | 'precipitation'>('temperature');

  const maxTemp = Math.max(...monthlyAverages.map(m => m.temp));
  const maxAqi = Math.max(...monthlyAverages.map(m => m.aqi));
  const maxPrecip = Math.max(...monthlyAverages.map(m => m.precipitation));

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
                <h1 className="text-3xl font-display font-bold text-white">Statistika</h1>
                <p className="text-slate-400 mt-1">Istorijski podaci za Beograd</p>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="btn-secondary">
                  <Download size={18} />
                  Izvezi
                </button>
              </div>
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            {records.map((record, index) => (
              <div key={index} className="neo-card p-5">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-slate-400 text-sm">{record.label}</span>
                  {record.trend === 'up' ? (
                    <TrendingUp size={16} className="text-red-400" />
                  ) : (
                    <TrendingDown size={16} className="text-blue-400" />
                  )}
                </div>
                <p className="text-2xl font-bold text-white">{record.value}</p>
                <p className="text-slate-500 text-sm mt-1">{record.date}</p>
              </div>
            ))}
          </motion.div>

          {/* Main Chart */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="neo-card p-6 mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <h2 className="text-xl font-semibold text-white">Mesečni proseci</h2>
              
              <div className="flex flex-wrap items-center gap-2">
                {/* Data Type Selector */}
                <div className="flex items-center gap-1 bg-slate-800/50 p-1 rounded-lg">
                  {[
                    { id: 'temperature', label: 'Temperatura' },
                    { id: 'aqi', label: 'AQI' },
                    { id: 'precipitation', label: 'Padavine' },
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setDataType(type.id as typeof dataType)}
                      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        dataType === type.id
                          ? 'bg-primary-600 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="h-64">
              <div className="flex items-end justify-between h-full gap-2">
                {monthlyAverages.map((month, index) => {
                  let value: number;
                  let maxValue: number;
                  let color: string;
                  
                  if (dataType === 'temperature') {
                    value = month.temp;
                    maxValue = maxTemp + 5;
                    color = month.temp < 10 ? 'from-blue-500 to-blue-400' : month.temp < 20 ? 'from-cyan-500 to-cyan-400' : 'from-amber-500 to-amber-400';
                  } else if (dataType === 'aqi') {
                    value = month.aqi;
                    maxValue = maxAqi + 10;
                    color = month.aqi < 50 ? 'from-green-500 to-green-400' : month.aqi < 100 ? 'from-yellow-500 to-yellow-400' : 'from-red-500 to-red-400';
                  } else {
                    value = month.precipitation;
                    maxValue = maxPrecip + 10;
                    color = 'from-blue-600 to-blue-400';
                  }

                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2 group">
                      <div className="relative w-full">
                        <div
                          className={`w-full bg-gradient-to-t ${color} rounded-t-lg transition-all group-hover:opacity-80`}
                          style={{ height: `${(value / maxValue) * 200}px`, minHeight: '20px' }}
                        />
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 px-2 py-1 rounded text-xs text-white whitespace-nowrap">
                          {value}{dataType === 'temperature' ? '°C' : dataType === 'precipitation' ? 'mm' : ''}
                        </div>
                      </div>
                      <span className="text-xs text-slate-500">{month.month}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* Year Comparison & Polluted Days */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Yearly Comparison */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="neo-card p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-6">Poređenje po godinama</h2>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-slate-500 text-sm border-b border-slate-800">
                      <th className="pb-3 pr-4">Godina</th>
                      <th className="pb-3 pr-4">Pros. Temp</th>
                      <th className="pb-3 pr-4">Pros. AQI</th>
                      <th className="pb-3 pr-4">Maks</th>
                      <th className="pb-3">Min</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearlyComparison.map((year, index) => (
                      <tr key={index} className="border-b border-slate-800/50">
                        <td className="py-3 pr-4 text-white font-medium">{year.year}</td>
                        <td className="py-3 pr-4 text-slate-300">{year.avgTemp}°C</td>
                        <td className="py-3 pr-4">
                          <span className={year.avgAqi < 60 ? 'text-green-400' : year.avgAqi < 80 ? 'text-yellow-400' : 'text-red-400'}>
                            {year.avgAqi}
                          </span>
                        </td>
                        <td className="py-3 pr-4 text-red-400">{year.extremeHot}°</td>
                        <td className="py-3 text-blue-400">{year.extremeCold}°</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Most Polluted Days */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="neo-card p-6"
            >
              <h2 className="text-xl font-semibold text-white mb-6">Najzagađeniji dani</h2>
              
              <div className="space-y-3">
                {topPollutedDays.map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl">
                    <div className="flex items-center gap-4">
                      <span className="w-8 h-8 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </span>
                      <div>
                        <p className="text-white font-medium">{day.date}</p>
                        <p className="text-slate-500 text-sm">{day.cause}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-red-400 font-bold text-lg">AQI {day.aqi}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Trend Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="neo-card p-6 mt-8"
          >
            <h2 className="text-xl font-semibold text-white mb-6">Analiza trendova</h2>
            
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="p-4 bg-slate-800/30 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="text-red-400" size={20} />
                  <span className="text-slate-400">Temperatura</span>
                </div>
                <p className="text-2xl font-bold text-white">+1.8°C</p>
                <p className="text-slate-500 text-sm mt-1">Porast u poslednjih 5 godina</p>
                <div className="mt-3 h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-400 to-red-400 rounded-full" style={{ width: '75%' }} />
                </div>
              </div>
              
              <div className="p-4 bg-slate-800/30 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="text-green-400" size={20} />
                  <span className="text-slate-400">Kvalitet vazduha</span>
                </div>
                <p className="text-2xl font-bold text-white">-14 AQI</p>
                <p className="text-slate-500 text-sm mt-1">Poboljšanje u poslednjih 5 godina</p>
                <div className="mt-3 h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-red-400 to-green-400 rounded-full" style={{ width: '60%' }} />
                </div>
              </div>
              
              <div className="p-4 bg-slate-800/30 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="text-blue-400" size={20} />
                  <span className="text-slate-400">Padavine</span>
                </div>
                <p className="text-2xl font-bold text-white">+8%</p>
                <p className="text-slate-500 text-sm mt-1">Porast godišnjih padavina</p>
                <div className="mt-3 h-1 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-300 to-blue-600 rounded-full" style={{ width: '55%' }} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
