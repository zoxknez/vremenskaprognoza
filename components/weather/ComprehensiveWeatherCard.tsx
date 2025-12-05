'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  Wind,
  Droplets,
  Thermometer,
  Eye,
  Gauge,
  Sunrise,
  Sunset,
  Moon,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Clock,
  Calendar,
  Navigation,
  Waves,
  Umbrella,
  Zap
} from 'lucide-react';

// Types from weather-forecast.ts
interface CurrentWeather {
  temperature: number;
  feelsLike: number;
  humidity: number;
  pressure: number;
  pressureTrend: 'rising' | 'falling' | 'stable';
  visibility: number;
  uvIndex: number;
  uvCategory: string;
  cloudCover: number;
  dewPoint: number;
  description: string;
  icon: string;
  wind: {
    speed: number;
    gust: number;
    direction: number;
    directionText: string;
  };
  precipitation: {
    probability: number;
    type: 'none' | 'rain' | 'snow' | 'sleet' | 'mixed';
    intensity: number;
    lastHour: number;
  };
  sun: {
    sunrise: string;
    sunset: string;
    dayLength: string;
    solarNoon: string;
  };
  moon: {
    phase: string;
    illumination: number;
    moonrise: string;
    moonset: string;
  };
  airQualityImpact: {
    dispersionIndex: number;
    inversionRisk: 'low' | 'moderate' | 'high';
    smogPotential: 'low' | 'moderate' | 'high';
    recommendation: string;
  };
}

interface HourlyForecast {
  time: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  precipProbability: number;
  description: string;
  icon: string;
}

interface DailyForecast {
  date: string;
  dayOfWeek: string;
  temperature: {
    min: number;
    max: number;
    morning: number;
    day: number;
    evening: number;
    night: number;
  };
  humidity: number;
  wind: {
    speed: number;
    gust: number;
    direction: number;
  };
  precipitation: {
    probability: number;
    total: number;
    type: string;
  };
  uvIndex: number;
  description: string;
  icon: string;
  summary: string;
}

interface WeatherAlert {
  id: string;
  event: string;
  severity: 'minor' | 'moderate' | 'severe' | 'extreme';
  headline: string;
  description: string;
  start: string;
  end: string;
}

interface ComprehensiveWeatherData {
  location: {
    name: string;
    city: string;
    country: string;
    coordinates: [number, number];
    timezone: string;
    localTime: string;
  };
  current: CurrentWeather;
  hourly: HourlyForecast[];
  daily: DailyForecast[];
  alerts: WeatherAlert[];
  metadata: {
    lastUpdated: string;
    source: string;
    units: 'metric' | 'imperial';
  };
}

// Weather icon component
function WeatherIcon({ icon, size = 24 }: { icon: string; size?: number }) {
  const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;
  return <img src={iconUrl} alt="weather" style={{ width: size, height: size }} />;
}

// Main comprehensive weather component
interface ComprehensiveWeatherCardProps {
  data: ComprehensiveWeatherData;
}

