/**
 * Centralizovane Zod validacione šeme za API rute
 */
import { z } from 'zod';

// Koordinate validacija
export const coordinatesSchema = z.object({
    lat: z.string()
        .transform(val => parseFloat(val))
        .refine(val => !isNaN(val) && val >= -90 && val <= 90, {
            message: 'Latitude mora biti između -90 i 90',
        }),
    lon: z.string()
        .transform(val => parseFloat(val))
        .refine(val => !isNaN(val) && val >= -180 && val <= 180, {
            message: 'Longitude mora biti između -180 i 180',
        }),
});

// Opcione koordinate (za rute gde su opcionalne)
export const optionalCoordinatesSchema = z.object({
    lat: z.string().optional()
        .transform(val => val ? parseFloat(val) : undefined)
        .refine(val => val === undefined || (!isNaN(val) && val >= -90 && val <= 90), {
            message: 'Latitude mora biti između -90 i 90',
        }),
    lon: z.string().optional()
        .transform(val => val ? parseFloat(val) : undefined)
        .refine(val => val === undefined || (!isNaN(val) && val >= -180 && val <= 180), {
            message: 'Longitude mora biti između -180 i 180',
        }),
});

// Weather API parametri
export const weatherQuerySchema = z.object({
    lat: z.string().optional()
        .transform(val => val ? parseFloat(val) : undefined)
        .refine(val => val === undefined || (!isNaN(val) && val >= -90 && val <= 90), {
            message: 'Latitude mora biti između -90 i 90',
        }),
    lon: z.string().optional()
        .transform(val => val ? parseFloat(val) : undefined)
        .refine(val => val === undefined || (!isNaN(val) && val >= -180 && val <= 180), {
            message: 'Longitude mora biti između -180 i 180',
        }),
    city: z.string().optional(),
});

// Air quality API parametri
export const airQualityQuerySchema = z.object({
    lat: z.string().optional()
        .transform(val => val ? parseFloat(val) : undefined)
        .refine(val => val === undefined || (!isNaN(val) && val >= -90 && val <= 90), {
            message: 'Latitude mora biti između -90 i 90',
        }),
    lon: z.string().optional()
        .transform(val => val ? parseFloat(val) : undefined)
        .refine(val => val === undefined || (!isNaN(val) && val >= -180 && val <= 180), {
            message: 'Longitude mora biti između -180 i 180',
        }),
});

// Forecast API parametri
export const forecastQuerySchema = z.object({
    lat: z.string()
        .transform(val => parseFloat(val))
        .refine(val => !isNaN(val) && val >= -90 && val <= 90, {
            message: 'Latitude mora biti između -90 i 90',
        }),
    lon: z.string()
        .transform(val => parseFloat(val))
        .refine(val => !isNaN(val) && val >= -180 && val <= 180, {
            message: 'Longitude mora biti između -180 i 180',
        }),
    days: z.string().optional()
        .transform(val => val ? parseInt(val, 10) : 7)
        .refine(val => val >= 1 && val <= 16, {
            message: 'Broj dana mora biti između 1 i 16',
        }),
});

// Kontakt forma validacija (već postoji u route.ts, ali za reuzabilnost)
export const contactSchema = z.object({
    name: z.string().min(2, 'Ime mora imati najmanje 2 karaktera').max(100),
    email: z.string().email('Neispravan email format'),
    message: z.string().min(10, 'Poruka mora imati najmanje 10 karaktera').max(5000),
});

// Tipovi za lakši pristup
export type CoordinatesInput = z.infer<typeof coordinatesSchema>;
export type WeatherQueryInput = z.infer<typeof weatherQuerySchema>;
export type AirQualityQueryInput = z.infer<typeof airQualityQuerySchema>;
export type ForecastQueryInput = z.infer<typeof forecastQuerySchema>;
export type ContactInput = z.infer<typeof contactSchema>;

/**
 * Helper za parsiranje query parametara sa Zod-om
 */
export function parseQueryParams<T extends z.ZodType>(
    searchParams: URLSearchParams,
    schema: T
): z.SafeParseReturnType<z.input<T>, z.output<T>> {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
        params[key] = value;
    });
    return schema.safeParse(params);
}

/**
 * Formatiraj Zod greške za API response
 */
export function formatZodErrors(error: z.ZodError): Record<string, string[]> {
    return error.flatten().fieldErrors as Record<string, string[]>;
}
