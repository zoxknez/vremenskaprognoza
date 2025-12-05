'use client';

import { useEffect, useRef, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { AirQualityData, AQI_COLORS } from '@/lib/types/air-quality';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Layers } from 'lucide-react';

interface AirQualityHeatmapProps {
  data: AirQualityData[];
  parameter?: 'aqi' | 'pm25' | 'pm10';
}

export function AirQualityHeatmap({ data, parameter = 'aqi' }: AirQualityHeatmapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  // Prepare heatmap data
  const heatmapData = useMemo(() => {
    return {
      type: 'FeatureCollection' as const,
      features: data
        .filter((item) => {
          const value = parameter === 'aqi' 
            ? item.aqi 
            : item.parameters[parameter as 'pm25' | 'pm10'];
          return value !== undefined && !isNaN(value);
        })
        .map((item) => ({
          type: 'Feature' as const,
          properties: {
            value: parameter === 'aqi' 
              ? item.aqi 
              : item.parameters[parameter as 'pm25' | 'pm10'],
            name: item.location.name,
            city: item.location.city,
          },
          geometry: {
            type: 'Point' as const,
            coordinates: item.location.coordinates,
          },
        })),
    };
  }, [data, parameter]);

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
      center: [20.5, 44.0],
      zoom: 6,
    });

    map.current.on('load', () => {
      if (!map.current) return;

      // Add heatmap source
      map.current.addSource('air-quality-heatmap', {
        type: 'geojson',
        data: heatmapData,
      });

      // Add heatmap layer
      map.current.addLayer({
        id: 'air-quality-heatmap-layer',
        type: 'heatmap',
        source: 'air-quality-heatmap',
        paint: {
          // Increase weight based on value
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'value'],
            0, 0,
            50, 0.3,
            100, 0.5,
            150, 0.7,
            200, 0.9,
            300, 1,
          ],
          // Increase intensity as zoom level increases
          'heatmap-intensity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 1,
            9, 3,
          ],
          // Color ramp for heatmap
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0, 0, 255, 0)',
            0.1, 'rgb(65, 182, 196)',
            0.3, 'rgb(127, 205, 187)',
            0.5, 'rgb(199, 233, 180)',
            0.7, 'rgb(237, 248, 177)',
            0.9, 'rgb(255, 237, 160)',
            1, 'rgb(254, 178, 76)',
          ],
          // Adjust radius by zoom level
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 2,
            6, 20,
            9, 40,
          ],
          // Decrease opacity at higher zoom levels
          'heatmap-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            7, 1,
            9, 0.8,
          ],
        },
      });

      // Add circle layer for individual points at higher zoom
      map.current.addLayer({
        id: 'air-quality-points',
        type: 'circle',
        source: 'air-quality-heatmap',
        minzoom: 8,
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8, 5,
            12, 15,
          ],
          'circle-color': [
            'interpolate',
            ['linear'],
            ['get', 'value'],
            0, '#22c55e',
            50, '#eab308',
            100, '#f97316',
            150, '#ef4444',
            200, '#a855f7',
          ],
          'circle-stroke-color': 'white',
          'circle-stroke-width': 1,
          'circle-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8, 0,
            9, 1,
          ],
        },
      });

      // Add popup on click
      map.current.on('click', 'air-quality-points', (e) => {
        if (!e.features?.[0]) return;
        
        const properties = e.features[0].properties;
        const coordinates = (e.features[0].geometry as any).coordinates.slice();
        
        new mapboxgl.Popup()
          .setLngLat(coordinates)
          .setHTML(`
            <div class="p-2">
              <div class="font-semibold">${properties?.name || 'Unknown'}</div>
              <div class="text-sm text-gray-600">${properties?.city || ''}</div>
              <div class="text-lg font-bold mt-1">${parameter.toUpperCase()}: ${properties?.value}</div>
            </div>
          `)
          .addTo(map.current!);
      });

      // Change cursor on hover
      map.current.on('mouseenter', 'air-quality-points', () => {
        if (map.current) map.current.getCanvas().style.cursor = 'pointer';
      });
      map.current.on('mouseleave', 'air-quality-points', () => {
        if (map.current) map.current.getCanvas().style.cursor = '';
      });
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  // Update heatmap data when data changes
  useEffect(() => {
    if (!map.current) return;
    
    const source = map.current.getSource('air-quality-heatmap') as mapboxgl.GeoJSONSource;
    if (source) {
      source.setData(heatmapData);
    }
  }, [heatmapData]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Heatmapa zagađenja
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div
          ref={mapContainer}
          className="w-full h-[500px] rounded-b-lg"
        />
        {/* Legend */}
        <div className="p-4 border-t">
          <div className="text-sm font-medium mb-2">
            {parameter === 'aqi' ? 'AQI indeks' : parameter.toUpperCase()} nivoi
          </div>
          <div className="flex items-center gap-1">
            <div className="h-4 flex-1 rounded" style={{
              background: 'linear-gradient(to right, #22c55e, #eab308, #f97316, #ef4444, #a855f7)'
            }} />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>Dobar (0)</span>
            <span>Umeren (50)</span>
            <span>Nezdrav (100)</span>
            <span>Vrlo nezdrav (150)</span>
            <span>Opasan (200+)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Jednostavnija verzija heatmape bez Mapbox-a (koristi CSS gradijent)
interface SimpleHeatmapGridProps {
  data: AirQualityData[];
}

export function SimpleHeatmapGrid({ data }: SimpleHeatmapGridProps) {
  // Grupiši podatke po regionima/gradovima
  const groupedData = useMemo(() => {
    const groups = new Map<string, AirQualityData[]>();
    
    data.forEach((item) => {
      const key = item.location.region || 'Unknown';
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(item);
    });

    return Array.from(groups.entries()).map(([region, items]) => ({
      region,
      avgAqi: Math.round(items.reduce((acc, i) => acc + i.aqi, 0) / items.length),
      count: items.length,
    })).sort((a, b) => b.avgAqi - a.avgAqi);
  }, [data]);

  const getColor = (aqi: number) => {
    if (aqi <= 50) return '#22c55e';
    if (aqi <= 100) return '#eab308';
    if (aqi <= 150) return '#f97316';
    if (aqi <= 200) return '#ef4444';
    return '#a855f7';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="h-5 w-5" />
          Zagađenje po regionima
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {groupedData.map(({ region, avgAqi, count }) => (
            <div
              key={region}
              className="p-4 rounded-lg text-white transition-transform hover:scale-105"
              style={{ backgroundColor: getColor(avgAqi) }}
            >
              <div className="font-semibold truncate">{region}</div>
              <div className="text-2xl font-bold">{avgAqi}</div>
              <div className="text-sm opacity-80">{count} stanica</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
