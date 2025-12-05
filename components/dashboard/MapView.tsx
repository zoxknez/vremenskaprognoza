'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AirQualityMap } from '@/components/map/AirQualityMap';
import { AirQualityData } from '@/lib/types/air-quality';

export function MapView({ data }: { data: AirQualityData[] }) {
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const router = useRouter();

  return (
    <div className="space-y-4">
      <AirQualityMap 
        data={data} 
        selectedId={selectedId}
        onMarkerClick={(item) => {
          setSelectedId(item.id);
          router.push(`/dashboard/location/${item.id}`);
        }}
      />
    </div>
  );
}

