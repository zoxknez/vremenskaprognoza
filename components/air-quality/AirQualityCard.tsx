'use client';

import { motion } from 'framer-motion';
import { AirQualityData, AQI_COLORS } from '@/lib/types/air-quality';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import { Gauge, MapPin, Clock, Wind } from 'lucide-react';

interface AirQualityCardProps {
  data: AirQualityData;
  onClick?: () => void;
}

const categoryLabels: Record<string, string> = {
  good: 'Dobar',
  moderate: 'Prihvatljiv',
  unhealthy: 'Loš',
  'very-unhealthy': 'Veoma loš',
  hazardous: 'Opasan',
};

export function AirQualityCard({ data, onClick }: AirQualityCardProps) {
  const colors = AQI_COLORS[data.aqiCategory];
  const categoryLabel = categoryLabels[data.aqiCategory] || data.aqiCategory;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card
        className={cn(
          'cursor-pointer transition-all hover:shadow-lg',
          colors.bg,
          colors.border,
          'border-2'
        )}
        onClick={onClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-lg">{data.location.name}</CardTitle>
            </div>
            <Badge variant="outline" className={cn(colors.text, colors.border)}>
              {data.source}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{data.location.city}</p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gauge className={cn('h-5 w-5', colors.text)} />
                <span className="text-sm font-medium">AQI Indeks</span>
              </div>
              <div className="text-right">
                <div className={cn('text-3xl font-bold', colors.text)}>
                  {data.aqi}
                </div>
                <div className={cn('text-xs', colors.text)}>
                  {categoryLabel}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t">
              {data.parameters.pm25 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">PM2.5:</span>{' '}
                  <span className="font-medium">{data.parameters.pm25.toFixed(1)} µg/m³</span>
                </div>
              )}
              {data.parameters.pm10 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">PM10:</span>{' '}
                  <span className="font-medium">{data.parameters.pm10.toFixed(1)} µg/m³</span>
                </div>
              )}
              {data.parameters.no2 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">NO₂:</span>{' '}
                  <span className="font-medium">{data.parameters.no2.toFixed(1)} µg/m³</span>
                </div>
              )}
              {data.parameters.o3 && (
                <div className="text-xs">
                  <span className="text-muted-foreground">O₃:</span>{' '}
                  <span className="font-medium">{data.parameters.o3.toFixed(1)} µg/m³</span>
                </div>
              )}
            </div>

            {data.lastUpdated && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground pt-2 border-t">
                <Clock className="h-3 w-3" />
                <span>
                  Ažurirano: {new Date(data.lastUpdated).toLocaleString('sr-RS')}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

