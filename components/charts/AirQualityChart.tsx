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
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#8884d8"
              name={parameterLabels[parameter]}
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="aqi"
              stroke="#82ca9d"
              name="AQI"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

