/**
 * Geo Utils - Centralizovane geografske funkcije
 */

/**
 * Haversine formula za izračunavanje udaljenosti između dve tačke u km
 * @param lat1 - Latitude prve tačke
 * @param lon1 - Longitude prve tačke
 * @param lat2 - Latitude druge tačke
 * @param lon2 - Longitude druge tačke
 * @returns Udaljenost u kilometrima
 */
export function calculateDistance(
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

/**
 * Pretvori stepene u radijane
 */
function toRad(deg: number): number {
    return deg * (Math.PI / 180);
}

/**
 * Formatiraj udaljenost za prikaz
 */
export function formatDistance(km: number): string {
    if (km < 1) {
        return `${Math.round(km * 1000)} m`;
    }
    return `${km.toFixed(1)} km`;
}

/**
 * Proveri da li je lokacija blizu date tačke
 */
export function isNearby(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
    maxDistanceKm: number
): boolean {
    return calculateDistance(lat1, lon1, lat2, lon2) <= maxDistanceKm;
}

/**
 * Pronađi najbližu lokaciju iz liste
 */
export function findNearest<T extends { lat: number; lon: number }>(
    lat: number,
    lon: number,
    locations: T[]
): { location: T; distance: number } | null {
    if (locations.length === 0) return null;

    let nearest: T | null = null;
    let minDistance = Infinity;

    for (const location of locations) {
        const distance = calculateDistance(lat, lon, location.lat, location.lon);
        if (distance < minDistance) {
            minDistance = distance;
            nearest = location;
        }
    }

    return nearest ? { location: nearest, distance: minDistance } : null;
}

/**
 * Izračunaj bounding box oko koordinate
 */
export function getBoundingBox(
    lat: number,
    lon: number,
    radiusKm: number
): { minLat: number; maxLat: number; minLon: number; maxLon: number } {
    // Približna konverzija: 1 stepen ≈ 111 km
    const latDelta = radiusKm / 111;
    const lonDelta = radiusKm / (111 * Math.cos(toRad(lat)));

    return {
        minLat: lat - latDelta,
        maxLat: lat + latDelta,
        minLon: lon - lonDelta,
        maxLon: lon + lonDelta,
    };
}
