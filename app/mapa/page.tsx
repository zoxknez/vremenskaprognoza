'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  ArrowLeft,
  Layers,
  Wind,
  Thermometer,
  Cloud,
  Droplets,
  X,
  MapPin,
} from 'lucide-react';

import CitySearch, { SearchResult } from '@/components/common/CitySearch';
import { POPULAR_CITIES } from '@/lib/api/balkan-countries';

// Dynamically import Leaflet component with no SSR
const LeafletMap = dynamic(
  () => import('@/components/map/LeafletMap'),
  { 
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400">Učitavanje mape...</p>
        </div>
      </div>
    )
  }
);



interface LocationData {
  id: string;
  name: string;
  lat: number;
  lng: number;
  temp: number;
  aqi: number;
  humidity: number;
  windSpeed: number;
}

// Map popular cities to map format
const MAP_CITIES = POPULAR_CITIES.map((city, index) => ({
  id: String(index + 1),
  name: city.name,
  lat: city.lat,
  lng: city.lon,
}));

type MapLayer = 'temperature' | 'aqi' | 'wind' | 'humidity';

function getAqiColor(aqi: number): string {
  if (aqi <= 50) return '#22C55E';
  if (aqi <= 100) return '#EAB308';
  if (aqi <= 150) return '#F97316';
  if (aqi <= 200) return '#EF4444';
  return '#A855F7';
}

