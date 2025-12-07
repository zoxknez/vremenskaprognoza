'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Map as MapboxMap, Marker } from 'mapbox-gl';

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

type MapLayer = 'temperature' | 'aqi' | 'wind' | 'humidity';

interface MapboxComponentProps {
  locations: LocationData[];
  activeLayer: MapLayer;
  onLocationSelect: (location: LocationData | null) => void;
  onLoaded: () => void;
}

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

export default function MapboxComponent({ 
  locations, 
  activeLayer, 
  onLocationSelect,
  onLoaded 
}: MapboxComponentProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<MapboxMap | null>(null);
  const markers = useRef<Marker[]>([]);
  const [mapboxgl, setMapboxgl] = useState<typeof import('mapbox-gl') | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Dynamically import mapbox-gl only on client
  useEffect(() => {
    let mounted = true;

    import('mapbox-gl')
      .then((mapbox) => {
        if (!mounted) return;

        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
        if (token) {
          mapbox.default.accessToken = token;
        }
        
        if (!mapbox.default.supported()) {
          setError('Vaš pretraživač ne podržava WebGL koji je neophodan za prikaz mape.');
          onLoaded();
          return;
        }

        // Try to disable telemetry
        try {
          const config = (mapbox.default as unknown as { config: Record<string, unknown> }).config;
          if (config && typeof config === 'object') {
            Object.defineProperty(config, 'EVENTS_URL', { value: '', writable: false });
          }
        } catch { /* ignore */ }
        
        setMapboxgl(mapbox);
      })
      .catch((err) => {
        if (!mounted) return;
        console.error('Failed to load mapbox-gl:', err);
        setError('Neuspešno učitavanje Mapbox biblioteke. Proverite internet konekciju ili ad-blocker.');
        onLoaded();
      });

    return () => {
      mounted = false;
    };
  }, [onLoaded]);

  // Initialize map
  useEffect(() => {
    if (!mapboxgl || !mapContainer.current || map.current || error) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!token) {
      setError('Mapbox token nije pronađen.');
      onLoaded();
      return;
    }

    try {
      map.current = new mapboxgl.default.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [20.4633, 44.0],
        zoom: 6,
        pitch: 0,
        bearing: 0,
        attributionControl: false, // Cleaner look
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.default.NavigationControl({ showCompass: false }), 'bottom-right');

      map.current.on('load', () => {
        onLoaded();
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        if (e.error && e.error.message) {
           // Don't show generic "Forbidden" if it's just a tile loading error, but do log it
           if (e.error.message.includes('Forbidden') || e.error.message.includes('Unauthorized')) {
             setError('Problem sa pristupom mapi (Invalid Token).');
           }
        }
        onLoaded();
      });
    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Greška pri inicijalizaciji mape.');
      onLoaded();
    }

    // Fallback timeout to ensure loading state is cleared
    const timeoutId = setTimeout(() => {
      onLoaded();
    }, 5000); // Increased to 5s

    return () => {
      clearTimeout(timeoutId);
      markers.current.forEach((marker) => marker.remove());
      map.current?.remove();
      map.current = null;
    };
  }, [mapboxgl, onLoaded, error]);

  // Add markers function
  const addMarkers = useCallback(() => {
    if (!map.current || !mapboxgl || locations.length === 0) return;

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
        onLocationSelect(location);
        map.current?.flyTo({
          center: [location.lng, location.lat],
          zoom: 10,
          duration: 1000,
        });
      });

      const marker = new mapboxgl.default.Marker({ element: el })
        .setLngLat([location.lng, location.lat])
        .addTo(map.current!);

      markers.current.push(marker);
    });
  }, [mapboxgl, locations, activeLayer, onLocationSelect]);

  // Add markers when locations change
  useEffect(() => {
    if (locations.length > 0 && map.current) {
      addMarkers();
    }
  }, [locations, activeLayer, addMarkers]);

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
    <div className="relative w-full h-full bg-slate-900">
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center p-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 max-w-md text-center">
            <div className="w-12 h-12 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Greška pri učitavanju mape</h3>
            <p className="text-slate-400 text-sm">{error}</p>
          </div>
        </div>
      ) : (
        <div ref={mapContainer} className="absolute inset-0" />
      )}
      
      {/* Zoom Controls - Only show if no error */}
      {!error && (
        <div className="absolute right-4 bottom-24 flex flex-col gap-2 z-10">
        <button
          onClick={handleZoomIn}
          className="p-3 bg-slate-900/90 backdrop-blur-xl text-white rounded-xl hover:bg-primary-500 transition-colors shadow-lg border border-slate-800/50"
          aria-label="Zoom in"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </button>
        <button
          onClick={handleZoomOut}
          className="p-3 bg-slate-900/90 backdrop-blur-xl text-white rounded-xl hover:bg-primary-500 transition-colors shadow-lg border border-slate-800/50"
          aria-label="Zoom out"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 12H6" />
          </svg>
        </button>
        <button
          onClick={handleLocate}
          className="p-3 bg-slate-900/90 backdrop-blur-xl text-white rounded-xl hover:bg-primary-500 transition-colors shadow-lg border border-slate-800/50"
          aria-label="My location"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
      )}
    </div>
  );
}
