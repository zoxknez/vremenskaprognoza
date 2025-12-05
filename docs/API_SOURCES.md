# API Izvori Podataka

Aplikacija integriše podatke iz **9 različitih izvora** za najpreciznije rezultate.

## Besplatni API-ji (Preporučeno)

### 1. WAQI (World Air Quality Index)
- **URL**: https://aqicn.org/api/
- **Besplatni tier**: 1000 zahteva/dan
- **Registracija**: https://aqicn.org/api/
- **Environment Variable**: `WAQI_API_TOKEN`
- **Status**: ✅ Implementiran

### 2. OpenWeatherMap Air Pollution
- **URL**: https://openweathermap.org/api/air-pollution
- **Besplatni tier**: 1000 zahteva/dan
- **Registracija**: https://openweathermap.org/api
- **Environment Variable**: `OPENWEATHER_API_KEY`
- **Status**: ✅ Implementiran

### 3. AQICN API
- **URL**: https://api.waqi.info
- **Besplatni tier**: Dostupan
- **Registracija**: https://aqicn.org/api/
- **Environment Variable**: `AQICN_API_TOKEN`
- **Status**: ✅ Implementiran

### 4. AirVisual (IQAir)
- **URL**: https://www.iqair.com/us/air-pollution-data-api
- **Besplatni tier**: 500 zahteva/mesec
- **Registracija**: https://www.iqair.com/us/air-pollution-data-api
- **Environment Variable**: `AIRVISUAL_API_KEY`
- **Status**: ✅ Implementiran

## Građanski Monitoring

### 5. Sensor Community (Madavi.de)
- **URL**: https://data.sensor.community
- **Besplatno**: Da, javni API
- **Environment Variable**: Nije potreban
- **Status**: ✅ Implementiran

### 6. OpenAQ
- **URL**: https://openaq.org
- **Besplatno**: Da
- **Environment Variable**: Nije potreban
- **Status**: ✅ Implementiran (v3 endpoint)

## Lokalni Izvori

### 7. AllThingsTalk Maker Platform
- **URL**: https://maker.allthingstalk.com
- **Besplatno**: Da (sa Device Token)
- **Environment Variable**: `ALLTHINGSTALK_TOKEN`
- **Status**: ✅ Implementiran

### 8. Agencija za zaštitu životne sredine Srbije (SEPA)
- **URL**: https://www.sepa.gov.rs
- **Status**: ⚠️ Endpoint treba da se istraži
- **Environment Variable**: `SEPA_API_BASE`
- **Napomena**: Zvanični API endpoint još nije javno dostupan

### 9. Klimerko (Vazduh građanima)
- **URL**: https://klimerko.rs
- **Status**: ⚠️ Endpoint treba da se istraži
- **Environment Variable**: `KLIMERKO_API_BASE`
- **Napomena**: API endpoint treba da se istraži

## Kako dodati API ključeve

1. Otvori `.env.local` fajl u root direktorijumu
2. Dodaj API ključeve koje želiš da koristiš:

```env
WAQI_API_TOKEN=your_token_here
OPENWEATHER_API_KEY=your_key_here
AQICN_API_TOKEN=your_token_here
AIRVISUAL_API_KEY=your_key_here
ALLTHINGSTALK_TOKEN=your_token_here
```

3. Restartuj development server

## Fallback Podaci

Ako nijedan API ne vrati podatke, aplikacija automatski koristi mock podatke za demonstraciju sa 5 gradova u Srbiji.

