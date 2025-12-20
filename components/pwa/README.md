# PWA Components

Ovaj folder sadrži sve PWA (Progressive Web App) komponente za VremeVazduh aplikaciju.

## 📦 Komponente

### Install Components
- **PWAInstallButton** - Dugme za instalaciju PWA
- **PWAInstallPrompt** - Prompt za instalaciju PWA

### Update Components ⭐ NEW
- **PWAUpdatePrompt** - Notifikacija za update aplikacije (trenutno aktivna)
- **PWAUpdateButton** - Kompaktno dugme za update
- **AppVersion** - Prikaz verzije aplikacije

### Examples
- **UpdateExamples** - Primeri custom update komponenti

## 🚀 Trenutno Aktivno

U `app/layout.tsx` je aktivna `PWAUpdatePrompt` komponenta koja automatski detektuje i prikazuje notifikaciju kada je dostupna nova verzija aplikacije.

## 📚 Dokumentacija

Za detaljnu dokumentaciju pogledaj:
- `docs/PWA_UPDATE_QUICKSTART.md` - Brzi start
- `docs/PWA_UPDATE.md` - Kompletna dokumentacija
- `docs/PWA_UPDATE_OPTIONS.md` - Opcije i konfiguracija
- `/test-sw` - Live test stranica

## 💡 Kako koristiti

```tsx
// Import sa barrel export
import { PWAUpdatePrompt, PWAUpdateButton, AppVersion } from '@/components/pwa';

// Ili pojedinačno
import { PWAUpdatePrompt } from '@/components/pwa/PWAUpdatePrompt';
```

## 🎯 Quick Actions

- **Test update:** Idi na `/test-sw`
- **Promeni verziju:** Otvori `public/sw.js` i promeni `CACHE_NAME`
- **Vidi notifikaciju:** Sačekaj 60s ili reload

---

Za više informacija pogledaj dokumentaciju! 🚀
