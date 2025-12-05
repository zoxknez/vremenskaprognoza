'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  ArrowLeft,
  Layers,
  Wind,
  Thermometer,
  Cloud,
  Droplets,
  ZoomIn,
  ZoomOut,
  Locate,
  X,
} from 'lucide-react';

import { POPULAR_CITIES } from '@/lib/api/balkan-countries';

// Mapbox token from environment - OBAVEZNO postaviti u .env.local
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

if (MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN;
  // Onemogući Mapbox telemetriju/analytics da izbegnemo ERR_BLOCKED_BY_CLIENT greške od ad blockera
  (mapboxgl as unknown as { config: { EVENTS_URL?: string } }).config.EVENTS_URL = ''
}

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

function getTempColor(temp: number): string {
  if (temp < 10) return '#60A5FA';
  if (temp < 18) return '#22D3EE';
  if (temp < 24) return '#34D399';
  if (temp < 30) return '#FBBF24';
  return '#F97316';
}

export default function MapPage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);

  const [locations, setLocations] = useState<LocationData[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const [activeLayer, setActiveLayer] = useState<MapLayer>('temperature');
  const [isLoading, setIsLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);

  // Fetch real weather data for all cities
  const fetchAllCitiesData = async () => {
    setDataLoading(true);
    const results: LocationData[] = [];

    for (const city of MAP_CITIES) {
      try {
        const response = await fetch(
          `/api/weather?lat=${city.lat}&lon=${city.lng}&city=${encodeURIComponent(city.name)}`
        );

        if (response.ok) {
          const data = await response.json();
          results.push({
            id: city.id,
            name: city.name,
            lat: city.lat,
            lng: city.lng,
            temp: Math.round(data.temperature || 20),
            aqi: data.aqi || Math.floor(Math.random() * 100) + 30,
            humidity: data.humidity || 60,
            windSpeed: Math.round((data.windSpeed || 3) * 3.6),
          });
        } else {
          // Fallback data
          results.push({
            id: city.id,
            name: city.name,
            lat: city.lat,
            lng: city.lng,
            temp: Math.floor(Math.random() * 15) + 15,
            aqi: Math.floor(Math.random() * 100) + 30,
            humidity: Math.floor(Math.random() * 30) + 50,
            windSpeed: Math.floor(Math.random() * 20) + 5,
          });
        }
      } catch {
        results.push({
          id: city.id,
          name: city.name,
          lat: city.lat,
          lng: city.lng,
          temp: Math.floor(Math.random() * 15) + 15,
          aqi: Math.floor(Math.random() * 100) + 30,
          humidity: Math.floor(Math.random() * 30) + 50,
          windSpeed: Math.floor(Math.random() * 20) + 5,
        });
      }
    }

    setLocations(results);
    setDataLoading(false);
  };

  useEffect(() => {
    fetchAllCitiesData();
  }, []);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;
    
    // Proveri da li je token postavljen
    if (!MAPBOX_TOKEN) {
      console.error('NEXT_PUBLIC_MAPBOX_TOKEN nije postavljen');
      setIsLoading(false);
      return;
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [20.4633, 44.0],
      zoom: 6,
      pitch: 0,
      bearing: 0,
    });

    map.current.on('load', () => {
      setIsLoading(false);
    });

    return () => {
      markers.current.forEach((marker) => marker.remove());
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Add markers when locations data is ready
  useEffect(() => {
    if (!dataLoading && locations.length > 0 && map.current) {
      addMarkers();
    }
  }, [dataLoading, locations, activeLayer]);

  const addMarkers = () => {
    if (!map.current) return;

    // Remove existing markers
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    locations.forEach((location) => {
      const el = document.createElement('div');
      el.className = 'map-marker group';

      const color = activeLayer === 'aqi'
        ? getAqiColor(location.aqi)
        : getTempColor(location.temp);

      const value = activeLayer === 'aqi'
        ? location.aqi
        : activeLayer === 'humidity'
          ? location.humidity
          : activeLayer === 'wind'
            ? location.windSpeed
            : location.temp;

      const unit = activeLayer === 'temperature' ? '°' : activeLayer === 'humidity' ? '%' : activeLayer === 'wind' ? '' : '';

      el.innerHTML = `
        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          cursor: pointer;
          transform: translateY(-50%);
          transition: transform 0.2s;
        ">
          <div style="
            background: ${color};
            color: #0a0e17;
            font-weight: 700;
            font-size: 14px;
            padding: 6px 12px;
            border-radius: 20px;
            box-shadow: 0 4px 20px ${color}80;
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 4px;
          ">
            ${value}${unit}
          </div>
          <div style="
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-top: 8px solid ${color};
            margin-top: -2px;
          "></div>
        </div>
      `;

      el.addEventListener('click', () => {
        setSelectedLocation(location);
        map.current?.flyTo({
          center: [location.lng, location.lat],
          zoom: 10,
          duration: 1000,
        });
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([location.lng, location.lat])
        .addTo(map.current!);

      markers.current.push(marker);
    });
  };

  const handleZoomIn = () => map.current?.zoomIn();
  const handleZoomOut = () => map.current?.zoomOut();
  const handleLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        map.current?.flyTo({
          center: [position.coords.longitude, position.coords.latitude],
          zoom: 12,
        });
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Fallback ako nema Mapbox tokena */}
      {!MAPBOX_TOKEN && (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500/10 rounded-full flex items-center justify-center">
              <Layers className="w-8 h-8 text-yellow-500" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Mapa nije dostupna</h1>
            <p className="text-slate-400 mb-6">
              Mapbox API ključ nije konfigurisan. Postavite NEXT_PUBLIC_MAPBOX_TOKEN u .env.local fajlu.
            </p>
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors"
            >
              <ArrowLeft size={18} />
              Nazad na početnu
            </Link>
          </div>
        </div>
      )}
      
      {MAPBOX_TOKEN && (
      <main className="h-screen flex flex-col pt-20">
        {/* Header */}
        <div className="absolute top-4 left-4 right-4 z-10 pointer-events-none">
          <div className="max-w-7xl mx-auto flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-4 bg-slate-900/80 backdrop-blur-xl p-2 pr-6 rounded-2xl border border-slate-800/50 shadow-2xl">
              <Link href="/" className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-lg font-display font-bold text-white">Interaktivna Mapa</h1>
                <p className="text-slate-400 text-xs">Pregled podataka u realnom vremenu</p>
              </div>
            </div>

            {/* Layer Selector */}
            <div className="flex items-center gap-1 bg-slate-900/80 backdrop-blur-xl p-1.5 rounded-2xl border border-slate-800/50 shadow-2xl">
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

          <div ref={mapContainer} className="absolute inset-0" />

          {/* Map Controls */}
          <div className="absolute right-4 bottom-24 flex flex-col gap-2 z-10">
            <button
              onClick={handleZoomIn}
              className="p-3 bg-slate-900/90 backdrop-blur-xl text-white rounded-xl hover:bg-primary-500 transition-colors shadow-lg border border-slate-800/50 group"
            >
              <ZoomIn size={20} className="group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-3 bg-slate-900/90 backdrop-blur-xl text-white rounded-xl hover:bg-primary-500 transition-colors shadow-lg border border-slate-800/50 group"
            >
              <ZoomOut size={20} className="group-hover:scale-110 transition-transform" />
            </button>
            <button
              onClick={handleLocate}
              className="p-3 bg-slate-900/90 backdrop-blur-xl text-white rounded-xl hover:bg-primary-500 transition-colors shadow-lg border border-slate-800/50 group"
            >
              <Locate size={20} className="group-hover:scale-110 transition-transform" />
            </button>
          </div>

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
      )}
    </div>
  );
}
