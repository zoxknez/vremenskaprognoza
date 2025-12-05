import { Suspense } from 'react';
import { fetchAllAirQualityData } from '@/lib/api/aggregate';
import { AirQualityData } from '@/lib/types/air-quality';
import { DashboardClient } from '@/components/dashboard/DashboardClient';
import { PageLoader } from '@/components/ui/loading';

async function getData(): Promise<AirQualityData[]> {
  return await fetchAllAirQualityData();
}

export default async function DashboardPage() {
  const data = await getData();

  return (
    <Suspense fallback={<PageLoader message="Učitavanje dashboard-a..." />}>
      <DashboardClient initialData={data} />
    </Suspense>
  );
}

