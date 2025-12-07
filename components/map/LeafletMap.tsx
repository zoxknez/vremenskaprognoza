'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Next.js
const iconUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png';

// Only run on client side
if (typeof window !== 'undefined') {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl,
        iconUrl,
        shadowUrl,
    });
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

type MapLayer = 'temperature' | 'aqi' | 'wind' | 'humidity';

interface LeafletMapProps {
  locations: LocationData[];
  activeLayer: MapLayer;
  onLocationSelect: (location: LocationData | null) => void;
  onLoaded: () => void;
  center?: [number, number];
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

function getWindColor(speed: number): string {
    if (speed < 5) return '#E0F2FE';
    if (speed < 10) return '#BAE6FD';
    if (speed < 20) return '#7DD3FC';
    if (speed < 30) return '#38BDF8';
    return '#0EA5E9';
}

function getHumidityColor(humidity: number): string {
    if (humidity < 30) return '#FEF08A';
    if (humidity < 50) return '#BBF7D0';
    if (humidity < 70) return '#86EFAC';
    return '#3B82F6';
}

function MapController({ onLoaded, center }: { onLoaded: () => void, center?: [number, number] }) {
    const map = useMap();
    
    useEffect(() => {
        if (map) {
            // Small timeout to ensure tiles start loading
            const timer = setTimeout(() => {
                onLoaded();
                map.invalidateSize();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [map, onLoaded]);

    useEffect(() => {
        if (map && center) {
            map.flyTo(center, 10);
        }
    }, [map, center]);

    return null;
}

export default function LeafletMap({ 
  locations, 
  activeLayer, 
  onLocationSelect,
  onLoaded,
  center
}: LeafletMapProps) {
  
  const getColor = (location: LocationData) => {
      switch (activeLayer) {
          case 'aqi': return getAqiColor(location.aqi);
          case 'temperature': return getTempColor(location.temp);
          case 'wind': return getWindColor(location.windSpeed);
          case 'humidity': return getHumidityColor(location.humidity);
          default: return '#3B82F6';
      }
  };

  const getValue = (location: LocationData) => {
      switch (activeLayer) {
          case 'aqi': return `AQI: ${location.aqi}`;
          case 'temperature': return `${Math.round(location.temp)}°C`;
          case 'wind': return `${location.windSpeed} km/h`;
          case 'humidity': return `${location.humidity}%`;
          default: return '';
      }
  };

  return (
    <MapContainer 
        center={[44.0165, 21.0059]} // Center of Serbia
        zoom={7} 
        style={{ height: '100%', width: '100%', background: '#1e293b', zIndex: 0 }}
        zoomControl={false}
    >
      <TileLayer 
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" 
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      
      <MapController onLoaded={onLoaded} center={center} />

      {locations.map((location) => (
        <CircleMarker
          key={location.id}
          center={[location.lat, location.lng]}
          radius={12}
          pathOptions={{ 
              fillColor: getColor(location), 
              color: '#fff', 
              weight: 2, 
              fillOpacity: 0.8 
          }}
          eventHandlers={{
            click: () => onLocationSelect(location),
          }}
        >
          <Popup className="custom-popup">
            <div className="p-1">
              <h3 className="font-bold text-sm mb-1">{location.name}</h3>
              <p className="text-sm font-medium">{getValue(location)}</p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
