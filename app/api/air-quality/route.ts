import { NextResponse } from 'next/server';
import { fetchAllAirQualityData } from '@/lib/api/aggregate';

export async function GET() {
  try {
    const data = await fetchAllAirQualityData();
    
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Error fetching air quality data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch air quality data' },
      { status: 500 }
    );
  }
}

