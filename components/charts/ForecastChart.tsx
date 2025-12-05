'use client';

import { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ForecastData } from '@/lib/api/forecast';
import { AQI_COLORS } from '@/lib/types/air-quality';
import { TrendingUp, TrendingDown, Minus, Calendar, Clock } from 'lucide-react';

interface ForecastChartProps {
  hourlyData: ForecastData[];
  dailyData?: Array<{
    date: string;
    avgAqi: number;
    maxAqi: number;
    minAqi: number;
    aqiCategory: string;
  }>;
}

export function ForecastChart({ hourlyData, dailyData }: ForecastChartProps) {
  const chartData = useMemo(() => {
    return hourlyData.map((item) => ({
      time: new Date(item.timestamp).toLocaleTimeString('sr-RS', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      date: new Date(item.timestamp).toLocaleDateString('sr-RS', {
        weekday: 'short',
        day: 'numeric',
      }),
      aqi: item.aqi,
      pm25: item.parameters.pm25,
      pm10: item.parameters.pm10,
      category: item.aqiCategory,
    }));
  }, [hourlyData]);

  const trend = useMemo(() => {
    if (chartData.length < 2) return 'stable';
    const first = chartData[0].aqi;
    const last = chartData[Math.min(23, chartData.length - 1)].aqi;
    const diff = last - first;
    if (diff > 10) return 'increasing';
    if (diff < -10) return 'decreasing';
    return 'stable';
  }, [chartData]);

  const getGradientColor = (aqi: number) => {
    if (aqi <= 50) return '#22c55e';
    if (aqi <= 100) return '#eab308';
    if (aqi <= 150) return '#f97316';
    if (aqi <= 200) return '#ef4444';
    return '#a855f7';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Prognoza kvaliteta vazduha (48h)
          </CardTitle>
          <Badge variant={trend === 'increasing' ? 'destructive' : trend === 'decreasing' ? 'default' : 'secondary'}>
            {trend === 'increasing' && <TrendingUp className="h-3 w-3 mr-1" />}
            {trend === 'decreasing' && <TrendingDown className="h-3 w-3 mr-1" />}
            {trend === 'stable' && <Minus className="h-3 w-3 mr-1" />}
            {trend === 'increasing' ? 'Raste' : trend === 'decreasing' ? 'Opada' : 'Stabilan'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorAqi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, 'dataMax + 20']}
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-background border rounded-lg shadow-lg p-3">
                      <p className="font-semibold">{data.date} {data.time}</p>
                      <p className="text-2xl font-bold" style={{ color: getGradientColor(data.aqi) }}>
                        AQI: {data.aqi}
                      </p>
                      {data.pm25 && <p className="text-sm">PM2.5: {data.pm25.toFixed(1)} µg/m³</p>}
                      {data.pm10 && <p className="text-sm">PM10: {data.pm10.toFixed(1)} µg/m³</p>}
                    </div>
                  );
                }
                return null;
              }}
            />
            {/* Reference lines for AQI categories */}
            <ReferenceLine y={50} stroke="#22c55e" strokeDasharray="3 3" />
            <ReferenceLine y={100} stroke="#eab308" strokeDasharray="3 3" />
            <ReferenceLine y={150} stroke="#f97316" strokeDasharray="3 3" />
            <Area
              type="monotone"
              dataKey="aqi"
              stroke="#8884d8"
              fillOpacity={1}
              fill="url(#colorAqi)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* AQI Legend */}
        <div className="flex flex-wrap gap-4 mt-4 justify-center">
          <div className="flex items-center gap-1 text-xs">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span>Dobar (0-50)</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="w-3 h-3 rounded bg-yellow-500" />
            <span>Umeren (51-100)</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="w-3 h-3 rounded bg-orange-500" />
            <span>Nezdrav (101-150)</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span>Vrlo nezdrav (151-200)</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="w-3 h-3 rounded bg-purple-500" />
            <span>Opasan (200+)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Daily forecast cards
interface DailyForecastProps {
  data: Array<{
    date: string;
    avgAqi: number;
    maxAqi: number;
    minAqi: number;
    aqiCategory: string;
  }>;
}

export function DailyForecast({ data }: DailyForecastProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Dnevna prognoza
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {data.map((day, index) => {
            const colors = AQI_COLORS[day.aqiCategory as keyof typeof AQI_COLORS] || AQI_COLORS.moderate;
            const date = new Date(day.date);
            
            return (
              <div
                key={day.date}
                className={`p-4 rounded-lg border ${colors.bg} ${colors.border}`}
              >
                <div className="text-sm font-medium">
                  {index === 0
                    ? 'Danas'
                    : index === 1
                    ? 'Sutra'
                    : date.toLocaleDateString('sr-RS', { weekday: 'short' })}
                </div>
                <div className="text-xs text-muted-foreground">
                  {date.toLocaleDateString('sr-RS', { day: 'numeric', month: 'short' })}
                </div>
                <div className={`text-2xl font-bold mt-2 ${colors.text}`}>
                  {day.avgAqi}
                </div>
                <div className="text-xs text-muted-foreground">
                  {day.minAqi} - {day.maxAqi}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
