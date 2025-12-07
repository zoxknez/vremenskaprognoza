export interface WeatherData {
    city: string;
    country: string;
    temperature: number;
    feelsLike: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    visibility: number;
    description: string;
    icon: string;
    aqi?: number;
    pm25?: number;
    pm10?: number;
    no2?: number;
    so2?: number;
    o3?: number;
    co?: number;
    dispersion?: {
        status: 'good' | 'moderate' | 'poor';
        reason: string;
        risk: 'low' | 'medium' | 'high';
    };
}

export interface ForecastData {
    time: string;
    temp: number;
    icon: string;
    description: string;
}

export interface CityData {
    name: string;
    country: string;
    temp: number;
    aqi: number;
    description: string;
}

export interface AirQualityData {
    aqi: number;
    pm25: number;
    pm10: number;
    no2: number;
    o3: number;
    co: number;
    so2?: number;
}

export interface SavedCity {
    name: string;
    country: string;
    lat: number;
    lon: number;
}
