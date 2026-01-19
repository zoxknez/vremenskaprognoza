/**
 * Poznate merne stanice za kvalitet vazduha
 * Koristi se za validaciju da li AQI podaci dolaze sa pravih mernih stanica
 * ili su interpolirani od strane OpenWeather/drugih API-ja
 */

export interface MeasurementStation {
    name: string;
    lat: number;
    lon: number;
    country: string;
    source?: 'sepa' | 'openaq' | 'sensor-community' | 'waqi';
}

// Srbija - SEPA i druge merne stanice
export const SERBIA_STATIONS: MeasurementStation[] = [
    { name: 'Beograd', lat: 44.8176, lon: 20.4633, country: 'RS', source: 'sepa' },
    { name: 'Novi Sad', lat: 45.2671, lon: 19.8335, country: 'RS', source: 'sepa' },
    { name: 'Niš', lat: 43.3209, lon: 21.8957, country: 'RS', source: 'sepa' },
    { name: 'Kragujevac', lat: 44.0128, lon: 20.9164, country: 'RS', source: 'sepa' },
    { name: 'Subotica', lat: 46.1000, lon: 19.6667, country: 'RS', source: 'sepa' },
    { name: 'Smederevo', lat: 44.6628, lon: 20.9269, country: 'RS', source: 'sepa' },
    { name: 'Pančevo', lat: 44.8738, lon: 20.6517, country: 'RS', source: 'sepa' },
    { name: 'Užice', lat: 43.8586, lon: 19.8425, country: 'RS', source: 'sepa' },
    { name: 'Valjevo', lat: 44.2747, lon: 19.8903, country: 'RS', source: 'sepa' },
    { name: 'Kraljevo', lat: 43.7257, lon: 20.6897, country: 'RS', source: 'sepa' },
];

// Sve poznate merne stanice na Balkanu
export const BALKAN_STATIONS: MeasurementStation[] = [
    ...SERBIA_STATIONS,
    // Hrvatska
    { name: 'Zagreb', lat: 45.8150, lon: 15.9819, country: 'HR' },
    { name: 'Split', lat: 43.5081, lon: 16.4402, country: 'HR' },
    { name: 'Rijeka', lat: 45.3271, lon: 14.4422, country: 'HR' },
    // Slovenija
    { name: 'Ljubljana', lat: 46.0569, lon: 14.5058, country: 'SI' },
    { name: 'Maribor', lat: 46.5547, lon: 15.6459, country: 'SI' },
    // Bosna i Hercegovina
    { name: 'Sarajevo', lat: 43.8563, lon: 18.4131, country: 'BA' },
    { name: 'Banja Luka', lat: 44.7722, lon: 17.1910, country: 'BA' },
    // Crna Gora
    { name: 'Podgorica', lat: 42.4304, lon: 19.2594, country: 'ME' },
    // Severna Makedonija
    { name: 'Skoplje', lat: 41.9981, lon: 21.4254, country: 'MK' },
    // Albanija
    { name: 'Tirana', lat: 41.3275, lon: 19.8187, country: 'AL' },
    // Kosovo
    { name: 'Priština', lat: 42.6629, lon: 21.1655, country: 'XK' },
];

// Sve stanice za brzu pretragu
export const ALL_STATIONS = BALKAN_STATIONS;

/**
 * Pronađi najbližu mernu stanicu
 */
export function findNearestStation(
    lat: number,
    lon: number,
    stations: MeasurementStation[] = ALL_STATIONS
): { station: MeasurementStation; distance: number } | null {
    if (stations.length === 0) return null;

    let nearest: MeasurementStation | null = null;
    let minDistance = Infinity;

    for (const station of stations) {
        const distance = calculateHaversineDistance(lat, lon, station.lat, station.lon);
        if (distance < minDistance) {
            minDistance = distance;
            nearest = station;
        }
    }

    return nearest ? { station: nearest, distance: minDistance } : null;
}

/**
 * Haversine formula za izračunavanje udaljenosti u km
 */
function calculateHaversineDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
): number {
    const R = 6371; // Radius Zemlje u km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function toRad(deg: number): number {
    return deg * (Math.PI / 180);
}

// Maksimalna udaljenost za validne AQI podatke (u km)
export const MAX_STATION_DISTANCE_KM = 5;

/**
 * Proveri da li lokacija ima pouzdane AQI podatke
 */
export function hasReliableAQIData(lat: number, lon: number): boolean {
    const result = findNearestStation(lat, lon);
    if (!result) return false;
    return result.distance <= MAX_STATION_DISTANCE_KM;
}
