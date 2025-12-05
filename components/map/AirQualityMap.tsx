'use client';

import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { AirQualityData, AQI_COLORS } from '@/lib/types/air-quality';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';

interface AirQualityMapProps {
  data: AirQualityData[];
  onMarkerClick?: (data: AirQualityData) => void;
  selectedId?: string;
}

const getMarkerColor = (category: string): string => {
  const colors: Record<string, string> = {
    good: '#22c55e',
    moderate: '#eab308',
    unhealthy: '#f97316',
    'very-unhealthy': '#ef4444',
    hazardous: '#a855f7',
  };
  return colors[category] || '#6b7280';
};

export function AirQualityMap({ data, onMarkerClick, selectedId }: AirQualityMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!mapboxToken) {
      console.error('Mapbox access token not found');
      return;
    }

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [20.5, 44.0], // Center of Serbia
      zoom: 7,
      attributionControl: false,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    map.current.on('load', () => {
      setIsLoaded(true);
    });

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      map.current?.remove();
    };
  }, []);

  useEffect(() => {
    if (!map.current || !isLoaded || !data.length) return;

    // Remove existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Create markers for each data point
    data.forEach((item) => {
      const el = document.createElement('div');
      const color = getMarkerColor(item.aqiCategory);
      const isSelected = selectedId === item.id;

      el.className = 'air-quality-marker';
      el.style.width = isSelected ? '24px' : '16px';
      el.style.height = isSelected ? '24px' : '16px';
      el.style.borderRadius = '50%';
      el.style.backgroundColor = color;
      el.style.border = `2px solid ${isSelected ? '#fff' : color}`;
      el.style.cursor = 'pointer';
      el.style.boxShadow = isSelected
        ? '0 0 0 4px rgba(255, 255, 255, 0.3)'
        : '0 2px 4px rgba(0,0,0,0.3)';
      el.style.transition = 'all 0.2s';

      el.addEventListener('mouseenter', () => {
        el.style.transform = 'scale(1.2)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'scale(1)';
      });

      const popup = new mapboxgl.Popup({ offset: 25, closeOnClick: false })
        .setHTML(`
          <div class="p-2">
            <div class="font-semibold text-sm">${item.location.name}</div>
            <div class="text-xs text-gray-600 dark:text-gray-400">${item.location.city}</div>
            <div class="mt-1 text-lg font-bold" style="color: ${color}">AQI: ${item.aqi}</div>
          </div>
        `);

      const marker = new mapboxgl.Marker(el)
        .setLngLat(item.location.coordinates)
        .setPopup(popup)
        .addTo(map.current!);

      el.addEventListener('click', () => {
        onMarkerClick?.(item);
      });

      markersRef.current.push(marker);
    });

    // Fit map to show all markers
    if (data.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      data.forEach((item) => {
        bounds.extend(item.location.coordinates);
      });
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 10,
      });
    }
  }, [data, isLoaded, selectedId, onMarkerClick]);

  return (
    <Card className="overflow-hidden">
      <div
        ref={mapContainer}
        className="w-full h-[600px] relative"
        style={{ minHeight: '400px' }}
      />
    </Card>
  );
}

