import { motion } from "framer-motion";
import {
  MapPin,
  Clock,
  RefreshCw,
  Droplets,
  Wind,
  Gauge,
  Eye,
  Heart,
} from "lucide-react";
import { WeatherData } from "@/lib/types/weather";
import { getWeatherIcon } from "./weather-utils";
import { Skeleton } from "@/components/ui/Skeleton";

interface WeatherCardProps {
  data: WeatherData;
  loading: boolean;
  onRefresh: () => void;
  currentTime: string;
  currentDate: string;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

// Helper to get dynamic gradient based on weather
const getWeatherGradient = (description: string) => {
  const desc = description.toLowerCase();
  if (desc.includes("clear") || desc.includes("sun") || desc.includes("vedro") || desc.includes("sunčano")) return "from-amber-500/20 via-orange-500/10 to-yellow-500/5 border-amber-500/20";
  if (desc.includes("cloud") || desc.includes("oblač")) return "from-slate-400/20 via-slate-500/10 to-gray-500/5 border-slate-400/20";
  if (desc.includes("rain") || desc.includes("kiš") || desc.includes("drizzle")) return "from-blue-600/20 via-cyan-600/10 to-sky-600/5 border-blue-500/20";
  if (desc.includes("snow") || desc.includes("sneg")) return "from-indigo-200/20 via-blue-200/10 to-slate-200/5 border-indigo-200/20";
  if (desc.includes("thunder") || desc.includes("storm") || desc.includes("grmljavin")) return "from-purple-600/20 via-indigo-600/10 to-slate-900/5 border-purple-500/20";
  if (desc.includes("mist") || desc.includes("fog") || desc.includes("magl")) return "from-emerald-600/20 via-teal-600/10 to-slate-600/5 border-emerald-500/20";
  return "from-cyan-600/20 via-blue-600/20 to-purple-600/20 border-slate-700/50";
};

export default function WeatherCard({
  data,
  loading,
  onRefresh,
  currentTime,
  currentDate,
  isFavorite,
  onToggleFavorite,
}: WeatherCardProps) {
  if (loading) {
    return (
      <div className="lg:col-span-2 relative overflow-hidden rounded-[2.5rem] bg-slate-900/50 border border-slate-800 p-8 h-[400px]">
        <div className="flex justify-between mb-8">
          <div className="space-y-3">
            <Skeleton className="h-8 w-48 rounded-xl" />
            <Skeleton className="h-4 w-32 rounded-lg" />
          </div>
          <div className="flex flex-col items-end gap-2">
            <Skeleton className="h-4 w-24 rounded-lg" />
            <Skeleton className="h-4 w-20 rounded-lg" />
          </div>
        </div>
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-8">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-3">
              <Skeleton className="h-24 w-48 rounded-2xl" />
              <Skeleton className="h-6 w-32 rounded-lg" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const gradientClass = getWeatherGradient(data.description);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, type: "spring", bounce: 0.3 }}
      className="lg:col-span-2"
    >
      <div className={`relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br ${gradientClass} backdrop-blur-2xl p-8 transition-colors duration-700 shadow-2xl shadow-black/10 group`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-black rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-12">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="flex items-center gap-2 text-white">
                  <MapPin className="w-6 h-6 text-cyan-400 drop-shadow-glow" />
                  <span className="text-2xl font-display font-bold tracking-tight">
                    {data.city}, {data.country}
                  </span>
                </div>
                <button
                  onClick={onToggleFavorite}
                  className="p-2 rounded-full hover:bg-white/10 transition-all duration-300 active:scale-90"
                >
                  <Heart
                    className={`w-6 h-6 transition-all duration-300 ${isFavorite ? "fill-red-500 text-red-500 scale-110" : "text-slate-400 hover:text-red-400"
                      }`}
                  />
                </button>
              </div>
              <p className="text-slate-300 font-medium capitalize pl-8">{currentDate}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-2 text-slate-300 mb-2 font-mono bg-black/20 px-3 py-1 rounded-full border border-white/5">
                <Clock className="w-4 h-4" />
                <span>{currentTime}</span>
              </div>
              <button
                onClick={onRefresh}
                disabled={loading}
                className="flex items-center gap-2 text-cyan-300 hover:text-cyan-200 transition-colors text-sm font-medium ml-auto px-2 py-1 rounded-lg hover:bg-white/5"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Osveži
              </button>
            </div>
          </div>

          {/* Main Temperature */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex items-center gap-8">
              <div className="text-white drop-shadow-2xl filter brightness-110 transform group-hover:scale-110 transition-transform duration-500">
                {getWeatherIcon(data.description, 100)}
              </div>
              <div>
                <div className="text-9xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/60 tracking-tighter leading-none -ml-2">
                  {data.temperature}°
                </div>
                <p className="text-xl text-slate-200 font-medium capitalize mt-2 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  {data.description}
                </p>
              </div>
            </div>
            <div className="hidden md:flex flex-col items-end justify-center h-full">
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-right min-w-[140px]">
                <p className="text-slate-400 text-sm mb-1">Oseća se kao</p>
                <p className="text-4xl font-display font-bold text-white">
                  {data.feelsLike}°
                </p>
              </div>
            </div>
          </div>

          {/* Weather Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-800/30 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Droplets className="w-4 h-4" />
                <span className="text-sm">Vlažnost</span>
              </div>
              <p className="text-2xl text-white font-light">{data.humidity}%</p>
            </div>
            <div className="bg-slate-800/30 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Wind className="w-4 h-4" />
                <span className="text-sm">Vetar</span>
              </div>
              <p className="text-2xl text-white font-light">
                {data.windSpeed} km/h
              </p>
            </div>
            <div className="bg-slate-800/30 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Gauge className="w-4 h-4" />
                <span className="text-sm">Pritisak</span>
              </div>
              <p className="text-2xl text-white font-light">
                {data.pressure} hPa
              </p>
            </div>
            <div className="bg-slate-800/30 rounded-2xl p-4">
              <div className="flex items-center gap-2 text-slate-400 mb-2">
                <Eye className="w-4 h-4" />
                <span className="text-sm">Vidljivost</span>
              </div>
              <p className="text-2xl text-white font-light">
                {data.visibility} km
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
