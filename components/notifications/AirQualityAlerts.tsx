'use client';

import { useEffect, useState } from 'react';
import { AirQualityData } from '@/lib/types/air-quality';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AirQualityAlertsProps {
  data: AirQualityData[];
  threshold?: number;
}

export function AirQualityAlerts({ data, threshold = 150 }: AirQualityAlertsProps) {
  const [alerts, setAlerts] = useState<AirQualityData[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
      if (Notification.permission === 'default') {
        Notification.requestPermission().then(setPermission);
      }
    }
  }, []);

  useEffect(() => {
    const highAQI = data.filter(
      (item) => item.aqi >= threshold && !dismissed.has(item.id)
    );
    setAlerts(highAQI);

    // Show browser notifications
    if (permission === 'granted' && highAQI.length > 0) {
      highAQI.forEach((item) => {
        new Notification(`Visok nivo zagadenja: ${item.location.name}`, {
          body: `AQI indeks: ${item.aqi} - ${item.location.city}`,
          icon: '/icon-192x192.png',
          tag: item.id,
        });
      });
    }
  }, [data, threshold, dismissed, permission]);

  const dismissAlert = (id: string) => {
    setDismissed((prev) => new Set(prev).add(id));
  };

  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert) => (
        <Alert key={alert.id} variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Visok nivo zagadenja</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <div>
              <strong>{alert.location.name}</strong> ({alert.location.city}) - AQI:{' '}
              {alert.aqi}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => dismissAlert(alert.id)}
              className="ml-4"
            >
              <X className="h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  );
}

