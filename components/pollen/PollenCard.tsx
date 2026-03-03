'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Calendar, Flower2, Trees, Wind } from 'lucide-react';

import { fetchGooglePollen, type PollenData, type PollenIndexLevel, getPollenLevelColor } from '@/lib/api/google-pollen';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/Skeleton';

interface PollenCardProps {
  lat: number;
  lon: number;
  cityName: string;
  region?: string;
}

function getLevelText(level: PollenIndexLevel): string {
  const labels: Record<PollenIndexLevel, string> = {
    NONE: 'Nema',
    LOW: 'Nizak',
    MEDIUM: 'Umeren',
    HIGH: 'Visok',
    VERY_HIGH: 'Veoma visok',
  };
  return labels[level];
}

function getOverallTip(level: PollenIndexLevel): string {
  if (level === 'NONE' || level === 'LOW') {
    return 'Nizak rizik za vecinu korisnika.';
  }
  if (level === 'MEDIUM') {
    return 'Ako ste alergicni, ogranicite duzi boravak napolju.';
  }
  if (level === 'HIGH') {
    return 'Preporucena maska i zatvoreni prozori u periodu najvece koncentracije polena.';
  }
  return 'Vrlo visok rizik: smanjite boravak napolju i pratite simptome.';
}

export function PollenCard({ lat, lon, cityName, region }: PollenCardProps) {
  const [pollenData, setPollenData] = useState<PollenData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadPollenData = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchGooglePollen(lat, lon, cityName, region);
        if (!cancelled) {
          setPollenData(data);
        }
      } catch (err) {
        console.error('Error loading pollen data:', err);
        if (!cancelled) {
          setError('Nije moguce ucitati podatke o polenu.');
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadPollenData();

    return () => {
      cancelled = true;
    };
  }, [lat, lon, cityName, region]);

  if (loading) {
    return (
      <Card className="glass-effect rounded-2xl border-slate-700/60 p-6">
        <Skeleton className="mb-4 h-7 w-48" />
        <Skeleton className="h-64 w-full" />
      </Card>
    );
  }

  if (error || !pollenData) {
    return (
      <Card className="rounded-2xl border-amber-500/30 bg-amber-500/10 p-6">
        <div className="flex items-start gap-3 text-amber-200">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" />
          <div>
            <p>{error || 'Podaci o polenu trenutno nisu dostupni.'}</p>
            <p className="mt-1 text-sm text-amber-300">Proverite Google Pollen API konfiguraciju.</p>
          </div>
        </div>
      </Card>
    );
  }

  const today = pollenData.daily[0];
  const treeLevel = today?.pollenTypes?.tree?.indexLevel || 'NONE';
  const grassLevel = today?.pollenTypes?.grass?.indexLevel || 'NONE';
  const weedLevel = today?.pollenTypes?.weed?.indexLevel || 'NONE';
  const overallLevel: PollenIndexLevel = [treeLevel, grassLevel, weedLevel].includes('VERY_HIGH')
    ? 'VERY_HIGH'
    : [treeLevel, grassLevel, weedLevel].includes('HIGH')
      ? 'HIGH'
      : [treeLevel, grassLevel, weedLevel].includes('MEDIUM')
        ? 'MEDIUM'
        : [treeLevel, grassLevel, weedLevel].includes('LOW')
          ? 'LOW'
          : 'NONE';

  const overallColors = getPollenLevelColor(overallLevel);

  const pollenTypes = [
    {
      key: 'tree',
      label: 'Drvece',
      level: treeLevel,
      value: today?.pollenTypes?.tree?.indexValue || 0,
      icon: <Trees className="h-5 w-5" />,
    },
    {
      key: 'grass',
      label: 'Trava',
      level: grassLevel,
      value: today?.pollenTypes?.grass?.indexValue || 0,
      icon: <Wind className="h-5 w-5" />,
    },
    {
      key: 'weed',
      label: 'Korov',
      level: weedLevel,
      value: today?.pollenTypes?.weed?.indexValue || 0,
      icon: <Flower2 className="h-5 w-5" />,
    },
  ] as const;

  return (
    <Card className="glass-effect rounded-2xl border-slate-700/60 p-6">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="mb-1 flex items-center gap-2 text-2xl font-bold text-white">
            <Flower2 className="h-6 w-6 text-fuchsia-300" />
            Indeks polena
          </h2>
          <p className="text-sm text-slate-400">{cityName}</p>
        </div>

        <div className="text-right">
          <p className="text-3xl font-bold text-white">
            {Math.max(
              today?.pollenTypes?.tree?.indexValue || 0,
              today?.pollenTypes?.grass?.indexValue || 0,
              today?.pollenTypes?.weed?.indexValue || 0
            )}
          </p>
          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${overallColors.bg} ${overallColors.border} ${overallColors.text}`}>
            {getLevelText(overallLevel)}
          </span>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {pollenTypes.map((item) => {
          const colors = getPollenLevelColor(item.level);

          return (
            <div key={item.key} className={`rounded-xl border p-4 ${colors.bg} ${colors.border}`}>
              <div className={`mb-2 flex items-center gap-2 ${colors.text}`}>
                {item.icon}
                <p className="font-semibold">{item.label}</p>
              </div>
              <p className="text-2xl font-bold text-white">{item.value}</p>
              <p className={`mt-1 text-xs font-semibold ${colors.text}`}>{getLevelText(item.level)}</p>
            </div>
          );
        })}
      </div>

      {pollenData.daily.length > 1 && (
        <div className="mb-6">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-300">
            <Calendar className="h-4 w-4" />
            5-dnevna prognoza
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {pollenData.daily.slice(0, 5).map((day, index) => {
              const date = new Date(day.date);
              const dayName = date.toLocaleDateString('sr-RS', { weekday: 'short' });
              const maxIndex = Math.max(
                day.pollenTypes?.tree?.indexValue || 0,
                day.pollenTypes?.grass?.indexValue || 0,
                day.pollenTypes?.weed?.indexValue || 0
              );
              const level: PollenIndexLevel =
                maxIndex === 0 ? 'NONE' : maxIndex <= 1 ? 'LOW' : maxIndex <= 2 ? 'MEDIUM' : maxIndex <= 3 ? 'HIGH' : 'VERY_HIGH';
              const colors = getPollenLevelColor(level);

              return (
                <div key={`${day.date}-${index}`} className={`rounded-lg border p-3 text-center ${colors.bg} ${colors.border}`}>
                  <p className="mb-1 text-xs text-slate-300">{dayName}</p>
                  <p className="text-lg font-bold text-white">{maxIndex}</p>
                  <p className={`text-xs font-medium ${colors.text}`}>{getLevelText(level)}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {today?.plants && today.plants.length > 0 && (
        <div className="mb-6 border-t border-slate-700/60 pt-4">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-300">Aktivne biljke</h3>
          <div className="flex flex-wrap gap-2">
            {today.plants
              .filter((plant) => plant.inSeason)
              .slice(0, 10)
              .map((plant, index) => (
                <span
                  key={`${plant.code}-${index}`}
                  className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-100"
                >
                  {plant.displayName}
                </span>
              ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-blue-400/30 bg-blue-500/10 p-4">
        <p className="mb-1 text-sm font-semibold uppercase tracking-wide text-blue-200">Preporuka za alergicare</p>
        <p className="text-sm text-blue-100">{getOverallTip(overallLevel)}</p>
        {today?.pollenTypes?.tree?.healthRecommendations && today.pollenTypes.tree.healthRecommendations.length > 0 && (
          <ul className="mt-2 space-y-1 text-sm text-blue-100">
            {today.pollenTypes.tree.healthRecommendations.slice(0, 3).map((rec, index) => (
              <li key={`${index}-${rec}`}>- {rec}</li>
            ))}
          </ul>
        )}
      </div>
    </Card>
  );
}
