import { NextRequest, NextResponse } from 'next/server';
import { fetchAllAirQualityData } from '@/lib/api/aggregate';
import { 
  calculateAirQualityStats, 
  getWorstCities, 
  getBestCities, 
  groupByCountry,
  getCityRankings 
} from '@/lib/api/air-quality-stats';
import { cityRankingCache } from '@/lib/api/city-ranking-cache';
import { enforceRateLimit, requireSameOrigin } from '@/lib/utils/request-security';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Cache for 5 minutes

export async function GET(request: NextRequest) {
  const sameOriginError = requireSameOrigin(request);
  if (sameOriginError) {
    return sameOriginError;
  }

  const rateLimitError = await enforceRateLimit(request, {
    prefix: 'api:air-quality-stats',
    limit: 60,
    windowMs: 60 * 1000,
  });
  if (rateLimitError) {
    return rateLimitError;
  }

  try {
    // Check if client wants fresh data
    const { searchParams } = new URL(request.url);
    const forceFresh = searchParams.get('fresh') === 'true';
    
    // Try to get from cache first
    const cacheKey = 'city-rankings';
    if (!forceFresh) {
      const cached = cityRankingCache.get(cacheKey);
      if (cached) {
        const sortedByBest = [...cached].sort((a, b) => a.aqi - b.aqi);
        const sortedByWorst = [...cached].sort((a, b) => b.aqi - a.aqi);
        const totalStations = cached.reduce((sum, city) => sum + city.stationCount, 0);
        const countries = new Set(cached.map(city => city.country));

        return NextResponse.json({
          stats: {
            totalStations,
            totalCities: cached.length,
            totalCountries: countries.size,
            citiesWithData: sortedByBest.map(city => city.name),
            countriesWithData: Array.from(countries).sort(),
            sourcesCount: {
              waqi: 0,
              openweather: 0,
              openaq: 0,
              sensorCommunity: 0,
              aqicn: 0,
              airvisual: 0,
              sepa: 0,
              allthingstalk: 0,
            },
            averageAQI: cached.length > 0
              ? Math.round(cached.reduce((sum, city) => sum + city.aqi, 0) / cached.length)
              : 0,
            worstCity: sortedByWorst[0]
              ? {
                name: sortedByWorst[0].name,
                aqi: sortedByWorst[0].aqi,
                country: sortedByWorst[0].country,
              }
              : null,
            bestCity: sortedByBest[0]
              ? {
                name: sortedByBest[0].name,
                aqi: sortedByBest[0].aqi,
                country: sortedByBest[0].country,
              }
              : null,
            lastUpdated: new Date().toISOString(),
          },
          rankings: cached,
          worstCities: sortedByWorst.slice(0, 10),
          bestCities: sortedByBest.slice(0, 10),
          countryStats: Array.from(countries)
            .map(country => {
              const countryCities = cached.filter(city => city.country === country);
              const stationCount = countryCities.reduce((sum, city) => sum + city.stationCount, 0);
              const averageAQI = Math.round(
                countryCities.reduce((sum, city) => sum + city.aqi, 0) / Math.max(countryCities.length, 1)
              );

              return {
                country,
                totalStations: stationCount,
                averageAQI,
                cities: countryCities.length,
              };
            })
            .sort((a, b) => b.totalStations - a.totalStations),
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
