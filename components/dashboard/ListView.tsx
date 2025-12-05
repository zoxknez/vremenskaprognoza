'use client';

import { useRouter } from 'next/navigation';
import { StationList } from '@/components/air-quality/StationList';
import { AirQualityData } from '@/lib/types/air-quality';

export function ListView({ data }: { data: AirQualityData[] }) {
  const router = useRouter();

  return (
    <StationList 
      data={data} 
      onSelect={(item) => {
        router.push(`/dashboard/location/${item.id}`);
      }}
    />
  );
}

