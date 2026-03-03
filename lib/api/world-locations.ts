/**
 * World Locations - Featured Cities Worldwide
 * Replaces Balkan-specific city list with global coverage
 */

export interface City {
    name: string;
    lat: number;
    lon: number;
    country: string;
    countryCode: string;
    region?: string;
    population?: number;
}

export interface Country {
    code: string;
    name: string;
    nameEn: string;
    cities: Array<{
        name: string;
        lat: number;
        lon: number;
        population?: number;
    }>;
    bbox?: {
        latMin: number;
        latMax: number;
        lonMin: number;
        lonMax: number;
    };
}

/**
 * Featured cities from around the world
 * Organized by region for better UX
 */
export const WORLD_LOCATIONS: Record<string, Country> = {
    // EUROPE - Western
    GB: {
        code: 'GB',
        name: 'Ujedinjeno Kraljevstvo',
        nameEn: 'United Kingdom',
        cities: [
            { name: 'London', lat: 51.5074, lon: -0.1278, population: 9000000 },
            { name: 'Manchester', lat: 53.4808, lon: -2.2426, population: 2700000 },
            { name: 'Birmingham', lat: 52.4862, lon: -1.8904, population: 1140000 },
            { name: 'Edinburgh', lat: 55.9533, lon: -3.1883, population: 530000 },
        ],
    },
    FR: {
        code: 'FR',
        name: 'Francuska',
        nameEn: 'France',
        cities: [
            { name: 'Paris', lat: 48.8566, lon: 2.3522, population: 11000000 },
            { name: 'Marseille', lat: 43.2965, lon: 5.3698, population: 1600000 },
            { name: 'Lyon', lat: 45.7640, lon: 4.8357, population: 1400000 },
            { name: 'Nice', lat: 43.7102, lon: 7.2620, population: 340000 },
        ],
    },
    DE: {
        code: 'DE',
        name: 'Nemačka',
        nameEn: 'Germany',
        cities: [
            { name: 'Berlin', lat: 52.5200, lon: 13.4050, population: 3700000 },
            { name: 'München', lat: 48.1351, lon: 11.5820, population: 1500000 },
            { name: 'Hamburg', lat: 53.5511, lon: 9.9937, population: 1800000 },
            { name: 'Frankfurt', lat: 50.1109, lon: 8.6821, population: 750000 },
            { name: 'Köln', lat: 50.9375, lon: 6.9603, population: 1100000 },
        ],
    },
    ES: {
        code: 'ES',
        name: 'Španija',
        nameEn: 'Spain',
        cities: [
            { name: 'Madrid', lat: 40.4168, lon: -3.7038, population: 6600000 },
            { name: 'Barcelona', lat: 41.3851, lon: 2.1734, population: 5500000 },
            { name: 'Valencia', lat: 39.4699, lon: -0.3763, population: 800000 },
            { name: 'Sevilla', lat: 37.3891, lon: -5.9845, population: 690000 },
        ],
    },
    IT: {
        code: 'IT',
        name: 'Italija',
        nameEn: 'Italy',
        cities: [
            { name: 'Roma', lat: 41.9028, lon: 12.4964, population: 4300000 },
            { name: 'Milano', lat: 45.4642, lon: 9.1900, population: 3200000 },
            { name: 'Napoli', lat: 40.8518, lon: 14.2681, population: 960000 },
            { name: 'Torino', lat: 45.0703, lon: 7.6869, population: 870000 },
        ],
    },

    // EUROPE - Central & Eastern  
    RS: {
        code: 'RS',
        name: 'Srbija',
        nameEn: 'Serbia',
        cities: [
            { name: 'Beograd', lat: 44.7872, lon: 20.4573, population: 1400000 },
            { name: 'Novi Sad', lat: 45.2671, lon: 19.8335, population: 280000 },
            { name: 'Niš', lat: 43.3209, lon: 21.8957, population: 260000 },
        ],
    },
    HR: {
        code: 'HR',
        name: 'Hrvatska',
        nameEn: 'Croatia',
        cities: [
            { name: 'Zagreb', lat: 45.8150, lon: 15.9819, population: 800000 },
            { name: 'Split', lat: 43.5081, lon: 16.4402, population: 180000 },
        ],
    },
    PL: {
        code: 'PL',
        name: 'Poljska',
        nameEn: 'Poland',
        cities: [
            { name: 'Warszawa', lat: 52.2297, lon: 21.0122, population: 1800000 },
            { name: 'Kraków', lat: 50.0647, lon: 19.9450, population: 780000 },
            { name: 'Wrocław', lat: 51.1079, lon: 17.0385, population: 640000 },
        ],
    },

    // NORTH AMERICA
    US: {
        code: 'US',
        name: 'Sjedinjene Američke Države',
        nameEn: 'United States',
        cities: [
            { name: 'New York', lat: 40.7128, lon: -74.0060, population: 8300000 },
            { name: 'Los Angeles', lat: 34.0522, lon: -118.2437, population: 4000000 },
            { name: 'Chicago', lat: 41.8781, lon: -87.6298, population: 2700000 },
            { name: 'San Francisco', lat: 37.7749, lon: -122.4194, population: 880000 },
            { name: 'Seattle', lat: 47.6062, lon: -122.3321, population: 740000 },
            { name: 'Miami', lat: 25.7617, lon: -80.1918, population: 470000 },
            { name: 'Boston', lat: 42.3601, lon: -71.0589, population: 690000 },
        ],
    },
    CA: {
        code: 'CA',
        name: 'Kanada',
        nameEn: 'Canada',
        cities: [
            { name: 'Toronto', lat: 43.6532, lon: -79.3832, population: 2900000 },
            { name: 'Vancouver', lat: 49.2827, lon: -123.1207, population: 680000 },
            { name: 'Montreal', lat: 45.5017, lon: -73.5673, population: 1800000 },
        ],
    },

    // ASIA
    CN: {
        code: 'CN',
        name: 'Kina',
        nameEn: 'China',
        cities: [
            { name: 'Beijing', lat: 39.9042, lon: 116.4074, population: 21500000 },
            { name: 'Shanghai', lat: 31.2304, lon: 121.4737, population: 27000000 },
            { name: 'Guangzhou', lat: 23.1291, lon: 113.2644, population: 15000000 },
            { name: 'Shenzhen', lat: 22.5431, lon: 114.0579, population: 12500000 },
        ],
    },
    JP: {
        code: 'JP',
        name: 'Japan',
        nameEn: 'Japan',
        cities: [
            { name: 'Tokyo', lat: 35.6762, lon: 139.6503, population: 37400000 },
            { name: 'Osaka', lat: 34.6937, lon: 135.5023, population: 19300000 },
            { name: 'Kyoto', lat: 35.0116, lon: 135.7681, population: 1470000 },
        ],
    },
    IN: {
        code: 'IN',
        name: 'Indija',
        nameEn: 'India',
        cities: [
            { name: 'Delhi', lat: 28.7041, lon: 77.1025, population: 30000000 },
            { name: 'Mumbai', lat: 19.0760, lon: 72.8777, population: 20400000 },
            { name: 'Bangalore', lat: 12.9716, lon: 77.5946, population: 12300000 },
            { name: 'Chennai', lat: 13.0827, lon: 80.2707, population: 10700000 },
        ],
    },
    KR: {
        code: 'KR',
        name: 'Južna Koreja',
        nameEn: 'South Korea',
        cities: [
            { name: 'Seoul', lat: 37.5665, lon: 126.9780, population: 25600000 },
            { name: 'Busan', lat: 35.1796, lon: 129.0756, population: 3400000 },
        ],
    },

    // OCEANIA
    AU: {
        code: 'AU',
        name: 'Australija',
        nameEn: 'Australia',
        cities: [
            { name: 'Sydney', lat: -33.8688, lon: 151.2093, population: 5300000 },
            { name: 'Melbourne', lat: -37.8136, lon: 144.9631, population: 5100000 },
            { name: 'Brisbane', lat: -27.4698, lon: 153.0251, population: 2500000 },
        ],
    },
    NZ: {
        code: 'NZ',
        name: 'Novi Zeland',
        nameEn: 'New Zealand',
        cities: [
            { name: 'Auckland', lat: -36.8485, lon: 174.7633, population: 1700000 },
            { name: 'Wellington', lat: -41.2865, lon: 174.7762, population: 420000 },
        ],
    },

    // MIDDLE EAST
    AE: {
        code: 'AE',
        name: 'Ujedinjeni Arapski Emirati',
        nameEn: 'United Arab Emirates',
        cities: [
            { name: 'Dubai', lat: 25.2048, lon: 55.2708, population: 3400000 },
            { name: 'Abu Dhabi', lat: 24.4539, lon: 54.3773, population: 1500000 },
        ],
    },

    // SOUTH AMERICA
    BR: {
        code: 'BR',
        name: 'Brazil',
        nameEn: 'Brazil',
        cities: [
            { name: 'São Paulo', lat: -23.5505, lon: -46.6333, population: 22000000 },
            { name: 'Rio de Janeiro', lat: -22.9068, lon: -43.1729, population: 13000000 },
            { name: 'Brasília', lat: -15.8267, lon: -47.9218, population: 4700000 },
        ],
    },

    // AFRICA
    ZA: {
        code: 'ZA',
        name: 'Južna Afrika',
        nameEn: 'South Africa',
        cities: [
            { name: 'Johannesburg', lat: -26.2041, lon: 28.0473, population: 5700000 },
            { name: 'Cape Town', lat: -33.9249, lon: 18.4241, population: 4600000 },
        ],
    },
    EG: {
        code: 'EG',
        name: 'Egipat',
        nameEn: 'Egypt',
        cities: [
            { name: 'Cairo', lat: 30.0444, lon: 31.2357, population: 20900000 },
            { name: 'Alexandria', lat: 31.2001, lon: 29.9187, population: 5200000 },
        ],
    },
};