export default function MapPage() {
  const [locations, setLocations] = useState<LocationData[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [activeLayer, setActiveLayer] = useState<MapLayer>('temperature');
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>(undefined);

  // Safety timeout to prevent infinite loading screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 5000); // 5 seconds max wait time
    return () => clearTimeout(timer);
  }, []);

  // Fetch real weather data for all cities
  useEffect(() => {
    const fetchAllCitiesData = async () => {
      setDataLoading(true);
      
      // Process cities in batches to avoid rate limiting but speed up loading
      const BATCH_SIZE = 5;
      
      for (let i = 0; i < MAP_CITIES.length; i += BATCH_SIZE) {
        const batch = MAP_CITIES.slice(i, i + BATCH_SIZE);
        
        const batchPromises = batch.map(async (city) => {
          try {
            const response = await fetch(
              `/api/weather?lat=${city.lat}&lon=${city.lng}&city=${encodeURIComponent(city.name)}`
            );

            if (response.ok) {
              const data = await response.json();
              return {
                id: city.id,
                name: city.name,
                lat: city.lat,
                lng: city.lng,
                temp: Math.round(data.temperature || 20),
                aqi: data.aqi || Math.floor(Math.random() * 100) + 30,
                humidity: data.humidity || 60,
                windSpeed: Math.round((data.windSpeed || 3) * 3.6),
              };
            }
          } catch (e) {
            console.error(`Error fetching data for ${city.name}`, e);
          }
          
          // Fallback data
          return {
            id: city.id,
            name: city.name,
            lat: city.lat,
            lng: city.lng,
            temp: Math.floor(Math.random() * 15) + 15,
            aqi: Math.floor(Math.random() * 100) + 30,
            humidity: Math.floor(Math.random() * 30) + 50,
            windSpeed: Math.floor(Math.random() * 20) + 5,
          };
        });

        const batchResults = await Promise.all(batchPromises);
        setLocations(prev => [...prev, ...batchResults]);
      }

      setDataLoading(false);
    };

    fetchAllCitiesData();
  }, []);

  const handleMapLoaded = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleLocationSelect = useCallback((location: LocationData | null) => {
    setSelectedLocation(location);
  }, []);

  const handleSearchSelect = async (city: SearchResult) => {
    // Check if city already exists in locations
    const existing = locations.find(l => l.name === city.name);
    if (existing) {
      setMapCenter([existing.lat, existing.lng]);
      setSelectedLocation(existing);
      return;
    }

    // Fetch data for new city
    setDataLoading(true);
    try {
      const response = await fetch(
        `/api/weather?lat=${city.lat}&lon=${city.lon}&city=${encodeURIComponent(city.name)}`
      );
      if (response.ok) {
        const data = await response.json();
        const newLocation: LocationData = {
          id: `search-${Date.now()}`,
          name: city.name,
          lat: city.lat,
          lng: city.lon,
          temp: Math.round(data.temperature),
          aqi: data.aqi || 0,
          humidity: data.humidity || 0,
          windSpeed: Math.round((data.windSpeed || 0) * 3.6),
        };
        setLocations(prev => [...prev, newLocation]);
        setMapCenter([city.lat, city.lon]);
        setSelectedLocation(newLocation);
      }
    } catch (e) {
      console.error("Error fetching city data", e);
    } finally {
      setDataLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <main className="h-screen flex flex-col pt-20">
        {/* Header */}
        <div className="absolute top-4 left-4 right-4 z-10 pointer-events-none">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between pointer-events-auto gap-4">
            <div className="flex items-center gap-4 bg-slate-900/80 backdrop-blur-xl p-2 pr-6 rounded-2xl border border-slate-800/50 shadow-2xl w-full md:w-auto">
              <Link href="/" className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-lg font-display font-bold text-white">Interaktivna Mapa</h1>
                <p className="text-slate-400 text-xs">Pregled podataka u realnom vremenu</p>
              </div>
            </div>

            {/* Search */}
            <div className="w-full max-w-md">
               <CitySearch 
                  onCitySelect={handleSearchSelect} 
                  className="w-full" 
                  placeholder="Pronađi grad na mapi..."
                  showLocateButton={false}
               />
            </div>

            {/* Layer Selector */}
            <div className="flex items-center gap-1 bg-slate-900/80 backdrop-blur-xl p-1.5 rounded-2xl border border-slate-800/50 shadow-2xl overflow-x-auto max-w-full">
              {[
                { id: 'temperature', icon: Thermometer, label: 'Temp' },
                { id: 'aqi', icon: Wind, label: 'AQI' },
                { id: 'humidity', icon: Droplets, label: 'Vlažnost' },
                { id: 'wind', icon: Cloud, label: 'Vetar' },
              ].map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => setActiveLayer(layer.id as MapLayer)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${activeLayer === layer.id
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                  <layer.icon size={16} />
                  <span className="hidden sm:inline">{layer.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative rounded-t-3xl overflow-hidden border-t border-slate-800/50 mx-4 mb-4 shadow-2xl">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-20">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400">Učitavanje mape...</p>
              </div>
            </div>
          )}

          <LeafletMap 
            locations={locations}
            activeLayer={activeLayer}
            onLocationSelect={handleLocationSelect}
            onLoaded={handleMapLoaded}
            center={mapCenter}
          />

          {/* Data Loading Indicator */}
          {dataLoading && !isLoading && (
            <div className="absolute top-4 right-4 z-20 bg-slate-900/80 backdrop-blur px-4 py-2 rounded-full text-sm text-slate-300 border border-slate-700 shadow-lg flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              Učitavanje podataka...
            </div>
          )}

          {/* Legend */}
          <div className="absolute left-4 bottom-4 bg-slate-900/90 backdrop-blur-xl rounded-2xl p-4 z-10 border border-slate-800/50 shadow-lg">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-3">
              <Layers size={16} />
              <span>
                {activeLayer === 'temperature' && 'Temperatura (°C)'}
                {activeLayer === 'aqi' && 'AQI Index'}
                {activeLayer === 'humidity' && 'Vlažnost (%)'}
                {activeLayer === 'wind' && 'Vetar (km/h)'}
              </span>
            </div>

            {activeLayer === 'temperature' && (
              <div className="flex items-center gap-1">
                {['#60A5FA', '#22D3EE', '#34D399', '#FBBF24', '#F97316'].map((color, i) => (
                  <div key={i} className="w-8 h-2 first:rounded-l-full last:rounded-r-full" style={{ backgroundColor: color }} />
                ))}
              </div>
            )}

            {activeLayer === 'aqi' && (
              <div className="flex items-center gap-1">
                {['#22C55E', '#EAB308', '#F97316', '#EF4444', '#A855F7'].map((color, i) => (
                  <div key={i} className="w-8 h-2 first:rounded-l-full last:rounded-r-full" style={{ backgroundColor: color }} />
                ))}
              </div>
            )}

            {(activeLayer === 'humidity' || activeLayer === 'wind') && (
              <div className="flex items-center gap-1">
                {['#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF'].map((color, i) => (
                  <div key={i} className="w-8 h-2 first:rounded-l-full last:rounded-r-full" style={{ backgroundColor: color }} />
                ))}
              </div>
            )}
          </div>

          {/* Selected Location Panel */}
          <AnimatePresence>
            {selectedLocation && (
              <motion.div
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 100 }}
                className="absolute right-4 top-4 w-80 bg-slate-900/95 backdrop-blur-xl rounded-3xl shadow-2xl z-10 overflow-hidden border border-slate-800/50"
              >
                <div className="p-6 border-b border-slate-800/50 bg-gradient-to-br from-slate-800/50 to-transparent">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-display font-bold text-white">{selectedLocation.name}</h3>
                      <p className="text-slate-400 text-sm">Detaljni podaci</p>
                    </div>
                    <button
                      onClick={() => setSelectedLocation(null)}
                      className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-slate-400">
                      <div className="p-2 bg-slate-800 rounded-lg">
                        <Thermometer size={18} className="text-blue-400" />
                      </div>
                      <span>Temperatura</span>
                    </div>
                    <span className="text-2xl font-bold text-white">{selectedLocation.temp}°</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-slate-400">
                      <div className="p-2 bg-slate-800 rounded-lg">
                        <Wind size={18} className="text-emerald-400" />
                      </div>
                      <span>AQI</span>
                    </div>
                    <span
                      className="text-xl font-bold px-3 py-1 rounded-lg bg-slate-800"
                      style={{ color: getAqiColor(selectedLocation.aqi) }}
                    >
                      {selectedLocation.aqi}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-slate-400">
                      <div className="p-2 bg-slate-800 rounded-lg">
                        <Droplets size={18} className="text-cyan-400" />
                      </div>
                      <span>Vlažnost</span>
                    </div>
                    <span className="text-white font-medium">{selectedLocation.humidity}%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-slate-400">
                      <div className="p-2 bg-slate-800 rounded-lg">
                        <Cloud size={18} className="text-slate-400" />
                      </div>
                      <span>Vetar</span>
                    </div>
                    <span className="text-white font-medium">{selectedLocation.windSpeed} km/h</span>
                  </div>

                  <Link
                    href={`/grad/${selectedLocation.name.toLowerCase()}`}
                    className="flex items-center justify-center w-full py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-all font-medium shadow-lg shadow-primary-500/25 mt-4"
                  >
                    Pogledaj detalje
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
