import { NextResponse } from 'next/server';
import { fetchAllAirQualityData } from '@/lib/api/aggregate';

export async function GET() {
  try {
    const data = await fetchAllAirQualityData();
    
    // Transform to stations format
    const stations = data.map((item) => ({
      id: item.id,
      name: item.location.name,
      city: item.location.city,
      region: item.location.region || 'Serbia',
      coordinates: item.location.coordinates,
      sources: [item.source],
      isActive: true,
      currentAQI: item.aqi,
      lastUpdated: item.lastUpdated || item.timestamp,
    }));
    
    return NextResponse.json(stations, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Error fetching stations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stations' },
      { status: 500 }
    );
  }
}

