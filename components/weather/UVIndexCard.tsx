'use client';

import { useEffect, useState } from 'react';
import { AlertCircle, Calendar, Clock, Shield, Sun } from 'lucide-react';

import { fetchGoogleUVIndex, type UVIndexData } from '@/lib/api/google-uv-index';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/Skeleton';

interface UVIndexCardProps {
  lat: number;
  lon: number;
  cityName: string;
  region?: string;
}

type UVLevel = UVIndexData['current']['level'];

const LEVEL_LABELS: Record<UVLevel, string> = {
  low: 'Nizak',
  moderate: 'Umeren',
  high: 'Visok',
  very_high: 'Veoma visok',
  extreme: 'Ekstreman',
};

const LEVEL_STYLES: Record<UVLevel, { badge: string; panel: string; border: string; text: string }> = {
  low: {
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40',
    panel: 'bg-emerald-500/10',
    border: 'border-emerald-400/30',
    text: 'text-emerald-300',
  },
  moderate: {
    badge: 'bg-yellow-500/20 text-yellow-300 border-yellow-400/40',
    panel: 'bg-yellow-500/10',
    border: 'border-yellow-400/30',
    text: 'text-yellow-300',
  },
  high: {
    badge: 'bg-orange-500/20 text-orange-300 border-orange-400/40',
    panel: 'bg-orange-500/10',
    border: 'border-orange-400/30',
    text: 'text-orange-300',
  },
  very_high: {
    badge: 'bg-red-500/20 text-red-300 border-red-400/40',
    panel: 'bg-red-500/10',
    border: 'border-red-400/30',
    text: 'text-red-300',
  },
  extreme: {
    badge: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/40',
    panel: 'bg-fuchsia-500/10',
    border: 'border-fuchsia-400/30',
    text: 'text-fuchsia-300',
  },
};

function getOutdoorTip(uvIndex: number): string {
  if (uvIndex < 3) {
    return 'Uslovi su povoljni za aktivnosti napolju. Osnovna zastita je dovoljna.';
  }
  if (uvIndex < 6) {
    return 'Koristite SPF 30+ i trazite hlad u periodu najjaceg sunca.';
  }
  if (uvIndex < 8) {
    return 'Ogranicite direktno izlaganje suncu izmedju 10h i 16h.';
  }
  return 'Preporucuje se izbegavanje boravka na direktnom suncu izmedju 10h i 16h.';
}

export function UVIndexCard({ lat, lon, cityName, region }: UVIndexCardProps) {
  const [uvData, setUvData] = useState<UVIndexData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadUVData = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchGoogleUVIndex(lat, lon, cityName, region);
        if (cancelled) {
          return;
        }
        setUvData(data);
      } catch (err) {
        console.error('Error loading UV data:', err);
        if (!cancelled) {
          setError('Nije moguce ucitati UV indeks.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadUVData();

    return () => {
      cancelled = true;
    };
  }, [lat, lon, cityName, region]);

  if (loading) {
    return (
      <Card className="glass-effect rounded-2xl border-slate-700/60 p-6">
        <Skeleton className="mb-4 h-7 w-44" />
        <Skeleton className="h-64 w-full" />
      </Card>
    );
  }

  if (error || !uvData) {
    return (
      <Card className="rounded-2xl border-amber-500/30 bg-amber-500/10 p-6">
        <div className="flex items-start gap-3 text-amber-200">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <p>{error || 'UV indeks trenutno nije dostupan.'}</p>
        </div>
      </Card>
    );
  }

  const { current, forecast, recommendations } = uvData;
  const style = LEVEL_STYLES[current.level];

  return (
    <Card className="glass-effect rounded-2xl border-slate-700/60 p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="mb-1 flex items-center gap-2 text-2xl font-bold text-white">
            <Sun className="h-6 w-6 text-amber-300" />
            UV indeks
          </h2>
          <p className="text-sm text-slate-400">{cityName}</p>
        </div>

        <div className="text-right">
          <p className="text-4xl font-bold text-white">{current.uvIndex.toFixed(1)}</p>
          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${style.badge}`}>
            {LEVEL_LABELS[current.level]}
          </span>
        </div>
      </div>

      <div className={`mb-6 rounded-2xl border p-5 ${style.panel} ${style.border}`}>
        <div className="mb-2 flex items-center gap-2">
          <Shield className={`h-5 w-5 ${style.text}`} />
          <p className={`text-sm font-semibold uppercase tracking-wide ${style.text}`}>Preporuka zastite</p>
        </div>
        <p className="font-medium text-white">{recommendations.protection}</p>
        <p className="mt-1 text-sm text-slate-300">{recommendations.explanation}</p>
      </div>

      <div className="mb-6">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">UV skala</h3>
        <div className="grid grid-cols-5 gap-2">
          {(
            [
              { range: '0-2', level: 'low', label: 'Nizak' },
              { range: '3-5', level: 'moderate', label: 'Umeren' },
              { range: '6-7', level: 'high', label: 'Visok' },
              { range: '8-10', level: 'very_high', label: 'V. visok' },
              { range: '11+', level: 'extreme', label: 'Ekstrem' },
            ] as const
          ).map((item) => {
            const itemStyle = LEVEL_STYLES[item.level];
            const isActive = item.level === current.level;

            return (
              <div
                key={item.level}
                className={`rounded-lg border p-2 text-center ${itemStyle.panel} ${
                  isActive ? itemStyle.border : 'border-slate-700/60'
                }`}
              >
                <p className={`text-xs font-bold ${itemStyle.text}`}>{item.range}</p>
                <p className="text-xs text-slate-300">{item.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {forecast && forecast.length > 0 && (
        <div className="mb-6">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-300">
            <Calendar className="h-4 w-4" />
            5-dnevna prognoza
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {forecast.map((day, index) => {
              const dayDate = new Date(day.date);
              const dayName = dayDate.toLocaleDateString('sr-RS', { weekday: 'short' });
              const forecastStyle = LEVEL_STYLES[day.level];

              return (
                <div
                  key={`${day.date}-${index}`}
                  className={`rounded-lg border p-3 text-center ${forecastStyle.panel} ${forecastStyle.border}`}
                >
                  <p className="mb-1 text-xs text-slate-300">{dayName}</p>
                  <p className="text-lg font-bold text-white">{day.maxUV.toFixed(1)}</p>
                  <p className={`text-xs font-medium ${forecastStyle.text}`}>{LEVEL_LABELS[day.level]}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {uvData.sunInfo && (
        <div className="mb-6 border-t border-slate-700/60 pt-4">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-300">
            <Clock className="h-4 w-4" />
            Sunce
          </h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-slate-400">Izlazak</p>
              <p className="font-semibold text-white">
                {new Date(uvData.sunInfo.sunrise).toLocaleTimeString('sr-RS', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div>
              <p className="text-slate-400">Podne</p>
              <p className="font-semibold text-white">
                {new Date(uvData.sunInfo.solarNoon).toLocaleTimeString('sr-RS', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
            <div>
              <p className="text-slate-400">Zalazak</p>
              <p className="font-semibold text-white">
                {new Date(uvData.sunInfo.sunset).toLocaleTimeString('sr-RS', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4">
        <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-emerald-300">Preporuka</p>
        <p className="text-sm text-emerald-100">{getOutdoorTip(current.uvIndex)}</p>
      </div>
    </Card>
  );
}
