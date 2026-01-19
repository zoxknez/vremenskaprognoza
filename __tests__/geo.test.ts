import { describe, it, expect } from 'vitest';
import {
    calculateDistance,
    formatDistance,
    isNearby,
    findNearest,
    getBoundingBox,
} from '@/lib/utils/geo';

describe('Geo Utilities', () => {
    describe('calculateDistance', () => {
        it('should return 0 for same coordinates', () => {
            expect(calculateDistance(44.8176, 20.4633, 44.8176, 20.4633)).toBe(0);
        });

        it('should calculate distance between Belgrade and Novi Sad (~80km)', () => {
            // Beograd: 44.8176, 20.4633
            // Novi Sad: 45.2671, 19.8335
            const distance = calculateDistance(44.8176, 20.4633, 45.2671, 19.8335);
            expect(distance).toBeGreaterThan(70);
            expect(distance).toBeLessThan(100);
        });

        it('should calculate distance between Belgrade and Niš (~200km)', () => {
            // Beograd: 44.8176, 20.4633
            // Niš: 43.3209, 21.8957
            const distance = calculateDistance(44.8176, 20.4633, 43.3209, 21.8957);
            expect(distance).toBeGreaterThan(180);
            expect(distance).toBeLessThan(220);
        });

        it('should be symmetric', () => {
            const d1 = calculateDistance(44.8176, 20.4633, 45.2671, 19.8335);
            const d2 = calculateDistance(45.2671, 19.8335, 44.8176, 20.4633);
            expect(d1).toBeCloseTo(d2, 5);
        });
    });

    describe('formatDistance', () => {
        it('should format distances under 1km in meters', () => {
            expect(formatDistance(0.5)).toBe('500 m');
            expect(formatDistance(0.1)).toBe('100 m');
            expect(formatDistance(0.05)).toBe('50 m');
        });

        it('should format distances over 1km in kilometers', () => {
            expect(formatDistance(1)).toBe('1.0 km');
            expect(formatDistance(5.5)).toBe('5.5 km');
            expect(formatDistance(100)).toBe('100.0 km');
        });
    });

    describe('isNearby', () => {
        it('should return true for same location', () => {
            expect(isNearby(44.8176, 20.4633, 44.8176, 20.4633, 1)).toBe(true);
        });

        it('should return true for locations within max distance', () => {
            // ~80km between these cities
            expect(isNearby(44.8176, 20.4633, 45.2671, 19.8335, 100)).toBe(true);
        });

        it('should return false for locations outside max distance', () => {
            expect(isNearby(44.8176, 20.4633, 45.2671, 19.8335, 50)).toBe(false);
        });
    });

    describe('findNearest', () => {
        const locations = [
            { lat: 44.8176, lon: 20.4633, name: 'Beograd' },
            { lat: 45.2671, lon: 19.8335, name: 'Novi Sad' },
            { lat: 43.3209, lon: 21.8957, name: 'Niš' },
        ];

        it('should return null for empty array', () => {
            expect(findNearest(44.8, 20.4, [])).toBeNull();
        });

        it('should find Belgrade as nearest to Belgrade coordinates', () => {
            const result = findNearest(44.8176, 20.4633, locations);
            expect(result).not.toBeNull();
            expect(result!.location.name).toBe('Beograd');
            expect(result!.distance).toBe(0);
        });

        it('should find correct nearest location', () => {
            // Point closer to Novi Sad
            const result = findNearest(45.3, 19.9, locations);
            expect(result).not.toBeNull();
            expect(result!.location.name).toBe('Novi Sad');
        });
    });

    describe('getBoundingBox', () => {
        it('should return valid bounding box', () => {
            const bbox = getBoundingBox(44.8176, 20.4633, 10);

            expect(bbox.minLat).toBeLessThan(44.8176);
            expect(bbox.maxLat).toBeGreaterThan(44.8176);
            expect(bbox.minLon).toBeLessThan(20.4633);
            expect(bbox.maxLon).toBeGreaterThan(20.4633);
        });

        it('should increase size with larger radius', () => {
            const small = getBoundingBox(44.8176, 20.4633, 5);
            const large = getBoundingBox(44.8176, 20.4633, 50);

            expect(large.maxLat - large.minLat).toBeGreaterThan(small.maxLat - small.minLat);
            expect(large.maxLon - large.minLon).toBeGreaterThan(small.maxLon - small.minLon);
        });
    });
});
