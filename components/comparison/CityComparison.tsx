'use client';

import { useState, useMemo } from 'react';
import { AirQualityData, AQI_COLORS } from '@/lib/types/air-quality';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils/cn';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  X,
  Plus,
  BarChart3,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

interface CityComparisonProps {
  data: AirQualityData[];
  maxCities?: number;
}

export function CityComparison({ data, maxCities = 5 }: CityComparisonProps) {
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'aqi' | 'name'>('aqi');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Grupiši po gradovima
  const cityData = useMemo(() => {
    const grouped = new Map<string, AirQualityData[]>();
    
    data.forEach((item) => {
      const cityKey = `${item.location.city}-${item.location.region}`;
      if (!grouped.has(cityKey)) {
        grouped.set(cityKey, []);
      }
      grouped.get(cityKey)!.push(item);
    });

    // Izračunaj proseke za svaki grad
    const cityAverages = Array.from(grouped.entries()).map(([key, items]) => {
      const avgAqi = Math.round(
        items.reduce((acc, item) => acc + item.aqi, 0) / items.length
      );
      const avgPm25 = items.reduce((acc, item) => acc + (item.parameters.pm25 || 0), 0) / items.length;
      const avgPm10 = items.reduce((acc, item) => acc + (item.parameters.pm10 || 0), 0) / items.length;
      
      return {
        key,
        city: items[0].location.city,
        region: items[0].location.region,
        aqi: avgAqi,
        aqiCategory: items[0].aqiCategory,
        pm25: avgPm25,
        pm10: avgPm10,
        stationCount: items.length,
      };
    });

    // Sortiraj
    cityAverages.sort((a, b) => {
      if (sortBy === 'aqi') {
        return sortOrder === 'asc' ? a.aqi - b.aqi : b.aqi - a.aqi;
      }
      return sortOrder === 'asc'
        ? a.city.localeCompare(b.city)
        : b.city.localeCompare(a.city);
    });

    return cityAverages;
  }, [data, sortBy, sortOrder]);

  const selectedCityData = useMemo(() => {
    return cityData.filter((city) => selectedCities.includes(city.key));
  }, [cityData, selectedCities]);

  const toggleCity = (cityKey: string) => {
    setSelectedCities((prev) => {
      if (prev.includes(cityKey)) {
        return prev.filter((key) => key !== cityKey);
      }
      if (prev.length >= maxCities) {
        return prev;
      }
      return [...prev, cityKey];
    });
  };

  const clearSelection = () => {
    setSelectedCities([]);
  };

  // Bar chart data
  const barChartData = selectedCityData.map((city) => ({
    name: city.city,
    AQI: city.aqi,
    'PM2.5': Math.round(city.pm25),
    'PM10': Math.round(city.pm10),
  }));

  // Radar chart data
  const radarData = [
    { parameter: 'AQI', fullMark: 300 },
    { parameter: 'PM2.5', fullMark: 150 },
    { parameter: 'PM10', fullMark: 200 },
  ].map((item) => {
    const point: any = { parameter: item.parameter, fullMark: item.fullMark };
    selectedCityData.forEach((city) => {
      if (item.parameter === 'AQI') point[city.city] = city.aqi;
      else if (item.parameter === 'PM2.5') point[city.city] = city.pm25;
      else if (item.parameter === 'PM10') point[city.city] = city.pm10;
    });
    return point;
  });

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00C49F'];

  return (
    <div className="space-y-6">
      {/* City Selection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Uporedi gradove
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSortBy(sortBy === 'aqi' ? 'name' : 'aqi');
                }}
              >
                <ArrowUpDown className="h-4 w-4 mr-1" />
                {sortBy === 'aqi' ? 'AQI' : 'Naziv'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? (
                  <ArrowUp className="h-4 w-4" />
                ) : (
                  <ArrowDown className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">
              Izaberi do {maxCities} gradova za poređenje:
            </p>
            {selectedCities.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCityData.map((city) => (
                  <Badge
                    key={city.key}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => toggleCity(city.key)}
                  >
                    {city.city}
                    <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
                <Button variant="ghost" size="sm" onClick={clearSelection}>
                  Očisti sve
                </Button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto">
            {cityData.map((city) => {
              const isSelected = selectedCities.includes(city.key);
              const colors = AQI_COLORS[city.aqiCategory];

              return (
                <button
                  key={city.key}
                  onClick={() => toggleCity(city.key)}
                  disabled={!isSelected && selectedCities.length >= maxCities}
                  className={cn(
                    'p-3 rounded-lg border text-left transition-all',
                    isSelected
                      ? 'ring-2 ring-primary bg-primary/10'
                      : 'hover:bg-accent',
                    !isSelected && selectedCities.length >= maxCities && 'opacity-50'
                  )}
                >
                  <div className="font-medium text-sm truncate">{city.city}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {city.region}
                  </div>
                  <div className={cn('text-lg font-bold mt-1', colors.text)}>
                    {city.aqi}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {city.stationCount} stanica
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Comparison Charts */}
      {selectedCities.length >= 2 && (
        <>
          {/* Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Poređenje parametara</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="AQI" fill="#8884d8" />
                  <Bar dataKey="PM2.5" fill="#82ca9d" />
                  <Bar dataKey="PM10" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Radar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Radar poređenje</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="parameter" />
                  <PolarRadiusAxis angle={90} domain={[0, 'auto']} />
                  {selectedCityData.map((city, index) => (
                    <Radar
                      key={city.key}
                      name={city.city}
                      dataKey={city.city}
                      stroke={COLORS[index % COLORS.length]}
                      fill={COLORS[index % COLORS.length]}
                      fillOpacity={0.3}
                    />
                  ))}
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detaljna tabela</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Grad</th>
                      <th className="text-center p-2">AQI</th>
                      <th className="text-center p-2">PM2.5</th>
                      <th className="text-center p-2">PM10</th>
                      <th className="text-center p-2">Stanice</th>
                      <th className="text-center p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedCityData.map((city, index) => {
                      const colors = AQI_COLORS[city.aqiCategory];
                      const prevCity = selectedCityData[index - 1];
                      const aqiDiff = prevCity ? city.aqi - prevCity.aqi : 0;

                      return (
                        <tr key={city.key} className="border-b">
                          <td className="p-2 font-medium">
                            {city.city}
                            <span className="text-muted-foreground text-xs block">
                              {city.region}
                            </span>
                          </td>
                          <td className={cn('text-center p-2 font-bold', colors.text)}>
                            {city.aqi}
                            {aqiDiff !== 0 && (
                              <span className={cn('text-xs ml-1', aqiDiff > 0 ? 'text-red-500' : 'text-green-500')}>
                                {aqiDiff > 0 ? <TrendingUp className="h-3 w-3 inline" /> : <TrendingDown className="h-3 w-3 inline" />}
                                {Math.abs(aqiDiff)}
                              </span>
                            )}
                          </td>
                          <td className="text-center p-2">{city.pm25.toFixed(1)}</td>
                          <td className="text-center p-2">{city.pm10.toFixed(1)}</td>
                          <td className="text-center p-2">{city.stationCount}</td>
                          <td className="text-center p-2">
                            <Badge className={cn(colors.bg, colors.text, 'capitalize')}>
                              {city.aqiCategory.replace('-', ' ')}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
