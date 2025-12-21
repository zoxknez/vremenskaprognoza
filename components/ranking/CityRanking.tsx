'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AirQualityData } from '@/lib/types/air-quality';
import { ArrowUp, ArrowDown, Trophy, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface CityRankingProps {
  data: AirQualityData[];
}

interface RankedCity {
  name: string;
  region: string;
  aqi: number;
  averageAQI: number;
  minAQI?: number;
  maxAQI?: number;
  trend: 'up' | 'down' | 'stable';
  pm25: number | undefined;
  pm10: number | undefined;
  stations: number;
  dataQuality?: 'excellent' | 'good' | 'fair' | 'poor';
}

export function CityRanking({ data }: CityRankingProps) {
  const [sortBy, setSortBy] = useState<'aqi' | 'pm25' | 'pm10'>('aqi');

  const rankedCities = useMemo(() => {
    // Grupiši po gradovima
    const cityGroups = new Map<string, AirQualityData[]>();
    
    data.forEach((item) => {
      const key = `${item.location.city}-${item.location.region || 'unknown'}`;
      if (!cityGroups.has(key)) {
        cityGroups.set(key, []);
      }
      cityGroups.get(key)!.push(item);
    });

    // Izračunaj prosječne vrijednosti sa validacijom
    const cities: RankedCity[] = Array.from(cityGroups.entries()).map(([, items]) => {
      // Filter valid AQI values
      const validItems = items.filter(i => 
        typeof i.aqi === 'number' && 
        !isNaN(i.aqi) && 
        i.aqi > 0 && 
        i.aqi < 500
      );
      
      if (validItems.length === 0) return null;
      
      const avgAqi = validItems.reduce((acc, i) => acc + i.aqi, 0) / validItems.length;
      const minAqi = Math.min(...validItems.map(i => i.aqi));
      const maxAqi = Math.max(...validItems.map(i => i.aqi));
      
      const pm25Values = validItems
        .filter(i => i.parameters.pm25 !== undefined && !isNaN(i.parameters.pm25!))
        .map(i => i.parameters.pm25!);
      const pm10Values = validItems
        .filter(i => i.parameters.pm10 !== undefined && !isNaN(i.parameters.pm10!))
        .map(i => i.parameters.pm10!);

      // Određivanje trenda na osnovu raspona vrednosti (ne random)
      const aqiRange = maxAqi - minAqi;
      const trend: 'up' | 'down' | 'stable' = 
        aqiRange > 30 ? (avgAqi > (minAqi + maxAqi) / 2 ? 'up' : 'down') : 'stable';

      // Data quality based on station count and parameter availability
      let dataQuality: 'excellent' | 'good' | 'fair' | 'poor' = 'poor';
      if (validItems.length >= 3 && pm25Values.length > 0 && pm10Values.length > 0) {
        dataQuality = 'excellent';
      } else if (validItems.length >= 2 || (pm25Values.length > 0 && pm10Values.length > 0)) {
        dataQuality = 'good';
      } else if (validItems.length >= 1) {
        dataQuality = 'fair';
      }

      return {
        name: validItems[0].location.city,
        region: validItems[0].location.region || '',
        aqi: Math.round(avgAqi),
        averageAQI: Math.round(avgAqi * 10) / 10,
        minAQI: minAqi,
        maxAQI: maxAqi,
        trend,
        pm25: pm25Values.length > 0 
          ? Math.round(pm25Values.reduce((a, b) => a + b, 0) / pm25Values.length * 10) / 10 
          : undefined,
        pm10: pm10Values.length > 0 
          ? Math.round(pm10Values.reduce((a, b) => a + b, 0) / pm10Values.length * 10) / 10 
          : undefined,
        stations: validItems.length,
        dataQuality,
      };
    }).filter((city): city is RankedCity => city !== null);

    // Sortiraj
    return cities.sort((a, b) => {
      if (sortBy === 'aqi') return a.aqi - b.aqi;
      if (sortBy === 'pm25') return (a.pm25 || Infinity) - (b.pm25 || Infinity);
      if (sortBy === 'pm10') return (a.pm10 || Infinity) - (b.pm10 || Infinity);
      return 0;
    });
  }, [data, sortBy]);

  const cleanestCities = rankedCities.slice(0, 5);
  const mostPollutedCities = [...rankedCities].reverse().slice(0, 5);

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return '#22c55e';
    if (aqi <= 100) return '#eab308';
    if (aqi <= 150) return '#f97316';
    if (aqi <= 200) return '#ef4444';
    if (aqi <= 300) return '#a855f7';
    return '#7c3aed';
  };

  const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-red-500" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-green-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const RankingList = ({ cities, type }: { cities: RankedCity[], type: 'cleanest' | 'polluted' }) => (
    <div className="space-y-3">
      {cities.map((city, index) => {
        const qualityColor = 
          city.dataQuality === 'excellent' ? 'text-green-500' :
          city.dataQuality === 'good' ? 'text-blue-500' :
          city.dataQuality === 'fair' ? 'text-yellow-500' : 'text-gray-500';
        
        return (
          <div
            key={`${city.name}-${city.region}`}
            className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center font-bold text-white
              ${type === 'cleanest' 
                ? index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-700' : 'bg-gray-600'
                : 'bg-red-500'
              }
            `}>
              {index + 1}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold truncate">{city.name}</span>
                {city.region && (
                  <Badge variant="outline" className="text-xs">
                    {city.region}
                  </Badge>
                )}
                {city.dataQuality && (
                  <span className={`text-xs ${qualityColor}`} title={`Kvalitet podataka: ${city.dataQuality}`}>
                    {city.dataQuality === 'excellent' && '●●●'}
                    {city.dataQuality === 'good' && '●●○'}
                    {city.dataQuality === 'fair' && '●○○'}
                    {city.dataQuality === 'poor' && '○○○'}
                  </span>
                )}
              </div>
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <span>{city.stations} {city.stations === 1 ? 'stanica' : 'stanica'}</span>
                {city.minAQI !== undefined && city.maxAQI !== undefined && city.minAQI !== city.maxAQI && (
                  <span className="text-xs">({city.minAQI}-{city.maxAQI})</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <TrendIcon trend={city.trend} />
            </div>

            <div
              className="px-3 py-1 rounded-full text-white font-semibold text-sm"
              style={{ backgroundColor: getAQIColor(city.aqi) }}
            >
              AQI {city.aqi}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Rangiranje gradova po kvaliteti zraka
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="cleanest">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="cleanest" className="flex items-center gap-1">
              <ArrowUp className="h-4 w-4 text-green-500" />
              Najčistiji
            </TabsTrigger>
            <TabsTrigger value="polluted" className="flex items-center gap-1">
              <ArrowDown className="h-4 w-4 text-red-500" />
              Najzagađeniji
            </TabsTrigger>
            <TabsTrigger value="all">Svi gradovi</TabsTrigger>
          </TabsList>

          <TabsContent value="cleanest">
            <RankingList cities={cleanestCities} type="cleanest" />
          </TabsContent>

          <TabsContent value="polluted">
            <RankingList cities={mostPollutedCities} type="polluted" />
          </TabsContent>

          <TabsContent value="all">
            <div className="mb-4">
              <div className="text-sm font-medium mb-2">Sortiraj po:</div>
              <div className="flex gap-2">
                <Badge 
                  variant={sortBy === 'aqi' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSortBy('aqi')}
                >
                  AQI
                </Badge>
                <Badge 
                  variant={sortBy === 'pm25' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSortBy('pm25')}
                >
                  PM2.5
                </Badge>
                <Badge 
                  variant={sortBy === 'pm10' ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSortBy('pm10')}
                >
                  PM10
                </Badge>
              </div>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto space-y-2">
              {rankedCities.map((city, index) => (
                <div
                  key={`${city.name}-${city.region}`}
                  className="flex items-center justify-between p-2 rounded border hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground w-6 text-right">#{index + 1}</span>
                    <div>
                      <span className="font-medium">{city.name}</span>
                      {city.region && <span className="text-muted-foreground text-sm ml-2">{city.region}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span>AQI: <strong>{city.aqi}</strong></span>
                    {city.pm25 !== undefined && <span>PM2.5: {city.pm25}</span>}
                    {city.pm10 !== undefined && <span>PM10: {city.pm10}</span>}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Statistike */}
        <div className="mt-6 pt-4 border-t grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-500">
              {rankedCities.filter(c => c.aqi <= 50).length}
            </div>
            <div className="text-sm text-muted-foreground">Dobar AQI</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-500">
              {rankedCities.filter(c => c.aqi > 50 && c.aqi <= 100).length}
            </div>
            <div className="text-sm text-muted-foreground">Umjeren AQI</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-500">
              {rankedCities.filter(c => c.aqi > 100).length}
            </div>
            <div className="text-sm text-muted-foreground">Nezdrav AQI</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
