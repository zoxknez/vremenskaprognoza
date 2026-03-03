/**
 * Geocoding Service
 * Convert location names to coordinates and vice versa
 */

export interface GeocodeResult {
    name: string;
    displayName: string;
    lat: number;
    lon: number;
    country?: string;
    countryCode?: string;
    type: 'city' | 'address' | 'poi' | 'region';
    importance?: number;
}

/**
 * Geocode a location string to coordinates
 * Uses Nominatim (OpenStreetMap) - free, no API key required
 * 
 * For production, consider Google Geocoding API for better results
 */
export async function geocodeLocation(query: string): Promise<GeocodeResult[]> {
    if (!query || query.trim().length < 2) {
        return [];
    }

    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/search?` +
            `q=${encodeURIComponent(query)}&` +
            `format=json&` +
            `limit=10&` +
            `addressdetails=1`,
            {
                headers: {
                    'User-Agent': 'Air Quality App (contact@example.com)',
                },
                next: { revalidate: 86400 }, // Cache for 24 hours
            }
        );

        if (!response.ok) {
            console.error('Geocoding error:', response.status);
            return [];
        }

        const data = await response.json();

        return data.map((item: any) => ({
            name: item.name || item.display_name.split(',')[0],
            displayName: item.display_name,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            country: item.address?.country,
            countryCode: item.address?.country_code?.toUpperCase(),
            type: determineLocationType(item.type),
            importance: item.importance,
        }));
    } catch (error) {
        console.error('Geocoding error:', error);
        return [];
    }
}

/**
 * Reverse geocode: coordinates to location name
 */
export async function reverseGeocode(lat: number, lon: number): Promise<GeocodeResult | null> {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?` +
            `lat=${lat}&` +
            `lon=${lon}&` +
            `format=json&` +
            `addressdetails=1`,
            {
                headers: {
                    'User-Agent': 'Air Quality App (contact@example.com)',
                },
                next: { revalidate: 86400 },
            }
        );

        if (!response.ok) {
            console.error('Reverse geocoding error:', response.status);
            return null;
        }

        const item = await response.json();

        return {
            name: item.address?.city || item.address?.town || item.address?.village || item.name,
            displayName: item.display_name,
            lat: parseFloat(item.lat),
            lon: parseFloat(item.lon),
            country: item.address?.country,
            countryCode: item.address?.country_code?.toUpperCase(),
            type: determineLocationType(item.type),
            importance: item.importance,
        };
    } catch (error) {
        console.error('Reverse geocoding error:', error);
        return null;
    }
}

/**
 * Autocomplete location search
 */
export async function autocompleteLocation(query: string): Promise<GeocodeResult[]> {
    if (!query || query.trim().length < 2) {
        return [];
    }

    // Use geocoding with limit for autocomplete
    return geocodeLocation(query);
}

/**
 * Determine location type from OSM type
 */
function determineLocationType(osmType: string): 'city' | 'address' | 'poi' | 'region' {
    const cityTypes = ['city', 'town', 'village', 'hamlet', 'municipality'];
    const poiTypes = ['tourism', 'amenity', 'building'];
    const regionTypes = ['state', 'county', 'region', 'province'];

    if (cityTypes.includes(osmType)) return 'city';
    if (poiTypes.includes(osmType)) return 'poi';
    if (regionTypes.includes(osmType)) return 'region';

    return 'address';
}

/**
 * OPTIONAL: Google Geocoding API wrapper
 * Uncomment and use if you want better results with Google API
 */

/*
export async function geocodeLocationGoogle(query: string): Promise<GeocodeResult[]> {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
  
  if (!apiKey) {
    console.warn('Google API key not configured, falling back to Nominatim');
    return geocodeLocation(query);
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?` +
      `address=${encodeURIComponent(query)}&` +
      `key=${apiKey}`,
      {
        next: { revalidate: 86400 },
      }
    );

    if (!response.ok) {
      throw new Error(`Google Geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status !== 'OK') {
      console.warn('Google Geocoding status:', data.status);
      return [];
    }

    return data.results.map((item: any) => {
      const location = item.geometry.location;
      const addressComponents = item.address_components;
      
      const country = addressComponents.find((c: any) => c.types.includes('country'));
      
      return {
        name: item.name || item.formatted_address.split(',')[0],
        displayName: item.formatted_address,
        lat: location.lat,
        lon: location.lng,
        country: country?.long_name,
        countryCode: country?.short_name,
        type: determineGoogleLocationType(item.types),
        importance: 1,
      };
    });
  } catch (error) {
    console.error('Google Geocoding error:', error);
    return geocodeLocation(query); // Fallback to Nominatim
  }
}

function determineGoogleLocationType(types: string[]): 'city' | 'address' | 'poi' | 'region' {
  if (types.includes('locality') || types.includes('administrative_area_level_3')) return 'city';
  if (types.includes('point_of_interest') || types.includes('establishment')) return 'poi';
  if (types.includes('administrative_area_level_1') || types.includes('administrative_area_level_2')) return 'region';
  return 'address';
}
*/
