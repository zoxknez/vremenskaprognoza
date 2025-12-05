'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Navigation } from '@/components/layout/Navigation';
import {
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSun,
  Droplets,
  Wind,
  Thermometer,
  Gauge,
  Eye,
  ArrowLeft,
  ChevronDown,
  Calendar,
  Clock,
  Sunrise,
  Sunset,
  TrendingUp,
  TrendingDown,
  Umbrella,
  Snowflake,
} from 'lucide-react';

const hourlyData = Array.from({ length: 24 }, (_, i) => ({
  time: `${String(i).padStart(2, '0')}:00`,
  temp: Math.round(18 + Math.sin(i / 4) * 8 + Math.random() * 2),
  feelsLike: Math.round(17 + Math.sin(i / 4) * 9 + Math.random() * 2),
  humidity: Math.round(50 + Math.cos(i / 6) * 20),
  windSpeed: Math.round(8 + Math.random() * 10),
  precipitation: i >= 14 && i <= 18 ? Math.round(Math.random() * 60) : 0,
  icon: i >= 6 && i < 20 ? (i >= 14 && i <= 18 ? 'rainy' : (i >= 10 && i <= 14 ? 'sunny' : 'partly-cloudy')) : 'night',
}));

const weeklyData = [
  { day: 'Ponedeljak', date: '24 jun', high: 28, low: 18, icon: 'sunny', precipitation: 0, wind: 12, humidity: 55, sunrise: '05:42', sunset: '20:31', description: 'Sunčano i toplo' },
  { day: 'Utorak', date: '25 jun', high: 30, low: 19, icon: 'sunny', precipitation: 5, wind: 8, humidity: 50, sunrise: '05:42', sunset: '20:31', description: 'Pretežno sunčano' },
  { day: 'Sreda', date: '26 jun', high: 27, low: 20, icon: 'partly-cloudy', precipitation: 20, wind: 15, humidity: 60, sunrise: '05:43', sunset: '20:31', description: 'Delimično oblačno' },
  { day: 'Četvrtak', date: '27 jun', high: 24, low: 17, icon: 'rainy', precipitation: 80, wind: 20, humidity: 75, sunrise: '05:43', sunset: '20:31', description: 'Kiša tokom dana' },
  { day: 'Petak', date: '28 jun', high: 22, low: 15, icon: 'rainy', precipitation: 60, wind: 18, humidity: 70, sunrise: '05:44', sunset: '20:30', description: 'Povremena kiša' },
  { day: 'Subota', date: '29 jun', high: 25, low: 16, icon: 'partly-cloudy', precipitation: 30, wind: 14, humidity: 62, sunrise: '05:44', sunset: '20:30', description: 'Promenljivo oblačno' },
  { day: 'Nedelja', date: '30 jun', high: 27, low: 17, icon: 'sunny', precipitation: 10, wind: 10, humidity: 55, sunrise: '05:45', sunset: '20:30', description: 'Sunčano' },
];

function WeatherIcon({ type, size = 24, className = '' }: { type: string; size?: number; className?: string }) {
  const iconProps = { size, className };
  
  switch (type) {
    case 'sunny':
      return <Sun {...iconProps} className={`text-weather-sunny ${className}`} />;
    case 'cloudy':
      return <Cloud {...iconProps} className={`text-weather-cloudy ${className}`} />;
    case 'partly-cloudy':
      return <CloudSun {...iconProps} className={`text-slate-400 ${className}`} />;
    case 'rainy':
      return <CloudRain {...iconProps} className={`text-weather-rainy ${className}`} />;
    case 'night':
      return <Moon {...iconProps} className={`text-indigo-400 ${className}`} />;
    case 'snow':
      return <Snowflake {...iconProps} className={`text-blue-300 ${className}`} />;
    default:
      return <Sun {...iconProps} className={`text-weather-sunny ${className}`} />;
  }
}

