import { NextResponse } from 'next/server';
import { fetchAllAirQualityData } from '@/lib/api/aggregate';
import { getCityRankings, getWorstCities, getBestCities } from '@/lib/api/air-quality-stats';
import { cityRankingCache } from '@/lib/api/city-ranking-cache';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // Cache for 5 minutes

/**
 * GET /api/air-quality/rankings
 * 
 * Query Parameters:
 * - limit: number (default: 10) - Number of cities to return
 * - type: 'best' | 'worst' | 'all' (default: 'all') - Type of ranking
 * - fresh: boolean (default: false) - Force fresh data, bypass cache
 * 
 * Returns comprehensive city rankings with data quality indicators
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const type = searchParams.get('type') || 'all';
    const forceFresh = searchParams.get('fresh') === 'true';
    
    // Validate limit
    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 100' },
        { status: 400 }
      );
    }

    // Try to get from cache first
    const cacheKey = `rankings-${type}-${limit}`;
    if (!forceFresh) {
      const cached = cityRankingCache.get(cacheKey);
      if (cached) {
        return NextResponse.json({
          rankings: cached,
          count: cached.length,
          type,
          cached: true,
          timestamp: new Date().toISOString(),
        }, {
          headers: {
            'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
            'X-Cache-Status': 'HIT',
          },
        });
      }
    }

    // Fetch fresh data
    const data = await fetchAllAirQualityData();
    
    if (data.length === 0) {
      return NextResponse.json({
        rankings: [],
        count: 0,
        type,
        message: 'Nema dostupnih podataka trenutno',
      }, {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60',
        },
      });
    }

    let rankings;
    
    switch (type) {
      case 'best':
        rankings = getBestCities(data, limit);
        break;
      case 'worst':
        rankings = getWorstCities(data, limit);
        break;
      case 'all':
      default:
        rankings = getCityRankings(data)
          .sort((a, b) => a.aqi - b.aqi) // Sort by AQI ascending (best to worst)
          .slice(0, limit);
        break;
    }

    // Cache the results
    cityRankingCache.set(cacheKey, rankings);

    // Calculate summary statistics
    const summary = {
      total: rankings.length,
      averageAQI: rankings.length > 0 
        ? Math.round(rankings.reduce((sum, c) => sum + c.aqi, 0) / rankings.length * 10) / 10
        : 0,
      excellentQuality: rankings.filter(c => c.dataQuality === 'excellent').length,
      goodQuality: rankings.filter(c => c.dataQuality === 'good').length,
      fairQuality: rankings.filter(c => c.dataQuality === 'fair').length,
      poorQuality: rankings.filter(c => c.dataQuality === 'poor').length,
    };

    return NextResponse.json({
      rankings,
      count: rankings.length,
      type,
      summary,
      cached: false,
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60',
        'X-Cache-Status': 'MISS',
      },
    });
  } catch (error) {
    console.error('Error fetching city rankings:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch city rankings',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
