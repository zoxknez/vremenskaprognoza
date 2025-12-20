import { NextResponse } from 'next/server';
import { fetchAllAirQualityData } from '@/lib/api/aggregate';
import { calculateAirQualityStats, getWorstCities, getBestCities, groupByCountry } from '@/lib/api/air-quality-stats';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Cache for 5 minutes

export async function GET() {
  try {
    const data = await fetchAllAirQualityData();
    
    if (data.length === 0) {
      return NextResponse.json({
        stats: {
          totalStations: 0,
          totalCities: 0,
          totalCountries: 0,
          message: 'Nema dostupnih podataka trenutno',
        },
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
        },
      });
    }

    const stats = calculateAirQualityStats(data);
    const worstCities = getWorstCities(data, 10);
    const bestCities = getBestCities(data, 10);
    const byCountry = groupByCountry(data);

    // Calculate country stats
    const countryStats = Object.entries(byCountry).map(([country, stations]) => {
      const validStations = stations.filter(s => typeof s.aqi === 'number' && !isNaN(s.aqi));
      const avgAQI = validStations.length > 0
        ? Math.round(validStations.reduce((sum, s) => sum + s.aqi, 0) / validStations.length)
        : 0;

      return {
        country,
        totalStations: stations.length,
        averageAQI: avgAQI,
        cities: new Set(stations.map(s => s.location.city).filter(Boolean)).size,
      };
    }).sort((a, b) => b.totalStations - a.totalStations);

    return NextResponse.json({
      stats,
      worstCities,
      bestCities,
      countryStats,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
      },
    });
  } catch (error) {
    console.error('Error fetching air quality stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch air quality statistics' },
      { status: 500 }
    );
  }
}
