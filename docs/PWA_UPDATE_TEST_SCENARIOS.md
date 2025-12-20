# 🧪 PWA Update - Test Scenariji

## Test Scenario 1: Prvi Update (Najjednostavniji) ⭐

**Cilj:** Videti update notifikaciju prvi put

**Koraci:**
1. Pokreni aplikaciju:
   ```bash
   npm run dev
   ```

2. Otvori browser i idi na `http://localhost:3000`

3. Otvori drugi tab/prozor i otvori `public/sw.js`

4. Pronađi liniju 3 i promeni:
   ```javascript
   // BILO:
   const CACHE_NAME = 'air-quality-v5';
   
   // SADA:
   const CACHE_NAME = 'air-quality-v6';
   ```

5. Sačuvaj fajl

6. Vrati se na aplikaciju i sačekaj 10-60 sekundi

7. **✅ Rezultat:** Videćeš elegantnu notifikaciju na dnu ekrana!

8. Klikni "Ažuriraj sada"

9. **✅ Rezultat:** Aplikacija se reload-uje sa novom verzijom

---

## Test Scenario 2: DevTools Test

**Cilj:** Brže testiranje sa Chrome DevTools

**Koraci:**
1. Otvori aplikaciju u Chrome

2. Pritisni `F12` da otvoriš DevTools

3. Idi na **Application** tab

4. U levom meniju klikni **Service Workers**

5. Promeni bilo šta u `public/sw.js` (npr. dodaj komentar)

6. U DevTools-u klikni dugme **Update** pored service workera

7. **✅ Rezultat:** Videćeš novi worker u "waiting" stanju

8. **✅ Rezultat:** Update notifikacija se pojavljuje!

9. Klikni "Ažuriraj sada" u notifikaciji

10. **✅ Rezultat:** Novi SW preuzima kontrolu, stranica se reload-uje

---

## Test Scenario 3: Test Stranica

**Cilj:** Kompletno testiranje sa debug panel-om

**Koraci:**
1. Pokreni aplikaciju

2. Idi na `http://localhost:3000/test-sw`

3. Vidi:
   - ✅ Service Worker status
   - ✅ Update status
   - ✅ PWA status
   - ✅ Verzije (app i cache)

4. Klikni "Proveri za update" dugme

5. **✅ Rezultat:** Manuelna provera za update

6. Ako ima update, klikni "Aktiviraj novi update"

7. **✅ Rezultat:** SW aktivira se, reload

**Bonus - Debug akcije:**

8. Testiraj "Očisti cache":
   - Klikni dugme
   - Potvrdi
   - **✅ Rezultat:** Svi cache-evi obrisani, reload

9. Testiraj "Unregister SW":
   - Klikni dugme
   - Potvrdi
   - **✅ Rezultat:** SW uklonjen, reload

---

## Test Scenario 4: Mobile Test

**Cilj:** Testirati na mobilnom uređaju

**Koraci:**
1. Deploy aplikaciju ili koristi ngrok/localtunnel za local testiranje

2. Otvori na mobilnom browseru

3. Instaliraj kao PWA (Add to Home Screen)

4. Deploy novu verziju ili promeni cache verziju

5. Otvori instaliranu PWA

6. **✅ Rezultat:** Update notifikacija se pojavljuje!

7. Tap "Ažuriraj sada"

8. **✅ Rezultat:** PWA se reload-uje sa novom verzijom

---

## Test Scenario 5: Multiple Tabs Test

**Cilj:** Testirati kako se update ponaša sa više otvorenih tab-ova

**Koraci:**
1. Otvori aplikaciju u 3 različita taba

2. Promeni cache verziju u `sw.js`

3. **✅ Rezultat:** Svi tab-ovi bi trebalo da dobiju notifikaciju

4. Klikni "Ažuriraj sada" u JEDNOM tabu

5. **✅ Rezultat:** SVI tab-ovi se reload-uju sa novom verzijom

---

## Test Scenario 6: Offline → Online Test

**Cilj:** Testirati update kada korisnik ide offline pa online

**Koraci:**
1. Otvori aplikaciju

2. Otvori DevTools → Network tab

3. Selektuj "Offline" mode

4. Deploy novu verziju (ili promeni cache verziju na serveru)

5. U DevTools vrati na "Online" mode

6. **✅ Rezultat:** SW detektuje update nakon ~60s

7. **✅ Rezultat:** Notifikacija se pojavljuje

---

## Test Scenario 7: Production Deployment Test

**Cilj:** Real-world testiranje na Vercel/production

**Koraci:**
1. Napravi promenu u aplikaciji

2. Promeni cache verziju:
   ```javascript
   const CACHE_NAME = 'air-quality-v7';
   ```

3. Commit i push:
   ```bash
   git add .
   git commit -m "feat: nova feature + v7"
   git push
   ```

4. Sačekaj Vercel deploy

5. Otvori aplikaciju u browseru (stara verzija)

