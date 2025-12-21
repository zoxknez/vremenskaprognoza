import { NextResponse } from 'next/server';
import { fetchAllAirQualityData } from '@/lib/api/aggregate';
import { 
  calculateAirQualityStats, 
  getWorstCities, 
  getBestCities, 
  groupByCountry,
  getCityRankings 
} from '@/lib/api/air-quality-stats';
import { cityRankingCache } from '@/lib/api/city-ranking-cache';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Cache for 5 minutes

export async function GET(request: Request) {
  try {
    // Check if client wants fresh data
    const { searchParams } = new URL(request.url);
    const forceFresh = searchParams.get('fresh') === 'true';
    
    // Try to get from cache first
    const cacheKey = 'city-rankings';
    if (!forceFresh) {
      const cached = cityRankingCache.get(cacheKey);
      if (cached) {
        return NextResponse.json({
          stats: calculateAirQualityStats([]), // Empty stats for now
          rankings: cached,
          worstCities: cached.slice().reverse().slice(0, 10),
          bestCities: cached.slice(0, 10),
          cached: true,
        }, {
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
          },
        });
      }
    }
    
    const data = await fetchAllAirQualityData();
    
    if (data.length === 0) {
      return NextResponse.json({
        stats: {
          totalStations: 0,
          totalCities: 0,
          totalCountries: 0,
          message: 'Nema dostupnih podataka trenutno',
        },
        rankings: [],
        worstCities: [],
        bestCities: [],
      }, {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
        },
      });
    }

    const stats = calculateAirQualityStats(data);
    const rankings = getCityRankings(data);
    const worstCities = getWorstCities(data, 10);
    const bestCities = getBestCities(data, 10);
    const byCountry = groupByCountry(data);

    // Cache the rankings
    cityRankingCache.set(cacheKey, rankings);

    // Calculate country stats
    const countryStats = Object.entries(byCountry).map(([country, stations]) => {
      const validStations = stations.filter(s => 
        typeof s.aqi === 'number' && 
        !isNaN(s.aqi) && 
        s.aqi > 0 && 
        s.aqi < 500
      );
      const avgAQI = validStations.length > 0
        ? Math.round(validStations.reduce((sum, s) => sum + s.aqi, 0) / validStations.length)
        : 0;

      return {
        country,
        totalStations: validStations.length,
        averageAQI: avgAQI,
        cities: new Set(validStations.map(s => s.location.city).filter(Boolean)).size,
      };
    })
    .filter(stat => stat.totalStations > 0) // Only include countries with valid data
    .sort((a, b) => b.totalStations - a.totalStations);

    return NextResponse.json({
      stats,
      rankings,
      worstCities,
      bestCities,
      countryStats,
      cached: false,
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
