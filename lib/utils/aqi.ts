// Centralizovana AQI kalkulacija po US EPA standardu
// https://www.airnow.gov/aqi/aqi-basics/

export interface AQIBreakpoint {
  low: number;
  high: number;
  aqiLow: number;
  aqiHigh: number;
}

// PM2.5 breakpoints (µg/m³)
const PM25_BREAKPOINTS: AQIBreakpoint[] = [
  { low: 0, high: 12.0, aqiLow: 0, aqiHigh: 50 },
  { low: 12.1, high: 35.4, aqiLow: 51, aqiHigh: 100 },
  { low: 35.5, high: 55.4, aqiLow: 101, aqiHigh: 150 },
  { low: 55.5, high: 150.4, aqiLow: 151, aqiHigh: 200 },
  { low: 150.5, high: 250.4, aqiLow: 201, aqiHigh: 300 },
  { low: 250.5, high: 350.4, aqiLow: 301, aqiHigh: 400 },
  { low: 350.5, high: 500.4, aqiLow: 401, aqiHigh: 500 },
];

// PM10 breakpoints (µg/m³)
const PM10_BREAKPOINTS: AQIBreakpoint[] = [
  { low: 0, high: 54, aqiLow: 0, aqiHigh: 50 },
  { low: 55, high: 154, aqiLow: 51, aqiHigh: 100 },
  { low: 155, high: 254, aqiLow: 101, aqiHigh: 150 },
  { low: 255, high: 354, aqiLow: 151, aqiHigh: 200 },
  { low: 355, high: 424, aqiLow: 201, aqiHigh: 300 },
  { low: 425, high: 504, aqiLow: 301, aqiHigh: 400 },
  { low: 505, high: 604, aqiLow: 401, aqiHigh: 500 },
];

function calculateSubIndex(concentration: number, breakpoints: AQIBreakpoint[]): number {
  for (const bp of breakpoints) {
    if (concentration >= bp.low && concentration <= bp.high) {
      return Math.round(
        ((bp.aqiHigh - bp.aqiLow) / (bp.high - bp.low)) * (concentration - bp.low) + bp.aqiLow
      );
    }
  }
  // Vrednost iznad skale
  return 500;
}

export function calculateAQIFromPM25(pm25: number): number {
  if (pm25 < 0) return 0;
  return calculateSubIndex(pm25, PM25_BREAKPOINTS);
}

export function calculateAQIFromPM10(pm10: number): number {
  if (pm10 < 0) return 0;
  return calculateSubIndex(pm10, PM10_BREAKPOINTS);
}

export function calculateAQI(pm25?: number, pm10?: number): number {
  const indices: number[] = [];
  
  if (pm25 !== undefined && pm25 >= 0) {
    indices.push(calculateAQIFromPM25(pm25));
  }
  
  if (pm10 !== undefined && pm10 >= 0) {
    indices.push(calculateAQIFromPM10(pm10));
  }
  
  if (indices.length === 0) return 0;
  
  // AQI je maksimum svih sub-indeksa
  return Math.max(...indices);
}

export type AQICategory = "good" | "moderate" | "sensitive" | "unhealthy" | "veryUnhealthy" | "hazardous";

export function getAQICategory(aqi: number): AQICategory {
  if (aqi <= 50) return "good";
  if (aqi <= 100) return "moderate";
  if (aqi <= 150) return "sensitive";
  if (aqi <= 200) return "unhealthy";
  if (aqi <= 300) return "veryUnhealthy";
  return "hazardous";
}

export function getAQILabel(aqi: number): string {
  if (aqi <= 50) return "Odličan";
  if (aqi <= 100) return "Dobar";
  if (aqi <= 150) return "Umeren";
  if (aqi <= 200) return "Nezdrav";
  if (aqi <= 300) return "Vrlo nezdrav";
  return "Opasan";
}

export function getAQIColor(aqi: number): string {
  if (aqi <= 50) return "text-green-400";
  if (aqi <= 100) return "text-yellow-400";
  if (aqi <= 150) return "text-orange-400";
  if (aqi <= 200) return "text-red-400";
  if (aqi <= 300) return "text-purple-400";
  return "text-rose-600";
}

export function getAQIBgColor(aqi: number): string {
  if (aqi <= 50) return "bg-green-500";
  if (aqi <= 100) return "bg-yellow-500";
  if (aqi <= 150) return "bg-orange-500";
  if (aqi <= 200) return "bg-red-500";
  if (aqi <= 300) return "bg-purple-500";
  return "bg-rose-600";
}

export function getAQIBgGradient(aqi: number): string {
  if (aqi <= 50) return "from-green-500/20 to-green-600/10";
  if (aqi <= 100) return "from-yellow-500/20 to-yellow-600/10";
  if (aqi <= 150) return "from-orange-500/20 to-orange-600/10";
  if (aqi <= 200) return "from-red-500/20 to-red-600/10";
  if (aqi <= 300) return "from-purple-500/20 to-purple-600/10";
  return "from-rose-500/20 to-rose-600/10";
}

export function getAQIDescription(aqi: number): string {
  if (aqi <= 50) {
    return "Kvalitet vazduha je zadovoljavajući i zagađenje vazduha predstavlja mali ili nikakav rizik.";
  }
  if (aqi <= 100) {
    return "Kvalitet vazduha je prihvatljiv. Međutim, za neke zagađivače može postojati umeren zdravstveni problem za veoma mali broj osoba.";
  }
  if (aqi <= 150) {
    return "Članovi osetljivih grupa mogu osetiti zdravstvene efekte. Opšta populacija verovatno neće biti pogođena.";
  }
  if (aqi <= 200) {
    return "Svi mogu početi da osećaju zdravstvene efekte. Članovi osetljivih grupa mogu osetiti ozbiljnije efekte.";
  }
  if (aqi <= 300) {
    return "Zdravstvena upozorenja hitnih stanja. Cela populacija verovatno će biti pogođena.";
  }
  return "Zdravstveno upozorenje: svi mogu osetiti ozbiljne zdravstvene efekte.";
}

export function getHealthRecommendations(aqi: number): string[] {
  if (aqi <= 50) {
    return [
      "Idealno za aktivnosti na otvorenom",
      "Prozračite prostor",
      "Uživajte u svežem vazduhu",
    ];
  }
  if (aqi <= 100) {
    return [
      "Većina ljudi može normalno da bude aktivna",
      "Osetljive osobe bi trebalo da razmotre smanjenje intenzivnih aktivnosti",
      "Pratite prognozu kvaliteta vazduha",
    ];
  }
  if (aqi <= 150) {
    return [
      "Osetljive grupe bi trebalo da ograniče boravak napolju",
      "Smanjite intenzivne aktivnosti na otvorenom",
      "Držite prozore zatvorenim",
    ];
  }
  if (aqi <= 200) {
    return [
      "Izbegavajte fizičke aktivnosti na otvorenom",
      "Nosite masku ako morate napolje",
      "Koristite prečistač vazduha u zatvorenom prostoru",
    ];
  }
  return [
    "Ostanite u zatvorenom prostoru",
    "Izbegavajte bilo kakve aktivnosti napolju",
    "Koristite masku N95 ako morate napolje",
    "Potražite medicinsku pomoć ako osećate simptome",
  ];
}
