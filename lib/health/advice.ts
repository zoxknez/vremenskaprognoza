import { AQICategory } from '@/lib/types/air-quality';

export interface HealthAdvice {
  category: AQICategory;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  generalPopulation: string[];
  sensitiveGroups: string[];
  outdoorActivity: 'recommended' | 'moderate' | 'reduce' | 'avoid' | 'stay-indoors';
  icon: string;
  color: string;
}

export const HEALTH_ADVICE: Record<AQICategory, HealthAdvice> = {
  good: {
    category: 'good',
    title: 'Dobar kvalitet vazduha',
    titleEn: 'Good Air Quality',
    description: 'Kvalitet vazduha je zadovoljavajući i zagađenje vazduha predstavlja mali ili nikakav rizik.',
    descriptionEn: 'Air quality is satisfactory, and air pollution poses little or no risk.',
    generalPopulation: [
      'Uživajte u aktivnostima na otvorenom',
      'Idealno vreme za sport i rekreaciju',
      'Prozračite prostorije',
    ],
    sensitiveGroups: [
      'Nema posebnih ograničenja',
      'Normalne aktivnosti na otvorenom',
    ],
    outdoorActivity: 'recommended',
    icon: '😊',
    color: '#22c55e',
  },
  moderate: {
    category: 'moderate',
    title: 'Umeren kvalitet vazduha',
    titleEn: 'Moderate Air Quality',
    description: 'Kvalitet vazduha je prihvatljiv. Međutim, za neke zagađivače može postojati umeren zdravstveni problem za mali broj ljudi koji su neobično osetljivi na zagađenje vazduha.',
    descriptionEn: 'Air quality is acceptable. However, there may be a risk for some people, particularly those who are unusually sensitive to air pollution.',
    generalPopulation: [
      'Većina ljudi može normalno da nastavi aktivnosti',
      'Razmotrite smanjenje produženih aktivnosti na otvorenom ako osećate simptome',
    ],
    sensitiveGroups: [
      'Osobe sa respiratornim bolestima treba da smanje produžene napore na otvorenom',
      'Astmatičari treba da imaju lekove pri ruci',
    ],
    outdoorActivity: 'moderate',
    icon: '😐',
    color: '#eab308',
  },
  unhealthy: {
    category: 'unhealthy',
    title: 'Nezdrav za osetljive grupe',
    titleEn: 'Unhealthy for Sensitive Groups',
    description: 'Članovi osetljivih grupa mogu doživeti zdravstvene efekte. Opšta populacija verovatno neće biti pogođena.',
    descriptionEn: 'Members of sensitive groups may experience health effects. The general public is less likely to be affected.',
    generalPopulation: [
      'Smanjite produžene napore na otvorenom',
      'Pratite kvalitet vazduha',
      'Ako osećate simptome, pređite na aktivnosti u zatvorenom prostoru',
    ],
    sensitiveGroups: [
      'Izbegavajte produžene aktivnosti na otvorenom',
      'Deca i stariji treba da ostanu u zatvorenom prostoru',
      'Astmatičari treba da prate simptome pažljivije',
      'Nosite N95 masku ako morate napolje',
    ],
    outdoorActivity: 'reduce',
    icon: '😷',
    color: '#f97316',
  },
  'very-unhealthy': {
    category: 'very-unhealthy',
    title: 'Vrlo nezdrav',
    titleEn: 'Very Unhealthy',
    description: 'Zdravstvena upozorenja o vanrednim uslovima. Cela populacija će verovatno biti pogođena.',
    descriptionEn: 'Health alert: The risk of health effects is increased for everyone.',
    generalPopulation: [
      'Izbegavajte sve aktivnosti na otvorenom',
      'Držite prozore zatvorenim',
      'Koristite prečišćivač vazduha ako imate',
      'Nosite N95 masku ako morate napolje',
    ],
    sensitiveGroups: [
      'Ostanite u zatvorenom prostoru',
      'Držite lekove pri ruci',
      'Obratite se lekaru ako osećate simptome',
      'Razmotrite evakuaciju ako imate ozbiljne respiratorne probleme',
    ],
    outdoorActivity: 'avoid',
    icon: '🚨',
    color: '#ef4444',
  },
  hazardous: {
    category: 'hazardous',
    title: 'Opasan',
    titleEn: 'Hazardous',
    description: 'Zdravstveno upozorenje: svi mogu doživeti ozbiljnije zdravstvene efekte.',
    descriptionEn: 'Health warning of emergency conditions: everyone is more likely to be affected.',
    generalPopulation: [
      'Izbegavajte sve aktivnosti na otvorenom',
      'Ostanite u zatvorenom prostoru sa zatvorenim prozorima',
      'Koristite prečišćivač vazduha',
      'Ako nemate prečišćivač, napravite DIY filter',
      'Razmotrite napuštanje područja ako je moguće',
    ],
    sensitiveGroups: [
      'Hitno ostanite u zatvorenom prostoru',
      'Zatražite medicinsku pomoć ako osećate simptome',
      'Evakuišite se ako je moguće',
      'Ne izlazite bez N95/N99 maske',
    ],
    outdoorActivity: 'stay-indoors',
    icon: '☠️',
    color: '#a855f7',
  },
};