export function ComprehensiveWeatherCard({ data }: ComprehensiveWeatherCardProps) {
  const { current, location } = data;
  
  const getDispersionColor = (index: number) => {
    if (index >= 7) return 'text-green-500';
    if (index >= 4) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getRiskBadge = (risk: string) => {
    const colors = {
      low: 'bg-green-500/10 text-green-600',
      moderate: 'bg-yellow-500/10 text-yellow-600',
      high: 'bg-red-500/10 text-red-600',
    };
    return colors[risk as keyof typeof colors] || colors.low;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white pb-8">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{location.city}</CardTitle>
            <p className="text-blue-100 text-sm">{location.country}</p>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold">{current.temperature}°</div>
            <div className="text-blue-100">Osjeća se kao {current.feelsLike}°</div>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <WeatherIcon icon={current.icon} size={48} />
          <span className="text-lg capitalize">{current.description}</span>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <Tabs defaultValue="details">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Detalji</TabsTrigger>
            <TabsTrigger value="hourly">Satno</TabsTrigger>
            <TabsTrigger value="daily">7 dana</TabsTrigger>
            <TabsTrigger value="air">Zrak</TabsTrigger>
          </TabsList>

          {/* Current Details */}
          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <DetailCard 
                icon={<Wind className="h-5 w-5 text-blue-500" />}
                label="Vjetar"
                value={`${current.wind.speed} m/s`}
                subValue={`Udari do ${current.wind.gust} m/s • ${current.wind.directionText}`}
              />
              <DetailCard 
                icon={<Droplets className="h-5 w-5 text-cyan-500" />}
                label="Vlažnost"
                value={`${current.humidity}%`}
                subValue={`Rosište: ${current.dewPoint}°C`}
              />
              <DetailCard 
                icon={<Gauge className="h-5 w-5 text-purple-500" />}
                label="Pritisak"
                value={`${current.pressure} hPa`}
                subValue={current.pressureTrend === 'rising' ? '↑ Raste' : current.pressureTrend === 'falling' ? '↓ Pada' : '→ Stabilan'}
              />
              <DetailCard 
                icon={<Eye className="h-5 w-5 text-gray-500" />}
                label="Vidljivost"
                value={`${(current.visibility / 1000).toFixed(1)} km`}
              />
              <DetailCard 
                icon={<Cloud className="h-5 w-5 text-gray-400" />}
                label="Oblačnost"
                value={`${current.cloudCover}%`}
              />
              <DetailCard 
                icon={<Sun className="h-5 w-5 text-yellow-500" />}
                label="UV Indeks"
                value={current.uvIndex.toString()}
                subValue={current.uvCategory}
              />
              <DetailCard 
                icon={<Umbrella className="h-5 w-5 text-blue-400" />}
                label="Padavine"
                value={`${current.precipitation.probability}%`}
                subValue={current.precipitation.type !== 'none' ? `${current.precipitation.intensity} mm/h` : 'Bez padavina'}
              />
              <DetailCard 
                icon={<Navigation className="h-5 w-5 text-indigo-500" style={{ transform: `rotate(${current.wind.direction}deg)` }} />}
                label="Smjer vjetra"
                value={current.wind.directionText}
                subValue={`${current.wind.direction}°`}
              />
            </div>

            {/* Sun & Moon */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <Card className="bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950/20 dark:to-yellow-950/20">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Sun className="h-5 w-5 text-orange-500" />
                    Sunce
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1"><Sunrise className="h-4 w-4" /> Izlazak</span>
                      <span>{new Date(current.sun.sunrise).toLocaleTimeString('hr', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-1"><Sunset className="h-4 w-4" /> Zalazak</span>
                      <span>{new Date(current.sun.sunset).toLocaleTimeString('hr', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Dužina dana</span>
                      <span className="font-medium">{current.sun.dayLength}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20">
                <CardContent className="p-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Moon className="h-5 w-5 text-indigo-500" />
                    Mjesec
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Faza</span>
                      <span>{current.moon.phase}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Osvjetljenje</span>
                      <span>{current.moon.illumination}%</span>
                    </div>
                    {current.moon.moonrise && (
                      <div className="flex justify-between">
                        <span>Izlazak</span>
                        <span>{new Date(current.moon.moonrise).toLocaleTimeString('hr', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Hourly Forecast */}
          <TabsContent value="hourly" className="mt-4">
            <div className="flex overflow-x-auto gap-3 pb-2">
              {data.hourly.slice(0, 24).map((hour, index) => (
                <div 
                  key={index}
                  className="flex-shrink-0 w-16 p-2 rounded-lg bg-muted/50 text-center"
                >
                  <div className="text-xs text-muted-foreground">
                    {new Date(hour.time).toLocaleTimeString('hr', { hour: '2-digit' })}
                  </div>
                  <WeatherIcon icon={hour.icon} size={32} />
                  <div className="font-semibold">{Math.round(hour.temperature)}°</div>
                  {hour.precipProbability > 0 && (
                    <div className="text-xs text-blue-500">{hour.precipProbability}%</div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Daily Forecast */}
          <TabsContent value="daily" className="mt-4">
            <div className="space-y-2">
              {data.daily.map((day, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50"
                >
                  <div className="w-24">
                    <div className="font-medium">{day.dayOfWeek}</div>
                    <div className="text-xs text-muted-foreground">{day.date}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <WeatherIcon icon={day.icon} size={32} />
                    {day.precipitation.probability > 0 && (
                      <span className="text-xs text-blue-500">{day.precipitation.probability}%</span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-semibold">{day.temperature.max}°</span>
                    <span className="text-muted-foreground ml-2">{day.temperature.min}°</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Air Quality Impact */}
          <TabsContent value="air" className="mt-4 space-y-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Waves className="h-5 w-5" />
                  Utjecaj na kvalitetu zraka
                </h4>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Indeks raspršivanja</span>
                    <div className="flex items-center gap-2">
                      <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${current.airQualityImpact.dispersionIndex >= 7 ? 'bg-green-500' : current.airQualityImpact.dispersionIndex >= 4 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${current.airQualityImpact.dispersionIndex * 10}%` }}
                        />
                      </div>
                      <span className={`font-bold ${getDispersionColor(current.airQualityImpact.dispersionIndex)}`}>
                        {current.airQualityImpact.dispersionIndex}/10
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Rizik inverzije</span>
                    <Badge className={getRiskBadge(current.airQualityImpact.inversionRisk)}>
                      {current.airQualityImpact.inversionRisk === 'low' ? 'Nizak' : 
                       current.airQualityImpact.inversionRisk === 'moderate' ? 'Umjeren' : 'Visok'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Potencijal smoga</span>
                    <Badge className={getRiskBadge(current.airQualityImpact.smogPotential)}>
                      {current.airQualityImpact.smogPotential === 'low' ? 'Nizak' : 
                       current.airQualityImpact.smogPotential === 'moderate' ? 'Umjeren' : 'Visok'}
                    </Badge>
                  </div>

                  <div className="p-3 rounded-lg bg-muted/50">
                    <p className="text-sm">{current.airQualityImpact.recommendation}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Weather Alerts */}
        {data.alerts.length > 0 && (
          <div className="mt-4 space-y-2">
            {data.alerts.map((alert) => (
              <div 
                key={alert.id}
                className={`p-3 rounded-lg border ${
                  alert.severity === 'extreme' ? 'bg-red-500/10 border-red-500' :
                  alert.severity === 'severe' ? 'bg-orange-500/10 border-orange-500' :
                  alert.severity === 'moderate' ? 'bg-yellow-500/10 border-yellow-500' :
                  'bg-blue-500/10 border-blue-500'
                }`}
              >
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`h-5 w-5 ${
                    alert.severity === 'extreme' ? 'text-red-500' :
                    alert.severity === 'severe' ? 'text-orange-500' :
                    alert.severity === 'moderate' ? 'text-yellow-500' :
                    'text-blue-500'
                  }`} />
                  <span className="font-semibold">{alert.event}</span>
                </div>
                <p className="text-sm mt-1">{alert.headline}</p>
              </div>
            ))}
          </div>
        )}

        {/* Metadata */}
        <div className="mt-4 pt-4 border-t text-xs text-muted-foreground flex items-center justify-between">
          <span>Izvor: {data.metadata.source}</span>
          <span>Ažurirano: {new Date(data.metadata.lastUpdated).toLocaleString('hr')}</span>
        </div>
      </CardContent>
    </Card>
  );
}

// Detail card component
function DetailCard({ 
  icon, 
  label, 
  value, 
  subValue 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  subValue?: string;
}) {
  return (
    <div className="p-3 rounded-lg bg-muted/50">
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <div className="font-semibold">{value}</div>
      {subValue && <div className="text-xs text-muted-foreground">{subValue}</div>}
    </div>
  );
}

// Multi-city weather comparison
interface WeatherComparisonProps {
  cities: ComprehensiveWeatherData[];
}

export function WeatherComparison({ cities }: WeatherComparisonProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Usporedba vremena - Balkanske prijestolnice
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Grad</th>
                <th className="p-2">Temp</th>
                <th className="p-2">Vlažnost</th>
                <th className="p-2">Vjetar</th>
                <th className="p-2">UV</th>
                <th className="p-2">Padavine</th>
                <th className="p-2">Opis</th>
              </tr>
            </thead>
            <tbody>
              {cities.map((city) => (
                <tr key={city.location.city} className="border-b hover:bg-muted/50">
                  <td className="p-2 font-medium">{city.location.city}</td>
                  <td className="p-2 text-center">
                    <span className="font-semibold">{city.current.temperature}°</span>
                  </td>
                  <td className="p-2 text-center">{city.current.humidity}%</td>
                  <td className="p-2 text-center">{city.current.wind.speed} m/s</td>
                  <td className="p-2 text-center">{city.current.uvIndex}</td>
                  <td className="p-2 text-center">{city.current.precipitation.probability}%</td>
                  <td className="p-2">
                    <div className="flex items-center gap-1">
                      <WeatherIcon icon={city.current.icon} size={24} />
                      <span className="capitalize text-xs">{city.current.description}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
