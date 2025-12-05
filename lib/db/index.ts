import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

// Database connection is optional - app works without it
// Historical data can be stored in database when available
let db: ReturnType<typeof drizzle> | null = null;

if (process.env.DATABASE_URL) {
  try {
    const sql = neon(process.env.DATABASE_URL);
    db = drizzle(sql, { schema });
  } catch (error) {
    console.warn('Database connection failed:', error);
  }
}

export { db };

