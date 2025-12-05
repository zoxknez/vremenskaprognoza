import { AirQualityData, AirQualitySource } from '@/lib/types/air-quality';
import { calculateAQI } from '@/lib/types/air-quality';

// Balkanske zemlje sa koordinatama glavnih gradova
export const BALKAN_COUNTRIES = {
  RS: {
    code: 'RS',
    name: 'Srbija',
    nameEn: 'Serbia',
    cities: [
      { name: 'Beograd', lat: 44.7872, lon: 20.4573 },
      { name: 'Novi Sad', lat: 45.2671, lon: 19.8335 },
      { name: 'Niš', lat: 43.3209, lon: 21.8957 },
      { name: 'Kragujevac', lat: 44.0128, lon: 20.9164 },
      { name: 'Subotica', lat: 46.1000, lon: 19.6667 },
      { name: 'Zrenjanin', lat: 45.3776, lon: 20.3865 },
      { name: 'Pančevo', lat: 44.8738, lon: 20.6517 },
      { name: 'Čačak', lat: 43.8914, lon: 20.3497 },
      { name: 'Kraljevo', lat: 43.7257, lon: 20.6897 },
      { name: 'Smederevo', lat: 44.6628, lon: 20.9269 },
      { name: 'Valjevo', lat: 44.2747, lon: 19.8903 },
      { name: 'Užice', lat: 43.8586, lon: 19.8425 },
    ],
    bbox: { latMin: 41.8, latMax: 46.2, lonMin: 18.8, lonMax: 23.0 },
  },
  HR: {
    code: 'HR',
    name: 'Hrvatska',
    nameEn: 'Croatia',
    cities: [
      { name: 'Zagreb', lat: 45.8150, lon: 15.9819 },
      { name: 'Split', lat: 43.5081, lon: 16.4402 },
      { name: 'Rijeka', lat: 45.3271, lon: 14.4422 },
      { name: 'Osijek', lat: 45.5511, lon: 18.6939 },
      { name: 'Zadar', lat: 44.1194, lon: 15.2314 },
      { name: 'Slavonski Brod', lat: 45.1603, lon: 18.0156 },
      { name: 'Pula', lat: 44.8666, lon: 13.8496 },
      { name: 'Karlovac', lat: 45.4929, lon: 15.5553 },
      { name: 'Sisak', lat: 45.4658, lon: 16.3728 },
      { name: 'Varaždin', lat: 46.3057, lon: 16.3366 },
    ],
    bbox: { latMin: 42.3, latMax: 46.6, lonMin: 13.4, lonMax: 19.5 },
  },
  BA: {
    code: 'BA',
    name: 'Bosna i Hercegovina',
    nameEn: 'Bosnia and Herzegovina',
    cities: [
      { name: 'Sarajevo', lat: 43.8563, lon: 18.4131 },
      { name: 'Banja Luka', lat: 44.7722, lon: 17.1910 },
      { name: 'Tuzla', lat: 44.5384, lon: 18.6763 },
      { name: 'Zenica', lat: 44.2017, lon: 17.9078 },
      { name: 'Mostar', lat: 43.3438, lon: 17.8078 },
      { name: 'Bijeljina', lat: 44.7589, lon: 19.2147 },
      { name: 'Brčko', lat: 44.8726, lon: 18.8097 },
      { name: 'Prijedor', lat: 44.9800, lon: 16.7136 },
    ],
    bbox: { latMin: 42.5, latMax: 45.3, lonMin: 15.7, lonMax: 19.7 },
  },
  ME: {
    code: 'ME',
    name: 'Crna Gora',
    nameEn: 'Montenegro',
    cities: [
      { name: 'Podgorica', lat: 42.4304, lon: 19.2594 },
      { name: 'Nikšić', lat: 42.7731, lon: 18.9444 },
      { name: 'Pljevlja', lat: 43.3572, lon: 19.3547 },
      { name: 'Bijelo Polje', lat: 43.0386, lon: 19.7483 },
      { name: 'Herceg Novi', lat: 42.4531, lon: 18.5375 },
      { name: 'Berane', lat: 42.8439, lon: 19.8622 },
      { name: 'Budva', lat: 42.2911, lon: 18.8403 },
      { name: 'Bar', lat: 42.0936, lon: 19.1006 },
    ],
    bbox: { latMin: 41.8, latMax: 43.6, lonMin: 18.4, lonMax: 20.4 },
  },
  MK: {
    code: 'MK',
    name: 'Severna Makedonija',
    nameEn: 'North Macedonia',
    cities: [
      { name: 'Skopje', lat: 41.9981, lon: 21.4254 },
      { name: 'Bitola', lat: 41.0297, lon: 21.3292 },
      { name: 'Kumanovo', lat: 42.1322, lon: 21.7144 },
      { name: 'Prilep', lat: 41.3449, lon: 21.5528 },
      { name: 'Tetovo', lat: 42.0069, lon: 20.9715 },
      { name: 'Ohrid', lat: 41.1231, lon: 20.8016 },
      { name: 'Veles', lat: 41.7153, lon: 21.7756 },
      { name: 'Štip', lat: 41.7358, lon: 22.1908 },
    ],
    bbox: { latMin: 40.8, latMax: 42.4, lonMin: 20.4, lonMax: 23.0 },
  },
  SI: {
    code: 'SI',
    name: 'Slovenija',
    nameEn: 'Slovenia',
    cities: [
      { name: 'Ljubljana', lat: 46.0569, lon: 14.5058 },
      { name: 'Maribor', lat: 46.5547, lon: 15.6459 },
      { name: 'Celje', lat: 46.2361, lon: 15.2677 },
      { name: 'Kranj', lat: 46.2389, lon: 14.3556 },
      { name: 'Koper', lat: 45.5469, lon: 13.7294 },
      { name: 'Velenje', lat: 46.3592, lon: 15.1103 },
      { name: 'Novo Mesto', lat: 45.8042, lon: 15.1689 },
      { name: 'Nova Gorica', lat: 45.9558, lon: 13.6483 },
    ],
    bbox: { latMin: 45.4, latMax: 46.9, lonMin: 13.3, lonMax: 16.6 },
  },
  AL: {
    code: 'AL',
    name: 'Albanija',
    nameEn: 'Albania',
    cities: [
      { name: 'Tirana', lat: 41.3275, lon: 19.8187 },
      { name: 'Durrës', lat: 41.3246, lon: 19.4565 },
      { name: 'Vlorë', lat: 40.4606, lon: 19.4900 },
      { name: 'Shkodër', lat: 42.0693, lon: 19.5033 },
      { name: 'Elbasan', lat: 41.1125, lon: 20.0822 },
      { name: 'Korçë', lat: 40.6186, lon: 20.7808 },
      { name: 'Fier', lat: 40.7239, lon: 19.5567 },
      { name: 'Berat', lat: 40.7058, lon: 19.9522 },
    ],
    bbox: { latMin: 39.6, latMax: 42.7, lonMin: 19.2, lonMax: 21.1 },
  },
  XK: {
    code: 'XK',
    name: 'Kosovo',
    nameEn: 'Kosovo',
    cities: [
      { name: 'Priština', lat: 42.6629, lon: 21.1655 },
      { name: 'Prizren', lat: 42.2139, lon: 20.7397 },
      { name: 'Peć', lat: 42.6592, lon: 20.2883 },
      { name: 'Mitrovica', lat: 42.8914, lon: 20.8660 },
      { name: 'Gnjilane', lat: 42.4636, lon: 21.4694 },
      { name: 'Đakovica', lat: 42.3803, lon: 20.4306 },
      { name: 'Ferizaj', lat: 42.3706, lon: 21.1553 },
      { name: 'Podujevo', lat: 42.9108, lon: 21.1900 },
    ],
    bbox: { latMin: 41.8, latMax: 43.3, lonMin: 20.0, lonMax: 21.8 },
  },
  BG: {
    code: 'BG',
    name: 'Bugarska',
    nameEn: 'Bulgaria',
    cities: [
      { name: 'Sofija', lat: 42.6977, lon: 23.3219 },
      { name: 'Plovdiv', lat: 42.1354, lon: 24.7453 },
      { name: 'Varna', lat: 43.2141, lon: 27.9147 },
      { name: 'Burgas', lat: 42.5048, lon: 27.4626 },
      { name: 'Ruse', lat: 43.8356, lon: 25.9657 },
      { name: 'Stara Zagora', lat: 42.4258, lon: 25.6345 },
      { name: 'Pleven', lat: 43.4170, lon: 24.6067 },
      { name: 'Sliven', lat: 42.6817, lon: 26.3292 },
    ],
    bbox: { latMin: 41.2, latMax: 44.2, lonMin: 22.3, lonMax: 28.6 },
  },
  RO: {
    code: 'RO',
    name: 'Rumunija',
    nameEn: 'Romania',
    cities: [
      { name: 'Bukurešt', lat: 44.4268, lon: 26.1025 },
      { name: 'Kluž-Napoka', lat: 46.7712, lon: 23.6236 },
      { name: 'Temišvar', lat: 45.7489, lon: 21.2087 },
      { name: 'Jaši', lat: 47.1585, lon: 27.6014 },
      { name: 'Konstanca', lat: 44.1598, lon: 28.6348 },
      { name: 'Krajova', lat: 44.3302, lon: 23.7949 },
      { name: 'Brašov', lat: 45.6579, lon: 25.6012 },
      { name: 'Galac', lat: 45.4353, lon: 28.0080 },
      { name: 'Ploješti', lat: 44.9416, lon: 26.0267 },
      { name: 'Oradea', lat: 47.0722, lon: 21.9211 },
    ],
    bbox: { latMin: 43.6, latMax: 48.3, lonMin: 20.2, lonMax: 29.7 },
  },
  GR: {
    code: 'GR',
    name: 'Grčka',
    nameEn: 'Greece',
    cities: [
      { name: 'Atina', lat: 37.9838, lon: 23.7275 },
      { name: 'Solun', lat: 40.6401, lon: 22.9444 },
      { name: 'Patra', lat: 38.2466, lon: 21.7346 },
      { name: 'Iraklion', lat: 35.3387, lon: 25.1442 },
      { name: 'Larisa', lat: 39.6390, lon: 22.4191 },
      { name: 'Volos', lat: 39.3666, lon: 22.9507 },
      { name: 'Janjina', lat: 39.6650, lon: 20.8537 },
      { name: 'Kavala', lat: 40.9376, lon: 24.4069 },
    ],
    bbox: { latMin: 34.8, latMax: 41.8, lonMin: 19.3, lonMax: 29.6 },
  },
} as const;

export type BalkanCountryCode = keyof typeof BALKAN_COUNTRIES;

// Bounding box za ceo Balkan
export const BALKAN_BBOX = {
  latMin: 34.8,
  latMax: 48.3,
  lonMin: 13.3,
  lonMax: 29.7,
};

// Helper funkcija za dobijanje svih gradova
export function getAllBalkanCities() {
  const cities: Array<{
    name: string;
    lat: number;
    lon: number;
    country: string;
    countryCode: string;
  }> = [];

  for (const [code, country] of Object.entries(BALKAN_COUNTRIES)) {
    for (const city of country.cities) {
      cities.push({
        ...city,
        country: country.name,
        countryCode: code,
      });
    }
  }

  return cities;
}

// Helper funkcija za dobijanje zemlje po koordinatama
export function getCountryByCoordinates(lat: number, lon: number): BalkanCountryCode | null {
  for (const [code, country] of Object.entries(BALKAN_COUNTRIES)) {
    const bbox = country.bbox;
    if (
      lat >= bbox.latMin &&
      lat <= bbox.latMax &&
      lon >= bbox.lonMin &&
      lon <= bbox.lonMax
    ) {
      return code as BalkanCountryCode;
    }
  }
  return null;
}