function getTempColor(temp: number): string {
  if (temp < 10) return 'text-temp-cold';
  if (temp < 18) return 'text-temp-cool';
  if (temp < 24) return 'text-temp-mild';
  if (temp < 30) return 'text-temp-warm';
  return 'text-temp-hot';
}

export default function ForecastPage() {
  const [activeTab, setActiveTab] = useState<'hourly' | 'weekly'>('weekly');
  const [selectedDay, setSelectedDay] = useState(0);

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
                <h1 className="text-3xl font-display font-bold text-white">Vremenska prognoza</h1>
                <p className="text-slate-400 mt-1">Beograd, Srbija</p>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('hourly')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'hourly'
                      ? 'bg-primary-600 text-white'
                      : 'bg-slate-800/50 text-slate-400 hover:text-white'
                  }`}
                >
                  <Clock size={16} className="inline mr-2" />
                  Satna
                </button>
                <button
                  onClick={() => setActiveTab('weekly')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'weekly'
                      ? 'bg-primary-600 text-white'
                      : 'bg-slate-800/50 text-slate-400 hover:text-white'
                  }`}
                >
                  <Calendar size={16} className="inline mr-2" />
                  7 dana
                </button>
              </div>
            </div>
          </motion.div>

          {/* Hourly View */}
          {activeTab === 'hourly' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Temperature Graph */}
              <div className="neo-card p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Temperatura tokom dana</h2>
                
                <div className="relative h-48">
                  {/* Y-axis labels */}
                  <div className="absolute left-0 top-0 bottom-0 w-12 flex flex-col justify-between text-xs text-slate-500">
                    <span>30°</span>
                    <span>25°</span>
                    <span>20°</span>
                    <span>15°</span>
                  </div>
                  
                  {/* Graph area */}
                  <div className="ml-12 h-full flex items-end gap-1 overflow-x-auto scrollbar-hide">
                    {hourlyData.map((hour, index) => (
                      <div key={index} className="flex-1 min-w-[40px] flex flex-col items-center gap-2">
                        <div 
                          className="w-full bg-gradient-to-t from-primary-600 to-primary-400 rounded-t-md transition-all hover:from-primary-500 hover:to-primary-300"
                          style={{ height: `${((hour.temp - 10) / 25) * 100}%`, minHeight: '20px' }}
                        />
                        <span className="text-xs text-slate-500">{hour.time.slice(0, 2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hourly Details */}
              <div className="neo-card p-6">
                <h2 className="text-xl font-semibold text-white mb-6">Detaljna satna prognoza</h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-slate-500 text-sm border-b border-slate-800">
                        <th className="pb-4 pr-4">Vreme</th>
                        <th className="pb-4 pr-4">Temp</th>
                        <th className="pb-4 pr-4">Osećaj</th>
                        <th className="pb-4 pr-4">Vlažnost</th>
                        <th className="pb-4 pr-4">Vetar</th>
                        <th className="pb-4">Padavine</th>
                      </tr>
                    </thead>
                    <tbody>
                      {hourlyData.map((hour, index) => (
                        <tr key={index} className="border-b border-slate-800/50 hover:bg-slate-800/20">
                          <td className="py-4 pr-4">
                            <div className="flex items-center gap-3">
                              <WeatherIcon type={hour.icon} size={24} />
                              <span className="text-white font-medium">{hour.time}</span>
                            </div>
                          </td>
                          <td className={`py-4 pr-4 font-semibold ${getTempColor(hour.temp)}`}>
                            {hour.temp}°
                          </td>
                          <td className="py-4 pr-4 text-slate-400">
                            {hour.feelsLike}°
                          </td>
                          <td className="py-4 pr-4 text-slate-400">
                            <div className="flex items-center gap-1">
                              <Droplets size={14} className="text-blue-400" />
                              {hour.humidity}%
                            </div>
                          </td>
                          <td className="py-4 pr-4 text-slate-400">
                            <div className="flex items-center gap-1">
                              <Wind size={14} />
                              {hour.windSpeed} km/h
                            </div>
                          </td>
                          <td className="py-4">
                            {hour.precipitation > 0 ? (
                              <div className="flex items-center gap-1 text-blue-400">
                                <Umbrella size={14} />
                                {hour.precipitation}%
                              </div>
                            ) : (
                              <span className="text-slate-600">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* Weekly View */}
          {activeTab === 'weekly' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid lg:grid-cols-3 gap-8"
            >
              {/* Weekly List */}
              <div className="lg:col-span-2 space-y-4">
                {weeklyData.map((day, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedDay(index)}
                    className={`neo-card p-6 cursor-pointer transition-all ${
                      selectedDay === index 
                        ? 'ring-2 ring-primary-500 ring-offset-2 ring-offset-[#0a0e17]' 
                        : 'hover:bg-slate-800/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-slate-800/50 flex items-center justify-center">
                          <WeatherIcon type={day.icon} size={36} />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{day.day}</h3>
                          <p className="text-slate-500">{day.date}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <p className="text-slate-400 hidden sm:block">{day.description}</p>
                        
                        {day.precipitation > 20 && (
                          <div className="flex items-center gap-1 text-blue-400">
                            <Droplets size={16} />
                            <span>{day.precipitation}%</span>
                          </div>
                        )}
                        
                        <div className="text-right">
                          <span className={`text-2xl font-bold ${getTempColor(day.high)}`}>{day.high}°</span>
                          <span className="text-slate-500 text-lg ml-2">{day.low}°</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Selected Day Details */}
              <div className="lg:col-span-1">
                <motion.div
                  key={selectedDay}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="neo-card p-6 sticky top-24"
                >
                  <div className="text-center mb-6">
                    <div className="w-24 h-24 mx-auto rounded-3xl bg-slate-800/50 flex items-center justify-center mb-4">
                      <WeatherIcon type={weeklyData[selectedDay].icon} size={56} />
                    </div>
                    <h3 className="text-2xl font-bold text-white">{weeklyData[selectedDay].day}</h3>
                    <p className="text-slate-400">{weeklyData[selectedDay].date}</p>
                    <p className="text-slate-500 mt-2">{weeklyData[selectedDay].description}</p>
                  </div>
                  
                  <div className="flex justify-center gap-8 mb-6">
                    <div className="text-center">
                      <TrendingUp className="text-red-400 mx-auto mb-1" size={20} />
                      <p className={`text-3xl font-bold ${getTempColor(weeklyData[selectedDay].high)}`}>
                        {weeklyData[selectedDay].high}°
                      </p>
                      <p className="text-slate-500 text-sm">Maks</p>
                    </div>
                    <div className="text-center">
                      <TrendingDown className="text-blue-400 mx-auto mb-1" size={20} />
                      <p className="text-3xl font-bold text-blue-400">{weeklyData[selectedDay].low}°</p>
                      <p className="text-slate-500 text-sm">Min</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Droplets size={18} />
                        <span>Padavine</span>
                      </div>
                      <span className="text-white font-medium">{weeklyData[selectedDay].precipitation}%</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Wind size={18} />
                        <span>Vetar</span>
                      </div>
                      <span className="text-white font-medium">{weeklyData[selectedDay].wind} km/h</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Droplets size={18} />
                        <span>Vlažnost</span>
                      </div>
                      <span className="text-white font-medium">{weeklyData[selectedDay].humidity}%</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Sunrise size={18} className="text-amber-400" />
                        <span>Izlazak sunca</span>
                      </div>
                      <span className="text-white font-medium">{weeklyData[selectedDay].sunrise}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-xl">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Sunset size={18} className="text-orange-400" />
                        <span>Zalazak sunca</span>
                      </div>
                      <span className="text-white font-medium">{weeklyData[selectedDay].sunset}</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
