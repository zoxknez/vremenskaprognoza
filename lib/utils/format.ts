export function formatAQI(aqi: number): string {
  return Math.round(aqi).toString();
}

export function formatParameter(value: number | undefined, unit: string = 'µg/m³'): string {
  if (value === undefined || value === null) return 'N/A';
  return `${value.toFixed(1)} ${unit}`;
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('sr-RS', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('sr-RS', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

