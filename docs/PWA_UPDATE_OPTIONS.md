# PWA Update - Dodatne Opcije i Konfiguracija

## 🎨 Stilske Opcije

### Opcija 1: Puna Notifikacija (Default - trenutno aktivna)

```tsx
// app/layout.tsx
<PWAUpdatePrompt />
```

**Features:**
- Velika, lepa notifikacija
- Bullet points sa features
- Gradient header
- Dugmad "Ažuriraj sada" i "Kasnije"

**Pozicija:** Centrirana na dnu ekrana

---

### Opcija 2: Kompaktno Dugme

```tsx
// app/layout.tsx - zameni PWAUpdatePrompt sa:
<PWAUpdateButton />
```

**Features:**
- Mali floating button
- Ikonica + tekst
- Minimalistički dizajn

**Pozicija:** Donji desni ugao (bottom-20 right-6)

---

### Opcija 3: Custom komponenta sa hook-om

```tsx
import { useServiceWorkerUpdate } from '@/lib/hooks/useServiceWorkerUpdate';

function MyUpdateComponent() {
  const { updateAvailable, updateServiceWorker } = useServiceWorkerUpdate();
  
  if (!updateAvailable) return null;
  
  return (
    <div className="my-custom-style">
      <button onClick={updateServiceWorker}>
        Update App
      </button>
    </div>
  );
}
```

**Features:**
- Potpuna kontrola nad UI-em
- Integrisano u tvoj dizajn
- Koristi postojeći hook

**Primeri:** Pogledaj `components/pwa/UpdateExamples.tsx`

---

## ⚙️ Konfiguracija

### 1. Frekvencija Provere za Update

**Lokacija:** `components/pwa/PWAUpdatePrompt.tsx` ili `lib/hooks/useServiceWorkerUpdate.ts`

```typescript
// Default: svakih 60 sekundi
setInterval(() => {
  registration.update();
}, 60000);

// Opcije:
30000  // 30 sekundi - češće provere
120000 // 2 minuta - ređe provere
300000 // 5 minuta - retko
```

**Kada koristiti šta:**
- **30s-60s:** Production aplikacije sa čestim update-ima
- **2-5min:** Stabilne aplikacije sa ređim update-ima
- **Custom:** Event-driven (samo kada korisnik klikne refresh)

---

### 2. Cache Verzionisanje

**Lokacija:** `public/sw.js`

```javascript
// Ručno verzionisanje
const CACHE_NAME = 'air-quality-v5';
const RUNTIME_CACHE = 'air-quality-runtime-v5';

// Automatsko verzionisanje (preporučeno)
const VERSION = '1.0.5'; // iz package.json
const CACHE_NAME = `air-quality-v${VERSION}`;
const RUNTIME_CACHE = `air-quality-runtime-v${VERSION}`;
```

**Best Practice:**
- Promeni verziju sa svakim production deploy-om
- Koristi semantic versioning (1.0.0, 1.0.1, itd.)
- Dokumentuj promene u CHANGELOG.md

---

### 3. Timing Notifikacije

**Kada prikazati notifikaciju:**

```typescript
// PWAUpdatePrompt.tsx

// Opcija A: Odmah
setShowPrompt(true);

// Opcija B: Posle X sekundi (default: 3s)
setTimeout(() => {
  setShowPrompt(true);
}, 3000);

// Opcija C: Na neki event (npr. scroll, click)
document.addEventListener('scroll', () => {
  if (!hasShown) {
    setShowPrompt(true);
    setHasShown(true);
  }
}, { once: true });

// Opcija D: Nakon određenog vremena na stranici
setTimeout(() => {
  if (userIsActive) {
    setShowPrompt(true);
  }
}, 30000); // Posle 30s aktivnosti
```

---

### 4. Animacije

**Framer Motion variants:**

```typescript
// Customize u PWAUpdatePrompt.tsx

// Default - slide up
initial={{ opacity: 0, y: 50 }}
animate={{ opacity: 1, y: 0 }}
exit={{ opacity: 0, y: 50 }}

// Opcija 2 - fade in
initial={{ opacity: 0 }}
animate={{ opacity: 1 }}
exit={{ opacity: 0 }}

// Opcija 3 - slide from side
initial={{ opacity: 0, x: 100 }}
animate={{ opacity: 1, x: 0 }}
exit={{ opacity: 0, x: 100 }}

// Opcija 4 - scale
initial={{ opacity: 0, scale: 0.8 }}
animate={{ opacity: 1, scale: 1 }}
exit={{ opacity: 0, scale: 0.8 }}
```

---

### 5. Browser Notifikacije (Opciono)

**Dodaj u layout.tsx:**

```tsx
import { PWAUpdateNotification } from '@/lib/hooks/useBrowserNotification';

// U body
<PWAUpdateNotification />
```

