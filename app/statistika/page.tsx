'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { PageErrorBoundary } from '@/components/common/PageErrorBoundary';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  Download,
  Filter,
  ChevronDown,
  MapPin,
  FileSpreadsheet,
  FileText,
  Check,
  X,
  RefreshCw,
  Clock,
  CalendarDays,
} from 'lucide-react';
import CitySearch, { SearchResult } from '@/components/common/CitySearch';
import { POPULAR_CITIES } from '@/lib/api/balkan-countries';

interface MonthlyData {
  month: string;
  temp: number;
  aqi: number;
  precipitation: number;
}

interface YearlyData {
  year: number;
  avgTemp: number;
  avgAqi: number;
  extremeHot: number;
  extremeCold: number;
}

interface PollutedDay {
  date: string;
  aqi: number;
  cause: string;
}

// Date range presets
const DATE_PRESETS = [
  { id: '7d', label: 'Poslednjih 7 dana' },
  { id: '30d', label: 'Poslednjih 30 dana' },
  { id: '90d', label: 'Poslednjih 90 dana' },
  { id: '1y', label: 'Poslednjih godinu dana' },
  { id: '5y', label: 'Poslednjih 5 godina' },
  { id: 'custom', label: 'Prilagođeno...' },
];

// Generate mock data based on city and date range
const generateMockData = (cityName: string, dateRange: string): {
  monthly: MonthlyData[];
  yearly: YearlyData[];
  polluted: PollutedDay[];
} => {
  // Simple hash to make data different per city
  const hash = cityName.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
  
  const monthly: MonthlyData[] = [
    { month: 'Jan', temp: 2 + (hash % 5), aqi: 85 - (hash % 20), precipitation: 45 + (hash % 15) },
    { month: 'Feb', temp: 5 + (hash % 4), aqi: 78 - (hash % 18), precipitation: 40 + (hash % 12) },
    { month: 'Mar', temp: 10 + (hash % 3), aqi: 65 - (hash % 15), precipitation: 50 + (hash % 10) },
    { month: 'Apr', temp: 15 + (hash % 3), aqi: 55 - (hash % 12), precipitation: 55 + (hash % 20) },
    { month: 'Maj', temp: 20 + (hash % 4), aqi: 48 - (hash % 10), precipitation: 70 + (hash % 15) },
    { month: 'Jun', temp: 24 + (hash % 3), aqi: 52 - (hash % 8), precipitation: 65 - (hash % 20) },
    { month: 'Jul', temp: 27 + (hash % 4), aqi: 58 - (hash % 10), precipitation: 45 - (hash % 15) },
    { month: 'Avg', temp: 26 + (hash % 3), aqi: 62 - (hash % 12), precipitation: 40 - (hash % 10) },
    { month: 'Sep', temp: 21 + (hash % 3), aqi: 55 - (hash % 10), precipitation: 50 + (hash % 10) },
    { month: 'Okt', temp: 14 + (hash % 4), aqi: 68 - (hash % 15), precipitation: 55 + (hash % 15) },
    { month: 'Nov', temp: 8 + (hash % 3), aqi: 82 - (hash % 18), precipitation: 60 + (hash % 10) },
    { month: 'Dec', temp: 3 + (hash % 4), aqi: 90 - (hash % 20), precipitation: 50 + (hash % 12) },
  ];

  const yearly: YearlyData[] = [
    { year: 2020, avgTemp: 13.2 + (hash % 2), avgAqi: 72 - (hash % 10), extremeHot: 38 + (hash % 4), extremeCold: -12 - (hash % 5) },
    { year: 2021, avgTemp: 12.8 + (hash % 2), avgAqi: 68 - (hash % 8), extremeHot: 36 + (hash % 3), extremeCold: -15 - (hash % 4) },
    { year: 2022, avgTemp: 14.1 + (hash % 2), avgAqi: 65 - (hash % 7), extremeHot: 40 + (hash % 3), extremeCold: -8 - (hash % 4) },
    { year: 2023, avgTemp: 14.5 + (hash % 2), avgAqi: 62 - (hash % 6), extremeHot: 41 + (hash % 3), extremeCold: -10 - (hash % 3) },
    { year: 2024, avgTemp: 15.2 + (hash % 2), avgAqi: 58 - (hash % 5), extremeHot: 42 + (hash % 2), extremeCold: -6 - (hash % 3) },
  ];

  const causes = ['Grejanje + bezvetrije', 'Inverzija vazduha', 'Gust saobraćaj', 'Grejanje', 'Industrijski izvori'];
  const polluted: PollutedDay[] = [
    { date: '15. Jan 2024', aqi: 156 - (hash % 30), cause: causes[hash % 5] },
    { date: '22. Dec 2023', aqi: 148 - (hash % 25), cause: causes[(hash + 1) % 5] },
    { date: '8. Feb 2024', aqi: 142 - (hash % 20), cause: causes[(hash + 2) % 5] },
    { date: '3. Jan 2024', aqi: 138 - (hash % 18), cause: causes[(hash + 3) % 5] },
    { date: '28. Nov 2023', aqi: 135 - (hash % 15), cause: causes[(hash + 4) % 5] },
  ];

  return { monthly, yearly, polluted };
};

