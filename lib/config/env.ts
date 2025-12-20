import { z } from 'zod';

/**
 * Environment Variables Schema
 * Validira sve env varijable na startup
 */
const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Weather & Air Quality APIs
  OPENWEATHER_API_KEY: z.string().min(1, 'OpenWeather API key is required'),
  WAQI_API_KEY: z.string().optional(), // World Air Quality Index
  AQICN_API_KEY: z.string().optional(), // Air Quality Index China
  AIRVISUAL_API_KEY: z.string().optional(), // IQAir AirVisual
  OPENAQ_API_KEY: z.string().optional(), // OpenAQ
  
  // Database
  DATABASE_URL: z.string().url().optional(), // Neon PostgreSQL
  POSTGRES_URL: z.string().url().optional(), // Vercel Postgres
  
  // External Services
  ALLTHINGSTALK_TOKEN: z.string().optional(),
  
  // Vercel
  VERCEL_URL: z.string().optional(),
  NEXT_PUBLIC_VERCEL_URL: z.string().optional(),
});

/**
 * Type-safe environment variables
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Validirana env konfiguracija
 */
let validatedEnv: Env | null = null;

/**
 * Validate i return environment variables
 * Baca error ako validacija ne uspe
 */
export function getEnv(): Env {
  if (validatedEnv) {
    return validatedEnv;
  }

  try {
    validatedEnv = envSchema.parse(process.env);
    return validatedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join('\n');
      throw new Error(`❌ Invalid environment variables:\n${missingVars}`);
    }
    throw error;
  }
}

/**
 * Type-safe helper za dobijanje API keys
 */
export function getApiKey(service: 'openweather' | 'waqi' | 'aqicn' | 'airvisual' | 'openaq'): string | undefined {
  const env = getEnv();
  
  switch (service) {
    case 'openweather':
      return env.OPENWEATHER_API_KEY;
    case 'waqi':
      return env.WAQI_API_KEY;
    case 'aqicn':
      return env.AQICN_API_KEY;
    case 'airvisual':
      return env.AIRVISUAL_API_KEY;
    case 'openaq':
      return env.OPENAQ_API_KEY;
    default:
      return undefined;
  }
}

/**
 * Check da li je development mode
 */
export function isDevelopment(): boolean {
  return getEnv().NODE_ENV === 'development';
}

/**
 * Check da li je production mode
 */
export function isProduction(): boolean {
  return getEnv().NODE_ENV === 'production';
}

/**
 * Get database URL
 */
export function getDatabaseUrl(): string | undefined {
  const env = getEnv();
  return env.DATABASE_URL || env.POSTGRES_URL;
}
