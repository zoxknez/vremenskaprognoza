# PWA Update Mehanizam

## Kako radi

Aplikacija sada automatski detektuje kada je dostupna nova verzija i prikazuje korisniku elegantnu notifikaciju sa mogućnošću instant ažuriranja.

## Komponente

### PWAUpdatePrompt

Glavna komponenta koja prikazuje UI notifikaciju kada je dostupan update.

**Features:**
- Automatska detekcija nove verzije
- Animirana notifikacija na dnu ekrana
- Dugme za instant ažuriranje
- Opcija "Kasnije" za korisnika
- Auto-reload nakon ažuriranja

### useServiceWorkerUpdate Hook

Reusable hook za detektovanje i upravljanje Service Worker update-ima.

**API:**
```typescript
const {
  updateAvailable,      // boolean - da li je dostupan update
  updateServiceWorker,  // () => void - funkcija za aktivaciju novog SW
  checkForUpdate,       // () => void - manuelno proveri za update
  registration          // ServiceWorkerRegistration | null
} = useServiceWorkerUpdate();
```

## Kako testirati

### Metoda 1: Promena verzije cache-a

1. Otvori aplikaciju u browseru
2. Otvori `public/sw.js`
3. Promeni verziju cache-a (npr. sa `v5` na `v6`):
   ```javascript
   const CACHE_NAME = 'air-quality-v6';
   const RUNTIME_CACHE = 'air-quality-runtime-v6';
   ```
4. Deploy-uj ili refreš-uj (ako je u dev mode-u)
5. Posle 60 sekundi (ili odmah ako reloaduješ), videćeš update notifikaciju

### Metoda 2: Manuelno testiranje sa Chrome DevTools

1. Otvori aplikaciju
2. Otvori Chrome DevTools (F12)
3. Idi na **Application** tab
4. U levom meniju klikni na **Service Workers**
5. Promeni kod u `sw.js` fajlu
6. U DevTools-u klikni na **Update** dugme pored service workera
7. Trebalo bi da vidiš novi service worker u "waiting" stanju
8. Update notifikacija će se pojaviti automatski

### Metoda 3: Deployment test

1. Deploy aplikaciju na Vercel/hosting
2. Posle nekog vremena napravi promenu i deploy-uj novu verziju
3. Korisnici koji imaju otvorenu aplikaciju će dobiti notifikaciju za update

## Konfiguracija

### Frekvencija provere za update

U `PWAUpdatePrompt.tsx` i `useServiceWorkerUpdate.ts`, interval je podešen na 60 sekundi:

```typescript
setInterval(() => {
  registration.update();
}, 60000); // 60000ms = 1 minut
```

Možeš da promeniš ovu vrednost prema potrebi.

### Cache verzije

U `public/sw.js`:

```javascript
const CACHE_NAME = 'air-quality-v5';
const RUNTIME_CACHE = 'air-quality-runtime-v5';
```

Svaki put kada promeniš ove verzije, korisnici će dobiti notifikaciju za update.

## Service Worker Update Workflow

1. **Nova verzija deploy-ovana** → Service Worker detektuje promene
2. **Novi SW se instalira** → Ostaje u "waiting" stanju
3. **Komponenta detektuje waiting SW** → Prikazuje notifikaciju
4. **Korisnik klikne "Ažuriraj"** → Šalje `SKIP_WAITING` poruku
5. **SW preuzima kontrolu** → Trigger `controllerchange` event
6. **Stranica se reload-uje** → Korisnik vidi novu verziju

## Best Practices

1. **Verzionisanje**: Uvek promeni cache verziju kada push-uješ nove promene
2. **Testing**: Testiraj update flow pre production deploy-a
3. **User Experience**: Notifikacija se pojavljuje nenametljivo na dnu ekrana
4. **Offline Support**: Update funkcioniše čak i kada korisnik ide offline pa online

## Troubleshooting

### Update notifikacija se ne pojavljuje

1. Proveri da li je Service Worker registrovan (DevTools → Application → Service Workers)
2. Proveri konzolu za greške
3. Obriši cache i reload (DevTools → Application → Clear storage)

### Infinite reload loop

Ako se stranica reload-uje beskonačno:
1. Unregister Service Worker u DevTools
2. Obriši cache
3. Reload stranicu
4. Fix-uj problem u kodu

### Update ne aktivira novu verziju

Proveri da li Service Worker prima `SKIP_WAITING` poruku:
```javascript
// U sw.js
self.addEventListener('message', (event) => {
  console.log('Primio poruku:', event.data);
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
```
