"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Search, Filter, TrendingUp, TrendingDown, Navigation, Loader2 } from "lucide-react";
import Link from "next/link";

interface CityData {
  name: string;
  country: string;
  aqi: number;
  lat: number;
  lon: number;
  sources: string[];
}

interface CityCoverageProps {
  limit?: number;
  showSearch?: boolean;
}

export function CityCoverage({ limit, showSearch = true }: CityCoverageProps) {
  const [cities, setCities] = useState<CityData[]>([]);
  const [filteredCities, setFilteredCities] = useState<CityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "aqi" | "country">("aqi");
  const [filterCountry, setFilterCountry] = useState<string>("all");

  useEffect(() => {
    const fetchCities = async () => {
      try {
        const response = await fetch('/api/air-quality');
        if (!response.ok) throw new Error('Failed to fetch cities');
        const data = await response.json();

        // Transform data to city format
        const cityMap = new Map<string, CityData>();
        
        data.forEach((station: any) => {
          const cityName = station.location.city || station.location.name;
          const key = `${cityName}-${station.location.region}`;

          if (!cityMap.has(key)) {
            cityMap.set(key, {
              name: cityName,
              country: station.location.region || 'Unknown',
              aqi: station.aqi,
              lat: station.location.coordinates[1],
              lon: station.location.coordinates[0],
              sources: [station.source],
            });
          } else {
            const existing = cityMap.get(key)!;
            // Update AQI to average
            existing.aqi = Math.round((existing.aqi + station.aqi) / 2);
            // Add source if not already present
            if (!existing.sources.includes(station.source)) {
              existing.sources.push(station.source);
            }
          }
        });

        const citiesArray = Array.from(cityMap.values());
        setCities(citiesArray);
        setFilteredCities(citiesArray);
      } catch (err) {
        console.error('Error fetching cities:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  useEffect(() => {
    let result = [...cities];

    // Filter by search term
    if (searchTerm) {
      result = result.filter(city =>
        city.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by country
    if (filterCountry !== "all") {
      result = result.filter(city => city.country === filterCountry);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "aqi":
          return b.aqi - a.aqi; // Highest AQI first (worst air quality)
        case "country":
          return a.country.localeCompare(b.country);
        default:
          return 0;
      }
    });

    // Apply limit if specified
    if (limit) {
      result = result.slice(0, limit);
    }

    setFilteredCities(result);
  }, [cities, searchTerm, sortBy, filterCountry, limit]);

  const countries = Array.from(new Set(cities.map(c => c.country))).sort();

  const getAQIColor = (aqi: number): string => {
    if (aqi <= 50) return "text-green-400";
    if (aqi <= 100) return "text-yellow-400";
    if (aqi <= 150) return "text-orange-400";
    if (aqi <= 200) return "text-red-400";
    return "text-purple-400";
  };

  const getAQIBg = (aqi: number): string => {
    if (aqi <= 50) return "bg-green-500/10 border-green-500/20";
    if (aqi <= 100) return "bg-yellow-500/10 border-yellow-500/20";
    if (aqi <= 150) return "bg-orange-500/10 border-orange-500/20";
    if (aqi <= 200) return "bg-red-500/10 border-red-500/20";
    return "bg-purple-500/10 border-purple-500/20";
  };

  const getAQILabel = (aqi: number): string => {
    if (aqi <= 50) return "Dobar";
    if (aqi <= 100) return "Umeren";
    if (aqi <= 150) return "Nezdrav za osetljive";
    if (aqi <= 200) return "Nezdrav";
    if (aqi <= 300) return "Veoma nezdrav";
    return "Opasan";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filter Controls */}
      {showSearch && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Pretraži gradove..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-700/30 border border-slate-600/30 text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-500/50 transition-colors"
            />
          </div>

          {/* Country Filter */}
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <select
              value={filterCountry}
              onChange={(e) => setFilterCountry(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-700/30 border border-slate-600/30 text-white focus:outline-none focus:border-cyan-500/50 transition-colors appearance-none cursor-pointer"
            >
              <option value="all">Sve države</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="relative">
            <TrendingUp className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-700/30 border border-slate-600/30 text-white focus:outline-none focus:border-cyan-500/50 transition-colors appearance-none cursor-pointer"
            >
              <option value="aqi">Poređaj po AQI</option>
              <option value="name">Poređaj po imenu</option>
              <option value="country">Poređaj po državi</option>
            </select>
          </div>
        </div>
      )}

      {/* Cities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredCities.map((city, index) => (
            <motion.div
              key={`${city.name}-${city.country}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: Math.min(index * 0.03, 0.3) }}
              className={`p-5 rounded-2xl border ${getAQIBg(city.aqi)} hover:scale-105 transition-transform cursor-pointer group`}
            >
              <Link href={`/grad/${encodeURIComponent(city.name)}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition-colors">
                      {city.name}
                    </h4>
                    <p className="text-sm text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {city.country}
                    </p>
                  </div>
                  <Navigation className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </div>

                <div className="flex items-end justify-between mb-3">
                  <div>
                    <p className={`text-4xl font-bold ${getAQIColor(city.aqi)}`}>
                      {city.aqi}
                    </p>
                    <p className={`text-sm font-medium ${getAQIColor(city.aqi)}`}>
                      {getAQILabel(city.aqi)}
                    </p>
                  </div>
                  
                  {sortBy === "aqi" && index === 0 && (
                    <div className="flex items-center gap-1 text-red-400">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-xs font-medium">Najgori</span>
                    </div>
                  )}
                  {sortBy === "aqi" && index === filteredCities.length - 1 && (
                    <div className="flex items-center gap-1 text-green-400">
                      <TrendingDown className="w-4 h-4" />
                      <span className="text-xs font-medium">Najbolji</span>
                    </div>
                  )}
                </div>

                {/* Data Sources */}
                <div className="flex flex-wrap gap-1">
                  {city.sources.map(source => (
                    <span
                      key={source}
                      className="px-2 py-1 rounded-lg bg-slate-700/50 text-xs text-slate-300"
                    >
                      {source}
                    </span>
                  ))}
                </div>
              </Link>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Results Count */}
      {showSearch && (
        <div className="text-center text-slate-400 text-sm">
          Prikazano {filteredCities.length} od {cities.length} gradova
        </div>
      )}

      {/* No Results */}
      {filteredCities.length === 0 && !loading && (
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400">Nema rezultata za zadatu pretragu</p>
        </div>
      )}
    </div>
  );
}
