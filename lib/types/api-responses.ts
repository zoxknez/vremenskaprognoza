/**
 * OpenWeather API Type Definitions
 * https://openweathermap.org/api
 */

export interface OpenWeatherCurrent {
  coord: {
    lon: number;
    lat: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number;
    grnd_level?: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  clouds: {
    all: number;
  };
  rain?: {
    '1h'?: number;
    '3h'?: number;
  };
  snow?: {
    '1h'?: number;
    '3h'?: number;
  };
  dt: number;
  sys: {
    type?: number;
    id?: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

export interface OpenWeatherOneCallResponse {
  lat: number;
  lon: number;
  timezone: string;
  timezone_offset: number;
  current?: OpenWeatherCurrentOneCall;
  minutely?: Array<{
    dt: number;
    precipitation: number;
  }>;
  hourly?: OpenWeatherHourly[];
  daily?: OpenWeatherDaily[];
  alerts?: OpenWeatherAlert[];
}

export interface OpenWeatherCurrentOneCall {
  dt: number;
  sunrise: number;
  sunset: number;
  temp: number;
  feels_like: number;
  pressure: number;
  humidity: number;
  dew_point: number;
  uvi: number;
  clouds: number;
  visibility: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust?: number;
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  rain?: {
    '1h'?: number;
  };
  snow?: {
    '1h'?: number;
  };
}

export interface OpenWeatherHourly {
  dt: number;
  temp: number;
  feels_like: number;
  pressure: number;
  humidity: number;
  dew_point: number;
  uvi: number;
  clouds: number;
  visibility: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust?: number;
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  pop: number; // Probability of precipitation
  rain?: {
    '1h': number;
  };
  snow?: {
    '1h': number;
  };
}

export interface OpenWeatherDaily {
  dt: number;
  sunrise: number;
  sunset: number;
  moonrise: number;
  moonset: number;
  moon_phase: number;
  summary?: string;
  temp: {
    day: number;
    min: number;
    max: number;
    night: number;
    eve: number;
    morn: number;
  };
  feels_like: {
    day: number;
    night: number;
    eve: number;
    morn: number;
  };
  pressure: number;
  humidity: number;
  dew_point: number;
  wind_speed: number;
  wind_deg: number;
  wind_gust?: number;
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  clouds: number;
  pop: number;
  rain?: number;
  snow?: number;
  uvi: number;
}

export interface OpenWeatherAlert {
  sender_name: string;
  event: string;
  start: number;
  end: number;
  description: string;
  tags?: string[];
}

export interface OpenWeatherForecastItem {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    sea_level?: number;
    grnd_level?: number;
    humidity: number;
    temp_kf?: number;
  };
  weather: Array<{
    id: number;
    main: string;
    description: string;
    icon: string;
  }>;
  clouds: {
    all: number;
  };
  wind: {
    speed: number;
    deg: number;
    gust?: number;
  };
  visibility: number;
  pop: number;
  rain?: {
    '3h': number;
  };
  snow?: {
    '3h': number;
  };
  sys: {
    pod: string; // Part of day (n/d)
  };
  dt_txt: string;
}

export interface OpenWeatherForecastResponse {
  cod: string;
  message: number;
  cnt: number;
  list: OpenWeatherForecastItem[];
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population?: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}

/**
 * Sensor Community API Types
 */
export interface SensorCommunityResponse {
  id: number;
  sampling_rate: string | null;
  timestamp: string;
  location: {
    id: number;
    latitude: string;
    longitude: string;
    altitude: string;
    country: string;
    exact_location: number;
    indoor: number;
  };
  sensor: {
    id: number;
    pin: string;
    sensor_type: {
      id: number;
      name: string;
      manufacturer: string;
    };
  };
  sensordatavalues: Array<{
    id: number;
    value: string;
    value_type: string;
  }>;
}

/**
 * OpenAQ API Types
 */
export interface OpenAQMeasurement {
  parameter: string;
  value: number;
  lastUpdated: string;
  unit: string;
  sourceName?: string;
  averagingPeriod?: {
    value: number;
    unit: string;
  };
}

export interface OpenAQLocation {
  id: number;
  name: string;
  locality?: string;
  timezone?: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  measurements?: OpenAQMeasurement[];
}

/**
 * SEPA API Types
 */
export interface SEPAStation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  measurements: {
    pm10?: number;
    pm25?: number;
    no2?: number;
    so2?: number;
    o3?: number;
    co?: number;
  };
  timestamp: string;
}