const records = [
  { label: 'Najviša temperatura', value: '42.6°C', date: '24. Jul 2023', trend: 'up' },
  { label: 'Najniža temperatura', value: '-26.2°C', date: '12. Jan 2017', trend: 'down' },
  { label: 'Najviši AQI', value: '312', date: '15. Jan 2020', trend: 'up' },
  { label: 'Najviše padavina (dan)', value: '89mm', date: '2. Jun 2022', trend: 'up' },
];

export default function StatisticsPage() {  return (
    <PageErrorBoundary pageName="Statistika">
      <StatistikaContent />
    </PageErrorBoundary>
  );
}

function StatistikaContent() {  const [selectedCity, setSelectedCity] = useState<SearchResult>(POPULAR_CITIES[0]);
  const [dateRange, setDateRange] = useState<string>('1y');
  const [dataType, setDataType] = useState<'temperature' | 'aqi' | 'precipitation'>('temperature');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customDateStart, setCustomDateStart] = useState('');
  const [customDateEnd, setCustomDateEnd] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  
  const exportRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Generate data based on selected city and date range
  const { monthly: monthlyAverages, yearly: yearlyComparison, polluted: topPollutedDays } = 
    generateMockData(selectedCity.name, dateRange);

  const maxTemp = Math.max(...monthlyAverages.map(m => m.temp));
  const maxAqi = Math.max(...monthlyAverages.map(m => m.aqi));
  const maxPrecip = Math.max(...monthlyAverages.map(m => m.precipitation));

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setShowExportMenu(false);
      }
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle city selection
  const handleCitySelect = useCallback((city: SearchResult) => {
    setIsLoading(true);
    setSelectedCity(city);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setLastUpdated(new Date());
    }, 800);
  }, []);

  // Handle date range change
  const handleDateRangeChange = (range: string) => {
    if (range === 'custom') {
      setShowDatePicker(true);
    } else {
      setDateRange(range);
      setShowDatePicker(false);
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setLastUpdated(new Date());
      }, 500);
    }
  };

  // Apply custom date range
  const applyCustomDateRange = () => {
    if (customDateStart && customDateEnd) {
      setDateRange(`${customDateStart} - ${customDateEnd}`);
      setShowDatePicker(false);
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setLastUpdated(new Date());
      }, 500);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Mesec', 'Temperatura (°C)', 'AQI', 'Padavine (mm)'];
    const rows = monthlyAverages.map(m => [m.month, m.temp, m.aqi, m.precipitation]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `statistika_${selectedCity.name}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    setShowExportMenu(false);
  };

  // Export to PDF (simplified - creates printable view)
  const exportToPDF = () => {
    const printContent = `
      <html>
        <head>
          <title>Statistika - ${selectedCity.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #1e293b; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
            th { background: #f1f5f9; }
            .summary { display: flex; gap: 20px; margin-bottom: 20px; }
            .stat-box { border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; }
          </style>
        </head>
        <body>
          <h1>Statistika za ${selectedCity.name}, ${selectedCity.country}</h1>
          <p>Period: ${DATE_PRESETS.find(p => p.id === dateRange)?.label || dateRange}</p>
          <p>Generisano: ${new Date().toLocaleDateString('sr-Latn-RS')}</p>
          
          <h2>Mesečni proseci</h2>
          <table>
            <tr><th>Mesec</th><th>Temperatura</th><th>AQI</th><th>Padavine</th></tr>
            ${monthlyAverages.map(m => `<tr><td>${m.month}</td><td>${m.temp}°C</td><td>${m.aqi}</td><td>${m.precipitation}mm</td></tr>`).join('')}
          </table>
          
          <h2>Godišnje poređenje</h2>
          <table>
            <tr><th>Godina</th><th>Prosečna temp.</th><th>Prosečni AQI</th><th>Maks temp.</th><th>Min temp.</th></tr>
            ${yearlyComparison.map(y => `<tr><td>${y.year}</td><td>${y.avgTemp}°C</td><td>${y.avgAqi}</td><td>${y.extremeHot}°C</td><td>${y.extremeCold}°C</td></tr>`).join('')}
          </table>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
    setShowExportMenu(false);
  };

  // Refresh data
  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setLastUpdated(new Date());
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0a0e17]">
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
            
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-3xl font-display font-bold text-white">Statistika</h1>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin size={16} />
                    <span>{selectedCity.name}, {selectedCity.country}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <Clock size={14} />
                    <span>Ažurirano: {lastUpdated.toLocaleTimeString('sr-Latn-RS')}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3">
                {/* City Selector */}
                <div className="w-full sm:w-64">
                  <CitySearch 
                    onCitySelect={handleCitySelect}
                    initialValue={selectedCity.name}
                    className="w-full"
                    placeholder="Izaberi grad..."
                  />
                </div>

                {/* Date Range Selector */}
                <div className="relative" ref={datePickerRef}>
                  <button
                    onClick={() => setShowDatePicker(!showDatePicker)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-300 hover:bg-slate-800 hover:border-slate-600 transition-all"
                  >
                    <CalendarDays size={18} />
                    <span className="hidden sm:inline">{DATE_PRESETS.find(p => p.id === dateRange)?.label || dateRange}</span>
                    <ChevronDown size={16} className={`transition-transform ${showDatePicker ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showDatePicker && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden"
                      >
                        <div className="p-2">
                          {DATE_PRESETS.filter(p => p.id !== 'custom').map((preset) => (
                            <button
                              key={preset.id}
                              onClick={() => handleDateRangeChange(preset.id)}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                                dateRange === preset.id
                                  ? 'bg-primary-500/20 text-primary-400'
                                  : 'text-slate-300 hover:bg-slate-800'
                              }`}
                            >
                              {preset.label}
                              {dateRange === preset.id && <Check size={16} />}
                            </button>
                          ))}
                        </div>
                        
                        <div className="border-t border-slate-700 p-3">
                          <p className="text-sm text-slate-400 mb-2">Prilagođeni opseg:</p>
                          <div className="flex gap-2 mb-2">
                            <input
                              type="date"
                              value={customDateStart}
                              onChange={(e) => setCustomDateStart(e.target.value)}
                              className="flex-1 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-primary-500"
                            />
                            <input
                              type="date"
                              value={customDateEnd}
                              onChange={(e) => setCustomDateEnd(e.target.value)}
                              className="flex-1 px-2 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-primary-500"
                            />
                          </div>
                          <button
                            onClick={applyCustomDateRange}
                            disabled={!customDateStart || !customDateEnd}
                            className="w-full py-2 bg-primary-500 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-600 transition-colors"
                          >
                            Primeni
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Refresh Button */}
                <button
                  onClick={refreshData}
                  disabled={isLoading}
                  className="p-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all disabled:opacity-50"
                  title="Osveži podatke"
                >
                  <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                </button>

                {/* Export Button */}
                <div className="relative" ref={exportRef}>
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors font-medium"
                  >
                    <Download size={18} />
                    <span className="hidden sm:inline">Izvezi</span>
                    <ChevronDown size={16} className={`transition-transform ${showExportMenu ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showExportMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full right-0 mt-2 w-48 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden"
                      >
                        <button
                          onClick={exportToCSV}
                          className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 transition-colors"
                        >
                          <FileSpreadsheet size={18} className="text-green-400" />
                          Izvezi kao CSV
                        </button>
                        <button
                          onClick={exportToPDF}
                          className="w-full flex items-center gap-3 px-4 py-3 text-slate-300 hover:bg-slate-800 transition-colors"
                        >
                          <FileText size={18} className="text-red-400" />
                          Izvezi kao PDF
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Loading Overlay */}
          <AnimatePresence>
            {isLoading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 flex items-center justify-center"
              >
                <div className="bg-slate-800 rounded-2xl p-6 flex flex-col items-center gap-4">
                  <RefreshCw size={32} className="text-primary-400 animate-spin" />
                  <p className="text-white">Učitavanje podataka...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

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
