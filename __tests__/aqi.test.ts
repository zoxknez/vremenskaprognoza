import { describe, it, expect } from 'vitest';
import {
    calculateAQI,
    calculateAQIFromPM25,
    calculateAQIFromPM10,
    getAQICategory,
    getAQILabel,
    getAQIColor,
    getHealthRecommendations,
} from '@/lib/utils/aqi';

describe('AQI Calculation', () => {
    describe('calculateAQIFromPM25', () => {
        it('should return 0 for 0 PM2.5', () => {
            expect(calculateAQIFromPM25(0)).toBe(0);
        });

        it('should return 50 for PM2.5 of 12', () => {
            expect(calculateAQIFromPM25(12)).toBe(50);
        });

        it('should return value in moderate range for PM2.5 of 25', () => {
            const result = calculateAQIFromPM25(25);
            expect(result).toBeGreaterThan(50);
            expect(result).toBeLessThanOrEqual(100);
        });

        it('should return value in unhealthy range for PM2.5 of 100', () => {
            const result = calculateAQIFromPM25(100);
            expect(result).toBeGreaterThan(150);
            expect(result).toBeLessThanOrEqual(200);
        });

        it('should cap at 500 for very high values', () => {
            expect(calculateAQIFromPM25(1000)).toBe(500);
        });
    });

    describe('calculateAQIFromPM10', () => {
        it('should return 0 for 0 PM10', () => {
            expect(calculateAQIFromPM10(0)).toBe(0);
        });

        it('should return 50 for PM10 of 54', () => {
            expect(calculateAQIFromPM10(54)).toBe(50);
        });

        it('should return value in moderate range for PM10 of 100', () => {
            const result = calculateAQIFromPM10(100);
            expect(result).toBeGreaterThan(50);
            expect(result).toBeLessThanOrEqual(100);
        });
    });

    describe('calculateAQI', () => {
        it('should return 0 when no values provided', () => {
            expect(calculateAQI()).toBe(0);
        });

        it('should return PM2.5 AQI when only PM2.5 provided', () => {
            expect(calculateAQI(12)).toBe(50);
        });

        it('should return PM10 AQI when only PM10 provided', () => {
            expect(calculateAQI(undefined, 54)).toBe(50);
        });

        it('should return maximum of PM2.5 and PM10 AQI', () => {
            // PM2.5 of 35.5 = AQI 101, PM10 of 54 = AQI 50
            const result = calculateAQI(35.5, 54);
            expect(result).toBeGreaterThanOrEqual(100);
        });
    });
});

describe('AQI Category', () => {
    describe('getAQICategory', () => {
        it('should return good for AQI 0-50', () => {
            expect(getAQICategory(0)).toBe('good');
            expect(getAQICategory(25)).toBe('good');
            expect(getAQICategory(50)).toBe('good');
        });

        it('should return moderate for AQI 51-100', () => {
            expect(getAQICategory(51)).toBe('moderate');
            expect(getAQICategory(75)).toBe('moderate');
            expect(getAQICategory(100)).toBe('moderate');
        });

        it('should return sensitive for AQI 101-150', () => {
            expect(getAQICategory(101)).toBe('sensitive');
            expect(getAQICategory(125)).toBe('sensitive');
            expect(getAQICategory(150)).toBe('sensitive');
        });

        it('should return unhealthy for AQI 151-200', () => {
            expect(getAQICategory(151)).toBe('unhealthy');
            expect(getAQICategory(200)).toBe('unhealthy');
        });

        it('should return veryUnhealthy for AQI 201-300', () => {
            expect(getAQICategory(201)).toBe('veryUnhealthy');
            expect(getAQICategory(300)).toBe('veryUnhealthy');
        });

        it('should return hazardous for AQI 301+', () => {
            expect(getAQICategory(301)).toBe('hazardous');
            expect(getAQICategory(500)).toBe('hazardous');
        });
    });

    describe('getAQILabel', () => {
        it('should return correct Serbian labels', () => {
            expect(getAQILabel(25)).toBe('Odličan');
            expect(getAQILabel(75)).toBe('Dobar');
            expect(getAQILabel(125)).toBe('Umeren');
            expect(getAQILabel(175)).toBe('Nezdrav');
            expect(getAQILabel(250)).toBe('Vrlo nezdrav');
            expect(getAQILabel(350)).toBe('Opasan');
        });
    });

    describe('getAQIColor', () => {
        it('should return Tailwind color classes', () => {
            expect(getAQIColor(25)).toContain('green');
            expect(getAQIColor(75)).toContain('yellow');
            expect(getAQIColor(125)).toContain('orange');
            expect(getAQIColor(175)).toContain('red');
            expect(getAQIColor(250)).toContain('purple');
            expect(getAQIColor(350)).toContain('rose');
        });
    });
});

describe('Health Recommendations', () => {
    describe('getHealthRecommendations', () => {
        it('should return positive recommendations for good AQI', () => {
            const recs = getHealthRecommendations(25);
            expect(recs.length).toBeGreaterThan(0);
            expect(recs.some(r => r.includes('otvorenom'))).toBe(true);
        });

        it('should return cautionary recommendations for moderate AQI', () => {
            const recs = getHealthRecommendations(75);
            expect(recs.length).toBeGreaterThan(0);
        });

        it('should return restrictive recommendations for unhealthy AQI', () => {
            const recs = getHealthRecommendations(175);
            expect(recs.length).toBeGreaterThan(0);
            expect(recs.some(r => r.includes('masku'))).toBe(true);
        });

        it('should return emergency recommendations for hazardous AQI', () => {
            const recs = getHealthRecommendations(350);
            expect(recs.length).toBeGreaterThan(0);
            expect(recs.some(r => r.includes('zatvorenom'))).toBe(true);
        });
    });
});
