# Zagadjenost vazduha na Balkanu

Najsavremenija Next.js 16 web aplikacija za praćenje kvaliteta vazduha na Balkanu sa integracijom podataka iz više izvora.

## ✨ Funkcionalnosti

- 🗺️ Interaktivna mapa sa real-time podacima
- 📊 Grafikoni za istorijske podatke
- 🔔 Notifikacije za visoke nivoe zagadenja
- 📱 Responsive dizajn za sve uređaje
- 🌙 Dark mode podrška
- ⚡ Brzo učitavanje sa Next.js 16 optimizacijama

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

Aplikacija integriše podatke iz **9 različitih izvora**:

1. **OpenAQ API** - Globalna platforma za podatke o kvalitetu vazduha
2. **Sensor Community** - Mreža građanskih senzora (Madavi.de)
3. **WAQI (World Air Quality Index)** - Besplatni API sa 1000 zahteva/dan
4. **OpenWeatherMap Air Pollution** - Besplatni tier sa 1000 zahteva/dan
5. **AQICN API** - World Air Quality Index alternativni endpoint
6. **AirVisual (IQAir)** - Besplatni tier sa 500 zahteva/mesec
7. **AllThingsTalk Maker Platform** - IoT senzori
8. **Agencija za zaštitu životne sredine Srbije (SEPA)** - Zvanični podaci
9. **Klimerko (Vazduh građanima)** - Građanski monitoring

Aplikacija automatski kombinuje podatke iz svih dostupnih izvora za najpreciznije rezultate.

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
# Database (opciono - aplikacija radi i bez baze)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Mapbox (obavezno za mape)
# Dobij token na: https://account.mapbox.com/access-tokens/
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here

# WAQI API (besplatno - 1000 zahteva/dan)
# Registruj se na: https://aqicn.org/api/
WAQI_API_TOKEN=your_waqi_token

# OpenWeatherMap (besplatno - 1000 zahteva/dan)
# Registruj se na: https://openweathermap.org/api
OPENWEATHER_API_KEY=your_openweather_key

# AQICN API (besplatno)
AQICN_API_TOKEN=your_aqicn_token

# AirVisual/IQAir (besplatno - 500 zahteva/mesec)
# Registruj se na: https://www.iqair.com/us/air-pollution-data-api
AIRVISUAL_API_KEY=your_airvisual_key

# AllThingsTalk (opciono)
ALLTHINGSTALK_TOKEN=your_allthingstalk_token

# SEPA API (opciono - ako je dostupan)
SEPA_API_BASE=https://www.sepa.gov.rs

# Klimerko API (opciono - ako je dostupan)
KLIMERKO_API_BASE=https://klimerko.rs
```

**Napomena:** Aplikacija će raditi i bez API ključeva - koristiće mock podatke za demonstraciju. Za najbolje rezultate, dodaj što više API ključeva.

## 📦 Build za produkciju

```bash
npm run build
npm start
```

## 🗄️ Database Setup (Opciono)

Ako želiš da koristiš bazu podataka za čuvanje istorijskih podataka:

```bash
# Generiši migracije
npx drizzle-kit generate

# Pokreni migracije
npx drizzle-kit push
```

## 🎨 Struktura projekta

```
zagadjenost/
├── app/                    # Next.js 16 App Router
│   ├── (dashboard)/       # Dashboard layout
│   │   ├── page.tsx       # Glavna stranica
│   │   └── location/[id] # Detalji lokacije
│   ├── api/               # API routes
│   └── layout.tsx         # Root layout
├── components/            # React komponente
│   ├── ui/               # shadcn/ui komponente
│   ├── map/              # Mapa komponente
│   ├── charts/           # Grafičke komponente
│   └── air-quality/     # Komponente za aplikaciju
├── lib/                  # Utility funkcije
│   ├── api/              # API klijenti
│   ├── db/               # Database schema
│   └── types/            # TypeScript tipovi
└── public/               # Statički fajlovi
```

## 📄 Licenca

MIT
