import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { fetchAllAirQualityData } from '@/lib/api/aggregate';
import { AirQualityCard } from '@/components/air-quality/AirQualityCard';
import { AirQualityChart } from '@/components/charts/AirQualityChart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HistoricalData } from '@/lib/types/air-quality';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const allData = await fetchAllAirQualityData();
  const stationData = allData.find((item) => item.id === id);

  if (!stationData) {
    return {
      title: 'Lokacija nije pronađena',
    };
  }

  return {
    title: `${stationData.location.name} - Zagadenost Vazduha`,
    description: `Detaljni podaci o kvalitetu vazduha za ${stationData.location.name}, ${stationData.location.city}. AQI: ${stationData.aqi}`,
  };
}

// Mock historical data - in production, fetch from database
function getHistoricalData(id: string): HistoricalData[] {
  const now = new Date();
  const data: HistoricalData[] = [];
  
  for (let i = 23; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    data.push({
      stationId: id,
      timestamp: timestamp.toISOString(),
      parameters: {
        pm25: 20 + Math.random() * 30,
        pm10: 30 + Math.random() * 40,
        no2: 10 + Math.random() * 20,
      },
      aqi: 50 + Math.random() * 100,
    });
  }
  
  return data;
}

export default async function LocationPage({ params }: PageProps) {
  const { id } = await params;
  const stationData = await getStationData(id);

  if (!stationData) {
    notFound();
  }

  const historicalData = getHistoricalData(id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{stationData.location.name}</h1>
        <p className="text-muted-foreground">
          {stationData.location.city}, {stationData.location.region || 'Srbija'}
        </p>
      </div>

      <AirQualityCard data={stationData} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AirQualityChart data={historicalData} parameter="pm25" />
        <AirQualityChart data={historicalData} parameter="pm10" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detaljni parametri</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {stationData.parameters.pm25 && (
              <div>
                <div className="text-sm text-muted-foreground">PM2.5</div>
                <div className="text-2xl font-bold">
                  {stationData.parameters.pm25.toFixed(1)} µg/m³
                </div>
              </div>
            )}
            {stationData.parameters.pm10 && (
              <div>
                <div className="text-sm text-muted-foreground">PM10</div>
                <div className="text-2xl font-bold">
                  {stationData.parameters.pm10.toFixed(1)} µg/m³
                </div>
              </div>
            )}
            {stationData.parameters.no2 && (
              <div>
                <div className="text-sm text-muted-foreground">NO₂</div>
                <div className="text-2xl font-bold">
                  {stationData.parameters.no2.toFixed(1)} µg/m³
                </div>
              </div>
            )}
            {stationData.parameters.o3 && (
              <div>
                <div className="text-sm text-muted-foreground">O₃</div>
                <div className="text-2xl font-bold">
                  {stationData.parameters.o3.toFixed(1)} µg/m³
                </div>
              </div>
            )}
            {stationData.parameters.so2 && (
              <div>
                <div className="text-sm text-muted-foreground">SO₂</div>
                <div className="text-2xl font-bold">
                  {stationData.parameters.so2.toFixed(1)} µg/m³
                </div>
              </div>
            )}
            {stationData.parameters.co && (
              <div>
                <div className="text-sm text-muted-foreground">CO</div>
                <div className="text-2xl font-bold">
                  {stationData.parameters.co.toFixed(1)} µg/m³
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

async function getStationData(id: string) {
  const allData = await fetchAllAirQualityData();
  return allData.find((item) => item.id === id);
}

