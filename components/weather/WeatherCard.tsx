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
  <div className = "flex items-center gap-2 text-slate-400 mb-2">
                <Droplets className = "w-4 h-4" />
  < span className = "text-sm" > Vlažnost</span >
              </div >
  <p className="text-2xl text-white font-light">{data.humidity}%</p>
            </div >
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
          </div >
        </div >
      </div >
    </motion.div >
  );
}