/**
 * Get all cities from all countries
 */
export function getAllWorldCities(): City[] {
    const cities: City[] = [];

    for (const [code, country] of Object.entries(WORLD_LOCATIONS)) {
        for (const city of country.cities) {
            cities.push({
                ...city,
                country: country.name,
                countryCode: code,
            });
        }
    }

    return cities;
}

/**
 * Get cities by country code
 */
export function getCitiesByCountry(countryCode: string): City[] {
    const country = WORLD_LOCATIONS[countryCode];
    if (!country) return [];

    return country.cities.map(city => ({
        ...city,
        country: country.name,
        countryCode,
    }));
}

/**
 * Search cities by name (case-insensitive)
 */
export function searchCities(query: string, limit: number = 10): City[] {
    const allCities = getAllWorldCities();
    const searchTerm = query.toLowerCase();

    return allCities
        .filter(city =>
            city.name.toLowerCase().includes(searchTerm) ||
            city.country.toLowerCase().includes(searchTerm)
        )
        .slice(0, limit);
}

/**
 * Get featured/popular cities (sorted by population)
 */
export function getFeaturedCities(limit: number = 20): City[] {
    const allCities = getAllWorldCities();

    return allCities
        .filter(city => city.population && city.population > 500000)
        .sort((a, b) => (b.population || 0) - (a.population || 0))
        .slice(0, limit);
}

/**
 * Get nearest city to coordinates
 */
export function getNearestCity(lat: number, lon: number): City | null {
    const allCities = getAllWorldCities();

    let nearest: City | null = null;
    let minDistance = Infinity;

    for (const city of allCities) {
        const distance = getDistance(lat, lon, city.lat, city.lon);
        if (distance < minDistance) {
            minDistance = distance;
            nearest = city;
        }
    }

    return nearest;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in kilometers
 */
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
}
