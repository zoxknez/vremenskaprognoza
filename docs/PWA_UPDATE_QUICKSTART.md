# 🚀 PWA Update Funkcionalnost - Brzi Start

## ✅ Šta je implementirano

Aplikacija sada ima potpunu PWA update funkcionalnost koja automatski obaveštava korisnike o novim verzijama!

### Nove komponente:

1. **PWAUpdatePrompt** - Glavna komponenta za update notifikacije (već dodata u layout)
2. **PWAUpdateButton** - Alternativna, kompaktna verzija (floating button)
3. **useServiceWorkerUpdate** - Custom hook za update logiku
4. **Test stranica** - `/test-sw` za testiranje funkcionalnosti

## 🎯 Kako testirati ODMAH

### Najbrži način (30 sekundi):

1. Pokreni aplikaciju:
   ```bash
   npm run dev
   ```

2. Otvori browser i idi na aplikaciju

3. Otvori drugi tab i otvori fajl `public/sw.js`

4. Promeni verziju:
   ```javascript
   // Bilo koja veća verzija
   const CACHE_NAME = 'air-quality-v6';
   const RUNTIME_CACHE = 'air-quality-runtime-v6';
   ```

5. Sačuvaj fajl i sačekaj ~10-60 sekundi

6. **Boom!** 💥 Videćeš elegantnu notifikaciju na dnu ekrana!

### Alternativni način - DevTools:

1. Pokreni app i otvori ga u Chrome
2. Pritisni `F12` → **Application** tab
3. Klikni **Service Workers** u levom meniju
4. Promeni kod u `sw.js` (bilo šta)
5. Klikni **Update** dugme u DevTools
6. Notifikacija se pojavljuje! ✨

## 📋 Testiranje na test stranici

Idi na `/test-sw` rutu da vidiš:
- Status service workera
- Da li je update dostupan
- Manuelno testiranje update-a
- Kompletna uputstva

## 🎨 Verzije komponenti

### Verzija 1: Puna notifikacija (trenutno aktivna)
```tsx
<PWAUpdatePrompt />
```
- Velika, lepa notifikacija
- Prikazuje bullet points sa features
- Dugme "Ažuriraj sada" i "Kasnije"

### Verzija 2: Kompaktno dugme
```tsx
<PWAUpdateButton />
```
- Mali floating button u donjem desnom uglu
- Minimalistički dizajn
- Samo ikonica + tekst

**Za promenu verzije**, otvori `app/layout.tsx` i zameni:
```tsx
<PWAUpdatePrompt />  // sa
<PWAUpdateButton />
```

## 🔧 Konfiguracija

### Frekvencija provere:
U `PWAUpdatePrompt.tsx`, linija ~52:
```typescript
setInterval(() => {
  registration.update();
}, 60000); // Promeni na 30000 za 30 sec
```

### Verzija cache-a:
U `public/sw.js`:
```javascript
const CACHE_NAME = 'air-quality-v5'; // Uvećaj broj za novi update
```

## 📱 Kako radi u produkciji

1. Deploy-uješ novu verziju na Vercel
2. Promeniš cache verziju u `sw.js`
3. Korisnici koji imaju otvorenu aplikaciju će automatski dobiti notifikaciju
4. Kliknu "Ažuriraj sada"
5. Aplikacija se reload-uje sa novom verzijom
6. ✅ Done!

## 🎯 Best Practice Workflow

Svaki put kada deploy-uješ:

```bash
# 1. Napravi promene u kodu
# 2. Update cache verziju
# U public/sw.js:
CACHE_NAME = 'air-quality-v6'  # increment broj

# 3. Commit i push
git add .
git commit -m "feat: nova funkcionalnost + v6"
git push

# 4. Vercel automatski deploy-uje
# 5. Korisnici dobijaju notifikaciju! 🎉
```

## 🐛 Troubleshooting

### Notifikacija se ne pojavljuje?
- Proveri konzolu za greške
- Idi na `/test-sw` i vidi status
- U DevTools → Application → Service Workers proveri stanje

### Aplikacija se reload-uje sama?
- To znači da SW auto-aktivira update
- Proveri da li ima `skipWaiting()` negde bez uslova

### Želim da odmah vidim notifikaciju?
```typescript
// U PWAUpdatePrompt.tsx, promeni:
setTimeout(() => {
  setShowPrompt(true);
}, 3000);  // na 0 ili manje
```

## 📚 Dodatni resursi

- Pogledaj `docs/PWA_UPDATE.md` za detaljniju dokumentaciju
- Koristi `/test-sw` stranicu za testiranje
- Koristi `useServiceWorkerUpdate` hook u custom komponentama

## 🎉 That's it!

Sada imaš profesionalnu PWA update funkcionalnost! Korisnici će uvek imati najnoviju verziju aplikacije. 🚀