// Specifični saveti za određene grupe
export const SENSITIVE_GROUPS = [
  {
    id: 'children',
    name: 'Deca',
    nameEn: 'Children',
    icon: '👶',
    description: 'Deca su posebno osetljiva jer imaju veću stopu disanja i provode više vremena napolju.',
  },
  {
    id: 'elderly',
    name: 'Starije osobe',
    nameEn: 'Elderly',
    icon: '👴',
    description: 'Starije osobe mogu imati postojeće zdravstvene probleme koji se pogoršavaju zagađenjem.',
  },
  {
    id: 'respiratory',
    name: 'Osobe sa respiratornim bolestima',
    nameEn: 'People with respiratory conditions',
    icon: '🫁',
    description: 'Astma, HOBP i druge respiratorne bolesti mogu se pogoršati.',
  },
  {
    id: 'cardiovascular',
    name: 'Osobe sa kardiovaskularnim bolestima',
    nameEn: 'People with cardiovascular conditions',
    icon: '❤️',
    description: 'Zagađenje vazduha može izazvati srčane probleme i povećati rizik od moždanog udara.',
  },
  {
    id: 'pregnant',
    name: 'Trudnice',
    nameEn: 'Pregnant women',
    icon: '🤰',
    description: 'Izloženost zagađenom vazduhu može uticati na razvoj fetusa.',
  },
  {
    id: 'outdoor-workers',
    name: 'Radnici na otvorenom',
    nameEn: 'Outdoor workers',
    icon: '👷',
    description: 'Produžena izloženost tokom rada povećava zdravstvene rizike.',
  },
];

// Aktivnosti i njihova prikladnost po AQI
export const ACTIVITY_RECOMMENDATIONS = {
  running: {
    name: 'Trčanje',
    icon: '🏃',
    thresholds: { safe: 50, moderate: 100, avoid: 150 },
  },
  cycling: {
    name: 'Biciklizam',
    icon: '🚴',
    thresholds: { safe: 50, moderate: 100, avoid: 150 },
  },
  walking: {
    name: 'Šetnja',
    icon: '🚶',
    thresholds: { safe: 100, moderate: 150, avoid: 200 },
  },
  playground: {
    name: 'Igranje napolju (deca)',
    icon: '🧒',
    thresholds: { safe: 50, moderate: 75, avoid: 100 },
  },
  gardening: {
    name: 'Bašovanstvo',
    icon: '🌱',
    thresholds: { safe: 100, moderate: 150, avoid: 200 },
  },
};

export function getActivityRecommendation(activity: keyof typeof ACTIVITY_RECOMMENDATIONS, aqi: number) {
  const { thresholds } = ACTIVITY_RECOMMENDATIONS[activity];
  
  if (aqi <= thresholds.safe) {
    return { status: 'safe', message: 'Bezbedno za ovu aktivnost' };
  }
  if (aqi <= thresholds.moderate) {
    return { status: 'caution', message: 'Razmotrite skraćivanje aktivnosti' };
  }
  if (aqi <= thresholds.avoid) {
    return { status: 'reduce', message: 'Preporučuje se smanjenje aktivnosti' };
  }
  return { status: 'avoid', message: 'Izbegavajte ovu aktivnost' };
}
