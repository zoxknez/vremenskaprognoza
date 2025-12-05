import { Suspense } from 'react';
import { AirQualityMap } from '@/components/map/AirQualityMap';
import { StationList } from '@/components/air-quality/StationList';
import { AirQualityAlerts } from '@/components/notifications/AirQualityAlerts';
import { Card, CardContent } from '@/components/ui/card';
import { fetchAllAirQualityData } from '@/lib/api/aggregate';
import { AirQualityData } from '@/lib/types/air-quality';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapView } from '@/components/dashboard/MapView';
import { ListView } from '@/components/dashboard/ListView';

async function getData(): Promise<AirQualityData[]> {
  return await fetchAllAirQualityData();
}

export default async function DashboardPage() {
  const data = await getData();

  if (data.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold mb-2">Nema dostupnih podataka</h2>
              <p className="text-muted-foreground mb-4">
                Trenutno nema podataka sa mernih stanica. Pokušajte ponovo kasnije.
              </p>
              <p className="text-sm text-muted-foreground">
                Aplikacija pokušava da dohvati podatke sa Sensor Community, OpenAQ i drugih izvora.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AirQualityAlerts data={data} />
      
      <Tabs defaultValue="map" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="map">Mapa</TabsTrigger>
          <TabsTrigger value="list">Lista</TabsTrigger>
        </TabsList>
        <TabsContent value="map">
          <Suspense fallback={<div>Učitavanje mape...</div>}>
            <MapView data={data} />
          </Suspense>
        </TabsContent>
        <TabsContent value="list">
          <Suspense fallback={<div>Učitavanje liste...</div>}>
            <ListView data={data} />
          </Suspense>
        </TabsContent>
      </Tabs>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{data.length}</div>
              <div className="text-sm text-muted-foreground">Aktivnih stanica</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {Math.round(data.reduce((acc, item) => acc + item.aqi, 0) / data.length) || 0}
              </div>
              <div className="text-sm text-muted-foreground">Prosečan AQI</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {new Set(data.map((item) => item.source)).size}
              </div>
              <div className="text-sm text-muted-foreground">Izvora podataka</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