**NAPOMENA:** Ovo je invazivno - koristi samo ako korisnik eksplicitno dozvoli.

**Kako koristiti:**
1. Traži permission samo kada korisnik klikne dugme
2. Ne spam-uj notifikacijama
3. Koristi samo za važne update-e

---

## 🎯 Strategije Update-ovanja

### Strategija 1: Agresivna (trenutno)

```typescript
// Automatski aktiviraj update
self.skipWaiting(); // u install event-u
```

**Prednosti:**
- Korisnici uvek imaju najnoviju verziju
- Brza distribucija bug fix-eva

**Mane:**
- Može prekinuti korisnika usred rada
- Može izgubiti nesačuvan rad

---

### Strategija 2: Soft (preporučeno za production)

```typescript
// Ne aktiviraj automatski
// Čekaj da korisnik klikne "Ažuriraj"

// U install event-u NEMOJ self.skipWaiting()
// Samo u message listener:
self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
```

**Prednosti:**
- Korisnik bira kada ažurirati
- Ne prekida rad
- Bolje UX

**Mane:**
- Neki korisnici možda nikad ne ažuriraju
- Moraš podržavati starije verzije

---

### Strategija 3: Timing-based

```typescript
// Ažuriraj samo noću ili kada korisnik nije aktivan

const isNightTime = () => {
  const hour = new Date().getHours();
  return hour >= 22 || hour <= 6; // 10pm - 6am
};

if (isNightTime()) {
  self.skipWaiting();
} else {
  // Prikaži notifikaciju
}
```

---

## 📱 Mobile Considerations

### Za mobilne uređaje:

1. **Pozicija notifikacije:**
   ```tsx
   // Mobile-first
   className="fixed bottom-0 left-0 right-0 p-4"
   
   // Desktop-optimized
   className="fixed bottom-6 left-1/2 -translate-x-1/2 max-w-md"
   ```

2. **Touch gestures:**
   ```tsx
   // Swipe to dismiss
   <motion.div
     drag="y"
     dragConstraints={{ top: 0, bottom: 0 }}
     onDragEnd={(e, { offset }) => {
       if (offset.y > 50) handleDismiss();
     }}
   />
   ```

3. **Reduced motion:**
   ```tsx
   const prefersReducedMotion = window.matchMedia(
     '(prefers-reduced-motion: reduce)'
   ).matches;
   
   <motion.div
     animate={prefersReducedMotion ? {} : { y: 0 }}
   />
   ```

---

## 🧪 Testing Opcije

### Development Mode

```typescript
// Force update detection
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    registration.update();
  }, 5000); // Svakih 5 sekundi u dev-u
}
```

### Debug Mode

```typescript
// Omogući debug log-ove
const DEBUG = true;

if (DEBUG) {
  console.log('[SW Update] Registration:', registration);
  console.log('[SW Update] Update available:', updateAvailable);
}
```

---

## 🔒 Security & Privacy

1. **HTTPS Only:** Service Workers rade samo preko HTTPS-a
2. **Same Origin:** SW može kontrolisati samo isti origin
3. **User Permission:** Ne traži browser notifikacije bez razloga
4. **Data Privacy:** Ne šalji tracking info sa update-ima

---

## 📊 Analytics (Opciono)

Track update events:

```typescript
const handleUpdate = () => {
  // Analytics event
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'sw_update', {
      event_category: 'PWA',
      event_label: 'User initiated update',
    });
  }
  
  updateServiceWorker();
};
```

---

## 🎨 Styling Customization

### Promeni boje:

```tsx
// U PWAUpdatePrompt.tsx

// Default gradient
className="bg-gradient-to-r from-primary-500 to-accent-500"

// Custom gradients:
className="bg-gradient-to-r from-blue-500 to-purple-500"
className="bg-gradient-to-r from-green-500 to-teal-500"
className="bg-gradient-to-r from-orange-500 to-red-500"
```

### Dark mode variants:

```tsx
className="bg-white dark:bg-dark-800"
className="text-neutral-900 dark:text-white"
className="border-neutral-200 dark:border-neutral-700"
```

---

## 💡 Tips & Tricks

1. **Kombinuj više pristupa:**
   ```tsx
   <PWAUpdatePrompt />        {/* Za desktop */}
   <PWAUpdateButton />         {/* Za mobile */}
   ```

2. **Conditional rendering:**
   ```tsx
   {isMobile ? <PWAUpdateButton /> : <PWAUpdatePrompt />}
   ```

3. **A/B Testing:**
   ```tsx
   const variant = Math.random() > 0.5;
   {variant ? <PWAUpdatePrompt /> : <PWAUpdateButton />}
   ```

---

**Za više info pogledaj:**
- `docs/PWA_UPDATE.md` - Tehnička dokumentacija
- `docs/PWA_UPDATE_QUICKSTART.md` - Quick start guide
- `/test-sw` - Live test panel