6. NE REFRESH-uj stranicu

7. **✅ Rezultat:** Nakon ~60s videćeš update notifikaciju

8. Klikni "Ažuriraj sada"

9. **✅ Rezultat:** Nova verzija se učitava!

---

## Test Scenario 8: "Kasnije" Option Test

**Cilj:** Testirati šta se dešava kada korisnik klikne "Kasnije"

**Koraci:**
1. Izazovi update notifikaciju (bilo koji scenario)

2. Klikni "Kasnije" umesto "Ažuriraj sada"

3. **✅ Rezultat:** Notifikacija nestaje

4. Zatvori i ponovo otvori aplikaciju (ili refresh)

5. **✅ Rezultat:** Nova verzija se automatski aktivira

**Alternativa:**
- Ako korisnik ostavi aplikaciju otvorenu, može kasnije kliknuti na notifikaciju

---

## Test Scenario 9: Kompaktno Dugme Variant

**Cilj:** Testirati alternativnu UI komponentu

**Koraci:**
1. Otvori `app/layout.tsx`

2. Promeni:
   ```tsx
   // BILO:
   <PWAUpdatePrompt />
   
   // SADA:
   <PWAUpdateButton />
   ```

3. Sačuvaj i refresh aplikaciju

4. Izazovi update (promeni cache verziju)

5. **✅ Rezultat:** Umesto pune notifikacije, vidiš mali floating button u donjem desnom uglu

6. Klikni button

7. **✅ Rezultat:** Update se aktivira, reload

---

## Test Scenario 10: Custom Hook Test

**Cilj:** Napraviti custom update UI sa hook-om

**Koraci:**
1. Kreiraj novu test komponentu:
   ```tsx
   'use client';
   import { useServiceWorkerUpdate } from '@/lib/hooks/useServiceWorkerUpdate';
   
   export function MyUpdateComponent() {
     const { updateAvailable, updateServiceWorker } = useServiceWorkerUpdate();
     
     if (!updateAvailable) return null;
     
     return (
       <div style={{ background: 'red', color: 'white', padding: '10px' }}>
         Update dostupan!
         <button onClick={updateServiceWorker}>Ažuriraj</button>
       </div>
     );
   }
   ```

2. Dodaj u `app/layout.tsx` (umesto ili pored PWAUpdatePrompt)

3. Izazovi update

4. **✅ Rezultat:** Vidiš svoj custom UI!

5. Klikni dugme

6. **✅ Rezultat:** Update funkcioniše!

---

## Troubleshooting Test Scenarios

### TS1: Notifikacija se ne pojavljuje

**Debug koraci:**
1. Otvori `/test-sw`
2. Proveri "Service Worker" status → Trebalo bi "Registrovan"
3. Proveri "Update Status" → Da li kaže "Nova verzija dostupna"?
4. Otvori DevTools console → Traži greške
5. Otvori DevTools → Application → Service Workers
6. Vidi stanje service workera

**Fix:**
- Ako nema SW: Reload stranicu
- Ako nema update: Promeni cache verziju u `sw.js`
- Ako ima greške: Check konzolu i fix problem

---

### TS2: Update se ne aktivira

**Debug koraci:**
1. Otvori DevTools → Application → Service Workers
2. Da li vidiš "waiting" worker?
3. Otvori console
4. Klikni "Ažuriraj sada"
5. Vidi da li se šalje `SKIP_WAITING` poruka

**Fix:**
- Ako nema waiting workera: Promeni cache verziju
- Ako poruka ne radi: Proveri `sw.js` message listener
- Manuelno klikni "skipWaiting" u DevTools

---

### TS3: Infinite Reload Loop

**Debug koraci:**
1. Otvori DevTools → Application → Service Workers
2. Klikni "Unregister"
3. Otvori DevTools → Application → Clear storage
4. Klikni "Clear site data"
5. Reload stranicu

**Fix:**
- Proveri da `sw.js` NE poziva `skipWaiting()` u install event-u
- Proveri da nema automatskih update trigger-a

---

## Expected Behavior Summary

| Scenario | Expected Result | Time |
|----------|----------------|------|
| Cache version change | Update detected | ~10-60s |
| DevTools Update click | Immediate detection | <1s |
| Manual "Proveri za update" | Check runs | Instant |
| Click "Ažuriraj sada" | Page reloads | <2s |
| Click "Kasnije" | Notification closes | Instant |
| Multiple tabs | All tabs reload | <2s |
| Offline → Online | Update detects after reconnect | ~60s |

---

## Quick Reference Commands

```bash
# Pokreni dev server
npm run dev

# Otvori test stranicu
http://localhost:3000/test-sw

# Build za production
npm run build

# Preview production build
npm run start
```

---

**Srećno testiranje!** 🧪🚀

Ako nešto ne radi, pogledaj dokumentaciju ili proveri `/test-sw` stranicu!
