# ☁️ Vremenska Prognoza - Balkan Weather & Air Quality

Moderna Next.js 16 web aplikacija za praćenje vremenske prognoze i kvaliteta vazduha na Balkanu sa real-time podacima iz više izvora.

![Preview](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwindcss)

## ✨ Funkcionalnosti

- 🌤️ **Vremenska prognoza** - 7-dnevna prognoza sa satnim podacima
- 🗺️ **Interaktivna mapa** - Real-time vizualizacija sa heatmap slojem
- 📊 **Kvalitet vazduha** - AQI indeks sa detaljnim zagađivačima (PM2.5, PM10, O₃, NO₂, SO₂, CO)
- 🔔 **Smart upozorenja** - Push notifikacije za loš kvalitet vazduha
- 📱 **PWA podrška** - Instaliraj kao mobilnu aplikaciju
- 🌙 **Dark/Light tema** - Automatska detekcija sistemske teme
- ⚡ **Glassmorphism UI** - Moderni dizajn sa animacijama
- 🌍 **Multi-jezik** - Podrška za srpski, hrvatski, engleski

## 🎨 UI Karakteristike

- **Framer Motion animacije** - Smooth tranzicije i micro-interakcije
- **Particle efekti** - Dinamična pozadina sa canvas animacijama
- **AQI Gauge** - Animirani indikatori kvaliteta vazduha
- **Glassmorphism kartice** - Staklasti efekti sa blur pozadinom
- **Responsive dizajn** - Optimizovano za sve uređaje

## 🛠️ Tehnologije

- **Framework**: Next.js 16 sa App Router i React Server Components
- **Jezik**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui komponente
- **Animacije**: Framer Motion
- **Mape**: Mapbox GL JS
- **Grafikoni**: Recharts
- **Baza podataka**: Neon PostgreSQL + Drizzle ORM
- **Deployment**: Vercel

## 📡 Izvori podataka

Aplikacija integriše podatke iz **8+ različitih izvora**:

| Izvor | Tip | Besplatno |
|-------|-----|-----------|
| OpenWeatherMap | Vreme + AQI | ✅ 1000 req/dan |
| WAQI | Kvalitet vazduha | ✅ 1000 req/dan |
| OpenAQ | Globalni AQI | ✅ Neograničeno |
| Sensor Community | Građanski senzori | ✅ Neograničeno |
| AQICN | World AQI | ✅ Neograničeno |
| AirVisual (IQAir) | Premium AQI | ✅ 500 req/mesec |
| SEPA Srbija | Zvanični podaci | ✅ Besplatno |
| AllThingsTalk | IoT senzori | ✅ Besplatno |

## 🚀 Pokretanje

```bash
# Instalacija dependencija
npm install

# Kopiraj .env.example u .env.local i popuni vrednosti
cp .env.example .env.local

# Pokreni development server
npm run dev
```

Otvori [http://localhost:3000](http://localhost:3000) u browseru.

## 📝 Environment Variables

Kreiraj `.env.local` fajl sa sledećim varijablama:

```env
# Mapbox (obavezno za mape)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token

# OpenWeatherMap (vreme + AQI)
OPENWEATHER_API_KEY=your_openweather_key

# WAQI API (kvalitet vazduha)
WAQI_API_TOKEN=your_waqi_token

# Opcioni API ključevi
AQICN_API_TOKEN=your_aqicn_token
AIRVISUAL_API_KEY=your_airvisual_key
RESEND_API_KEY=your_resend_key
NOTIFICATIONS_API_TOKEN=your_internal_token
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_rest_token

# Database (opciono)
DATABASE_URL=postgresql://user:password@host/database
```


> **Napomena:** Bez API kljuceva aplikacija se pokrece, ali podaci nece biti dostupni za servise koji zahtevaju autentikaciju.
> **Bezbednost:** Tajne kljuceve drzi iskljucivo u server varijablama (bez NEXT_PUBLIC_ prefiksa).
> **Rate limit backend:** Ako `UPSTASH_REDIS_REST_URL` i `UPSTASH_REDIS_REST_TOKEN` nisu setovani, koristi se in-memory fallback.
> **Health endpoint:** `/api/health/rate-limit` vraca aktivni rate-limit backend (`upstash` ili `memory`).

## 📦 Build za produkciju

```bash
npm run build
npm start
```

## 🗄️ Database Setup (Opciono)

```bash
npx drizzle-kit generate
npx drizzle-kit push
```

## 📂 Struktura projekta

```
vremenskaprognoza/
├── app/                    # Next.js 16 App Router
│   ├── page.tsx           # Početna stranica (Hero)
│   ├── dashboard/         # Dashboard sa podacima
│   ├── map/               # Interaktivna mapa
│   ├── rankings/          # Rangiranje gradova
│   ├── alerts/            # Upozorenja
│   └── api/               # API routes
├── components/            # React komponente
│   ├── ui/               # UI komponente (glass-card, aqi-gauge, animations)
│   ├── home/             # Homepage sekcije
│   ├── layout/           # Navigation, Footer
│   └── dashboard/        # Dashboard komponente
├── lib/                  # Utility funkcije
│   ├── api/              # API klijenti za sve izvore
│   ├── types/            # TypeScript tipovi
│   └── utils/            # Helper funkcije
└── public/               # Statički fajlovi
```

## 🖼️ Screenshots

| Početna | Dashboard | Rangiranje |
|---------|-----------|------------|
| Hero sekcija sa live AQI | Tabovi i statistika | Best/Worst gradovi |

## 🤝 Contributing

Pull requests su dobrodošli! Za veće promene, prvo otvorite issue.

## 📄 Licenca

MIT © 2025

---

<p align="center">
  Made with ❤️ for the Balkans
</p>

