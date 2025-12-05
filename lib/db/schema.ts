import { pgTable, text, timestamp, doublePrecision, integer } from 'drizzle-orm/pg-core';

export const stations = pgTable('stations', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  city: text('city').notNull(),
  region: text('region'),
  longitude: doublePrecision('longitude').notNull(),
  latitude: doublePrecision('latitude').notNull(),
  source: text('source').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const airQualityReadings = pgTable('air_quality_readings', {
  id: text('id').primaryKey(),
  stationId: text('station_id').notNull().references(() => stations.id),
  pm25: doublePrecision('pm25'),
  pm10: doublePrecision('pm10'),
  no2: doublePrecision('no2'),
  so2: doublePrecision('so2'),
  o3: doublePrecision('o3'),
  co: doublePrecision('co'),
  aqi: integer('aqi').notNull(),
  aqiCategory: text('aqi_category').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
});

