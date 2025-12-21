/**
 * Example: How to use the improved City Ranking system
 * 
 * This file demonstrates how to use the new city ranking features
 * in your components and API routes.
 */

// ============================================================================
// 1. USING IN REACT COMPONENTS
// ============================================================================

import { useEffect, useState } from 'react';
import { CityRankingData } from '@/lib/api/air-quality-stats';

export function CityRankingExample() {
  const [rankings, setRankings] = useState<CityRankingData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRankings() {
      try {
        const response = await fetch('/api/air-quality/rankings?limit=10&type=all');
        const data = await response.json();
        setRankings(data.rankings);
      } catch (error) {
        console.error('Failed to fetch rankings:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchRankings();
  }, []);

  if (loading) return <div>Učitavanje...</div>;

  return (
    <div>
      <h2>Rangiranje Gradova</h2>
      {rankings.map((city, index) => (
        <div key={city.name} className="city-card">
          <div className="rank">#{index + 1}</div>
          <div className="city-info">
            <h3>{city.name}</h3>
            <span className="country">{city.country}</span>
            
            {/* Data Quality Indicator */}
            <span className={`quality-${city.dataQuality}`}>
              {city.dataQuality === 'excellent' && '●●●'}
              {city.dataQuality === 'good' && '●●○'}
              {city.dataQuality === 'fair' && '●○○'}
              {city.dataQuality === 'poor' && '○○○'}
            </span>
          </div>
          
          <div className="aqi-info">
            <div className="aqi-value">AQI {city.aqi}</div>
            {city.minAQI !== city.maxAQI && (
              <div className="aqi-range">({city.minAQI}-{city.maxAQI})</div>
            )}
            <div className="stations">{city.stationCount} stanica</div>
          </div>
          
          {/* Pollutant Info */}
          {(city.pm25 || city.pm10) && (
            <div className="pollutants">
              {city.pm25 && <span>PM2.5: {city.pm25} µg/m³</span>}
              {city.pm10 && <span>PM10: {city.pm10} µg/m³</span>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// 2. FETCHING SPECIFIC RANKINGS
// ============================================================================

// Get top 5 cleanest cities
export async function getCleanestCities() {
  const response = await fetch('/api/air-quality/rankings?type=best&limit=5');
  const data = await response.json();
  return data.rankings;
}

// Get top 10 most polluted cities
export async function getMostPollutedCities() {
  const response = await fetch('/api/air-quality/rankings?type=worst&limit=10');
  const data = await response.json();
  return data.rankings;
}

// Get all cities (up to 100)
export async function getAllCityRankings() {
  const response = await fetch('/api/air-quality/rankings?type=all&limit=100');
  const data = await response.json();
  return data.rankings;
}

// Force fresh data (bypass cache)
export async function getFreshRankings() {
  const response = await fetch('/api/air-quality/rankings?fresh=true');
  const data = await response.json();
  return data.rankings;
}

// ============================================================================
// 3. USING UTILITY FUNCTIONS DIRECTLY
// ============================================================================

import { 
  getCityRankings, 
  getBestCities, 
  getWorstCities 
} from '@/lib/api/air-quality-stats';
import { AirQualityData } from '@/lib/types/air-quality';

export function processAirQualityData(data: AirQualityData[]) {
  // Get all rankings with full details
  const allRankings = getCityRankings(data);
  
  // Get top 5 cleanest
  const cleanest = getBestCities(data, 5);
  
  // Get top 5 most polluted
  const polluted = getWorstCities(data, 5);
  
  console.log('All Rankings:', allRankings);
  console.log('Cleanest Cities:', cleanest);
  console.log('Most Polluted Cities:', polluted);
  
  return { allRankings, cleanest, polluted };
}

// ============================================================================
// 4. FILTERING AND SORTING
// ============================================================================

export function filterRankingsByQuality(
  rankings: CityRankingData[], 
  minQuality: 'poor' | 'fair' | 'good' | 'excellent'
) {
  const qualityScore = {
    poor: 1,
    fair: 2,
    good: 3,
    excellent: 4,
  };
  
  return rankings.filter(city => 
    qualityScore[city.dataQuality] >= qualityScore[minQuality]
  );
}

export function filterByAQIRange(
  rankings: CityRankingData[],
  minAQI: number,
  maxAQI: number
) {
  return rankings.filter(city => 
    city.aqi >= minAQI && city.aqi <= maxAQI
  );
}

export function sortByStationCount(rankings: CityRankingData[]) {
  return [...rankings].sort((a, b) => b.stationCount - a.stationCount);
}

// ============================================================================
// 5. STATISTICS AND ANALYSIS
// ============================================================================

export function calculateRankingStatistics(rankings: CityRankingData[]) {
  const totalCities = rankings.length;
  const avgAQI = rankings.reduce((sum, c) => sum + c.aqi, 0) / totalCities;
  
  const qualityCounts = {
    excellent: rankings.filter(c => c.dataQuality === 'excellent').length,
    good: rankings.filter(c => c.dataQuality === 'good').length,
    fair: rankings.filter(c => c.dataQuality === 'fair').length,
    poor: rankings.filter(c => c.dataQuality === 'poor').length,
  };
  
  const aqiCategories = {
    good: rankings.filter(c => c.aqi <= 50).length,
    moderate: rankings.filter(c => c.aqi > 50 && c.aqi <= 100).length,
    unhealthySensitive: rankings.filter(c => c.aqi > 100 && c.aqi <= 150).length,
    unhealthy: rankings.filter(c => c.aqi > 150 && c.aqi <= 200).length,
    veryUnhealthy: rankings.filter(c => c.aqi > 200 && c.aqi <= 300).length,
    hazardous: rankings.filter(c => c.aqi > 300).length,
  };
  
  return {
    totalCities,
    averageAQI: Math.round(avgAQI * 10) / 10,
    qualityCounts,
    aqiCategories,
  };
}

// ============================================================================
// 6. CACHING UTILITIES
// ============================================================================

import { cityRankingCache } from '@/lib/api/city-ranking-cache';

// Get cache statistics
export function getCacheStats() {
  return cityRankingCache.getStats();
}

// Clear cache manually
export function clearRankingCache() {
  cityRankingCache.clear();
  console.log('Cache cleared');
}

// Clear only expired entries
export function cleanupCache() {
  cityRankingCache.clearExpired();
  console.log('Expired cache entries cleared');
}

// ============================================================================
// 7. REACT HOOK FOR RANKINGS
// ============================================================================

export function useRankings(type: 'best' | 'worst' | 'all' = 'all', limit = 10) {
  const [rankings, setRankings] = useState<CityRankingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cached, setCached] = useState(false);

  const refresh = async (forceFresh = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const freshParam = forceFresh ? '&fresh=true' : '';
      const response = await fetch(
        `/api/air-quality/rankings?type=${type}&limit=${limit}${freshParam}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch rankings');
      
      const data = await response.json();
      setRankings(data.rankings);
      setCached(data.cached);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, [type, limit]);

  return { rankings, loading, error, cached, refresh };
}

// Usage example:
export function MyComponent() {
  const { rankings, loading, error, cached, refresh } = useRankings('best', 5);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <button onClick={() => refresh(true)}>Refresh Data</button>
      {cached && <span>Data from cache</span>}
      {/* Render rankings */}
    </div>
  );
}

// ============================================================================
// 8. EXPORT FUNCTIONS
// ============================================================================

export function exportRankingsToCSV(rankings: CityRankingData[]): string {
  const headers = [
    'Rank',
    'City',
    'Country',
    'AQI',
    'Min AQI',
    'Max AQI',
    'Stations',
    'PM2.5',
    'PM10',
    'Data Quality',
  ];
  
  const rows = rankings.map((city, index) => [
    index + 1,
    city.name,
    city.country,
    city.aqi,
    city.minAQI,
    city.maxAQI,
    city.stationCount,
    city.pm25 ?? 'N/A',
    city.pm10 ?? 'N/A',
    city.dataQuality,
  ]);
  
  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n');
  
  return csv;
}

export function downloadRankingsCSV(rankings: CityRankingData[], filename = 'rankings.csv') {
  const csv = exportRankingsToCSV(rankings);
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
