'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HistoricalData } from '@/lib/types/air-quality';

interface AirQualityChartProps {
  data: HistoricalData[];
  parameter?: 'pm25' | 'pm10' | 'no2' | 'o3';
}

export function AirQualityChart({ data, parameter = 'pm25' }: AirQualityChartProps) {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      time: new Date(item.timestamp).toLocaleTimeString('sr-RS', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      value: item.parameters[parameter],
      aqi: item.aqi,
    }));
  }, [data, parameter]);

  const parameterLabels: Record<string, string> = {
    pm25: 'PM2.5 (µg/m³)',
    pm10: 'PM10 (µg/m³)',
    no2: 'NO₂ (µg/m³)',
    o3: 'O₃ (µg/m³)',
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{parameterLabels[parameter] || parameter}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
            <XAxis dataKey="time" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#06b6d4"
              name={parameterLabels[parameter]}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="aqi"
              stroke="#f97316"
              name="AQI"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

