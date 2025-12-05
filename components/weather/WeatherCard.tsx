'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Cloud, 
  Wind, 
  Droplets, 
  Thermometer, 
  Eye, 
  Gauge, 
  ArrowUp,
  AlertTriangle,
  Sun,
  CloudRain
} from 'lucide-react';

interface WeatherData {
  location: {
    name: string;
    city: string;
    coordinates: [number, number];
  };
  weather: {
    temperature: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    windDirection: number;
    windDirectionText: string;
    clouds: number;
    visibility: number;
    description: string;
    icon: string;
  };
  impact: {
    dispersion: 'good' | 'moderate' | 'poor';
    reason: string;
    pollutionRisk: 'low' | 'medium' | 'high';
  };
  timestamp: string;
}

interface WeatherCardProps {
  data: WeatherData;
}

export function WeatherCard({ data }: WeatherCardProps) {
  const { weather, impact, location } = data;

  const getDispersionColor = (dispersion: string) => {
    switch (dispersion) {
      case 'good': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'moderate': return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'poor': return 'bg-red-500/10 text-red-600 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-600 border-gray-500/20';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const dispersionLabels = {
    good: 'Dobro raspršivanje',
    moderate: 'Umjereno raspršivanje',
    poor: 'Slabo raspršivanje'
  };

  const riskLabels = {
    low: 'Nizak',
    medium: 'Srednji',
    high: 'Visok'
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            <span>{location.city}</span>
          </div>
          <img 
            src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
            alt={weather.description}
            className="h-12 w-12"
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Temperature and description */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Thermometer className="h-8 w-8 text-orange-500" />
            <span className="text-3xl font-bold">{weather.temperature}°C</span>
          </div>
          <span className="text-muted-foreground capitalize">{weather.description}</span>
        </div>

        {/* Weather details grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <Wind className="h-4 w-4 text-blue-500" />
            <div>
              <div className="text-sm font-medium">{weather.windSpeed} m/s</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <ArrowUp 
                  className="h-3 w-3" 
                  style={{ transform: `rotate(${weather.windDirection}deg)` }}
                />
                {weather.windDirectionText}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <Droplets className="h-4 w-4 text-cyan-500" />
            <div>
              <div className="text-sm font-medium">{weather.humidity}%</div>
              <div className="text-xs text-muted-foreground">Vlažnost</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <Gauge className="h-4 w-4 text-purple-500" />
            <div>
              <div className="text-sm font-medium">{weather.pressure} hPa</div>
              <div className="text-xs text-muted-foreground">Pritisak</div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
            <Eye className="h-4 w-4 text-gray-500" />
            <div>
              <div className="text-sm font-medium">{(weather.visibility / 1000).toFixed(1)} km</div>
              <div className="text-xs text-muted-foreground">Vidljivost</div>
            </div>
          </div>
        </div>

        {/* Impact on air quality */}
        <div className={`p-3 rounded-lg border ${getDispersionColor(impact.dispersion)}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">{dispersionLabels[impact.dispersion]}</span>
            <Badge className={getRiskColor(impact.pollutionRisk)}>
              Rizik: {riskLabels[impact.pollutionRisk]}
            </Badge>
          </div>
          <p className="text-sm">{impact.reason}</p>
        </div>

        {/* Alert if high risk */}
        {impact.pollutionRisk === 'high' && (
          <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">
              Trenutni meteorološki uvjeti pogoduju nakupljanju zagađenja. 
              Preporučuje se ograničenje aktivnosti na otvorenom.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Multi-city weather overview
interface WeatherOverviewProps {
  cities: WeatherData[];
}

export function WeatherOverview({ cities }: WeatherOverviewProps) {
  const highRiskCities = cities.filter(c => c.impact.pollutionRisk === 'high');
  const avgTemperature = cities.reduce((acc, c) => acc + c.weather.temperature, 0) / cities.length;
  const avgWindSpeed = cities.reduce((acc, c) => acc + c.weather.windSpeed, 0) / cities.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sun className="h-5 w-5" />
          Pregled vremena - Balkan
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold">{avgTemperature.toFixed(1)}°C</div>
            <div className="text-sm text-muted-foreground">Prosj. temperatura</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold">{avgWindSpeed.toFixed(1)} m/s</div>
            <div className="text-sm text-muted-foreground">Prosj. vjetar</div>
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="text-2xl font-bold text-red-500">{highRiskCities.length}</div>
            <div className="text-sm text-muted-foreground">Visok rizik</div>
          </div>
        </div>

        {/* High risk cities alert */}
        {highRiskCities.length > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="font-medium text-red-600">Gradovi sa povećanim rizikom zagađenja</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {highRiskCities.map(city => (
                <Badge key={city.location.city} variant="destructive">
                  {city.location.city}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* City list */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {cities.map((city) => (
            <div 
              key={city.location.city}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50"
            >
              <div className="flex items-center gap-3">
                <img 
                  src={`https://openweathermap.org/img/wn/${city.weather.icon}.png`}
                  alt=""
                  className="h-8 w-8"
                />
                <div>
                  <div className="font-medium">{city.location.city}</div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {city.weather.description}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span>{city.weather.temperature}°C</span>
                <span className="text-muted-foreground">{city.weather.windSpeed} m/s</span>
                <div className={`w-3 h-3 rounded-full ${
                  city.impact.pollutionRisk === 'high' ? 'bg-red-500' :
                  city.impact.pollutionRisk === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Hook to fetch weather data
export function useWeather(city?: string) {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchWeather() {
      try {
        setLoading(true);
        const endpoint = city 
          ? `/api/weather?city=${encodeURIComponent(city)}`
          : '/api/weather';
        
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error('Failed to fetch weather');
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
    
    // Refresh every 10 minutes
    const interval = setInterval(fetchWeather, 600000);
    return () => clearInterval(interval);
  }, [city]);

  return { data, loading, error };
}
