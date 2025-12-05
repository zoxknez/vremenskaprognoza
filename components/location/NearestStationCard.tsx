'use client';

import { useGeolocation, useNearestStation, formatDistance } from '@/lib/hooks/useGeolocation';
import { AirQualityData, AQI_COLORS } from '@/lib/types/air-quality';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Locate, Navigation, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface NearestStationCardProps {
  data: AirQualityData[];
  onStationClick?: (station: AirQualityData) => void;
}

export function NearestStationCard({ data, onStationClick }: NearestStationCardProps) {
  const {
    latitude,
    longitude,
    error,
    isLoading,
    isSupported,
    getCurrentPosition,
  } = useGeolocation();

  const { nearestStation, distance } = useNearestStation(data, {
    latitude,
    longitude,
  });

  if (!isSupported) {
    return null;
  }

  if (!latitude || !longitude) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Locate className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Pronađi najbližu stanicu</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Omogući pristup lokaciji za prikaz najbliže merne stanice
              </p>
            </div>
            {error && (
              <div className="flex items-center justify-center gap-2 text-sm text-red-500">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}
            <Button
              onClick={getCurrentPosition}
              disabled={isLoading}
              variant="outline"
              className="gap-2"
            >
              <MapPin className="h-4 w-4" />
              {isLoading ? 'Tražim lokaciju...' : 'Omogući lokaciju'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!nearestStation) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            Nema dostupnih stanica u blizini
          </div>
        </CardContent>
      </Card>
    );
  }

  const colors = AQI_COLORS[nearestStation.aqiCategory];

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-lg',
        colors.border,
        colors.bg
      )}
      onClick={() => onStationClick?.(nearestStation)}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Navigation className="h-4 w-4 text-primary" />
            Najbliža stanica
          </span>
          {distance !== null && (
            <span className="text-sm font-normal text-muted-foreground">
              {formatDistance(distance)}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-lg">{nearestStation.location.name}</h3>
            <p className="text-sm text-muted-foreground">
              {nearestStation.location.city}, {nearestStation.location.region}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className={cn('text-3xl font-bold', colors.text)}>
                {nearestStation.aqi}
              </div>
              <div className="text-sm text-muted-foreground">AQI indeks</div>
            </div>

            <div className="text-right">
              <div className={cn('text-sm font-medium capitalize', colors.text)}>
                {nearestStation.aqiCategory.replace('-', ' ')}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Izvor: {nearestStation.source}
              </div>
            </div>
          </div>

          {nearestStation.parameters.pm25 && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t">
              <div className="text-sm">
                <span className="text-muted-foreground">PM2.5:</span>{' '}
                <span className="font-medium">{nearestStation.parameters.pm25.toFixed(1)} µg/m³</span>
              </div>
              {nearestStation.parameters.pm10 && (
                <div className="text-sm">
                  <span className="text-muted-foreground">PM10:</span>{' '}
                  <span className="font-medium">{nearestStation.parameters.pm10.toFixed(1)} µg/m³</span>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Jednostavan prikaz lokacije
export function LocationBadge() {
  const { latitude, longitude, isLoading, getCurrentPosition, isSupported } = useGeolocation();

  if (!isSupported) return null;

  if (!latitude || !longitude) {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={getCurrentPosition}
        disabled={isLoading}
        className="gap-2"
      >
        <MapPin className="h-4 w-4" />
        {isLoading ? 'Učitavam...' : 'Moja lokacija'}
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <MapPin className="h-4 w-4 text-green-500" />
      <span>
        {latitude.toFixed(4)}, {longitude.toFixed(4)}
      </span>
    </div>
  );
}
