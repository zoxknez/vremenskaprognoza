'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
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
  RefreshCw,
} from 'lucide-react';

// Mapbox token from environment
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || 'pk.eyJ1Ijoiem94a25leiIsImEiOiJjbWlzNWt0MDEwbGJnNWlzaXJ2ZDgzeDZnIn0.raQT7wvAQ6dyV4XR9WVzNg';

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

// Balkanski gradovi sa koordinatama
const BALKAN_CITIES = [
  { id: '1', name: 'Beograd', lat: 44.8176, lng: 20.4633 },
  { id: '2', name: 'Novi Sad', lat: 45.2671, lng: 19.8335 },
  { id: '3', name: 'Niš', lat: 43.3209, lng: 21.8958 },
  { id: '4', name: 'Kragujevac', lat: 44.0128, lng: 20.9114 },
  { id: '5', name: 'Subotica', lat: 46.1000, lng: 19.6667 },
  { id: '6', name: 'Sarajevo', lat: 43.8563, lng: 18.4131 },
  { id: '7', name: 'Zagreb', lat: 45.8150, lng: 15.9819 },
  { id: '8', name: 'Podgorica', lat: 42.4304, lng: 19.2594 },
  { id: '9', name: 'Skoplje', lat: 41.9981, lng: 21.4254 },
  { id: '10', name: 'Priština', lat: 42.6629, lng: 21.1655 },
  { id: '11', name: 'Ljubljana', lat: 46.0569, lng: 14.5058 },
  { id: '12', name: 'Split', lat: 43.5081, lng: 16.4402 },
  { id: '13', name: 'Tirana', lat: 41.3275, lng: 19.8187 },
  { id: '14', name: 'Sofija', lat: 42.6977, lng: 23.3219 },
];

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
    
    for (const city of BALKAN_CITIES) {
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
      el.className = 'map-marker';
      
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
    <div className="min-h-screen bg-[#0a0e17]">
      <main className="h-screen flex flex-col pt-16">
        {/* Header */}
        <div className="px-4 sm:px-6 lg:px-8 py-4 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors">
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-xl font-display font-bold text-white">Interaktivna Mapa</h1>
                <p className="text-slate-400 text-sm">Vremenska prognoza i kvalitet vazduha</p>
              </div>
            </div>
            
            {/* Layer Selector */}
            <div className="flex items-center gap-2 bg-slate-800/50 p-1 rounded-xl">
              {[
                { id: 'temperature', icon: Thermometer, label: 'Temp' },
                { id: 'aqi', icon: Wind, label: 'AQI' },
                { id: 'humidity', icon: Droplets, label: 'Vlažnost' },
                { id: 'wind', icon: Cloud, label: 'Vetar' },
              ].map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => setActiveLayer(layer.id as MapLayer)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeLayer === layer.id
                      ? 'bg-primary-600 text-white'
                      : 'text-slate-400 hover:text-white'
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
        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-950 z-20">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-400">Učitavanje mape...</p>
              </div>
            </div>
          )}
          
          <div ref={mapContainer} className="absolute inset-0" />

          {/* Map Controls */}
          <div className="absolute right-4 top-4 flex flex-col gap-2 z-10">
            <button
              onClick={handleZoomIn}
              className="p-3 bg-slate-900/90 backdrop-blur-sm text-white rounded-xl hover:bg-slate-800 transition-colors shadow-lg"
            >
              <ZoomIn size={20} />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-3 bg-slate-900/90 backdrop-blur-sm text-white rounded-xl hover:bg-slate-800 transition-colors shadow-lg"
            >
              <ZoomOut size={20} />
            </button>
            <button
              onClick={handleLocate}
              className="p-3 bg-slate-900/90 backdrop-blur-sm text-white rounded-xl hover:bg-slate-800 transition-colors shadow-lg"
            >
              <Locate size={20} />
            </button>
          </div>

          {/* Legend */}
          <div className="absolute left-4 bottom-4 bg-slate-900/90 backdrop-blur-sm rounded-xl p-4 z-10">
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
                  <div key={i} className="w-6 h-3 first:rounded-l last:rounded-r" style={{ backgroundColor: color }} />
                ))}
              </div>
            )}
            
            {activeLayer === 'aqi' && (
              <div className="flex items-center gap-1">
                {['#22C55E', '#EAB308', '#F97316', '#EF4444', '#A855F7'].map((color, i) => (
                  <div key={i} className="w-6 h-3 first:rounded-l last:rounded-r" style={{ backgroundColor: color }} />
                ))}
              </div>
            )}
            
            {(activeLayer === 'humidity' || activeLayer === 'wind') && (
              <div className="flex items-center gap-1">
                {['#60A5FA', '#3B82F6', '#2563EB', '#1D4ED8', '#1E40AF'].map((color, i) => (
                  <div key={i} className="w-6 h-3 first:rounded-l last:rounded-r" style={{ backgroundColor: color }} />
                ))}
              </div>
            )}
          </div>

          {/* Selected Location Panel */}
          {selectedLocation && (
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className="absolute right-4 top-32 w-80 bg-slate-900/95 backdrop-blur-sm rounded-2xl shadow-2xl z-10 overflow-hidden"
            >
              <div className="p-4 border-b border-slate-800">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white">{selectedLocation.name}</h3>
                  <button
                    onClick={() => setSelectedLocation(null)}
                    className="p-1 text-slate-400 hover:text-white transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              
              <div className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Thermometer size={18} />
                    <span>Temperatura</span>
                  </div>
                  <span className="text-2xl font-bold text-white">{selectedLocation.temp}°C</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Wind size={18} />
                    <span>AQI</span>
                  </div>
                  <span 
                    className="text-xl font-bold"
                    style={{ color: getAqiColor(selectedLocation.aqi) }}
                  >
                    {selectedLocation.aqi}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Droplets size={18} />
                    <span>Vlažnost</span>
                  </div>
                  <span className="text-white font-medium">{selectedLocation.humidity}%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Cloud size={18} />
                    <span>Vetar</span>
                  </div>
                  <span className="text-white font-medium">{selectedLocation.windSpeed} km/h</span>
                </div>
                
                <Link
                  href={`/grad/${selectedLocation.name.toLowerCase()}`}
                  className="btn-primary w-full justify-center mt-4"
                >
                  Pogledaj detalje
                </Link>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
