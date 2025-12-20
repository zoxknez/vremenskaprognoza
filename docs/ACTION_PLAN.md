# 🎯 Akcioni Plan - Prioritizovani Taskovi

## 🔴 KRITIČNO - Implementiraj Odmah (Danas/Sutra)

### 1. Logger Utility (2 sata)
**Problem:** 50+ console.log poziva u production build-u  
**Impact:** Performance, Security, Professionalism

**Tasks:**
```bash
- [ ] Kreiraj lib/utils/logger.ts
- [ ] Implement conditional logging
- [ ] Replace sve console.* pozive (global search/replace)
- [ ] Test u dev i production mode
- [ ] Commit i push
```

**Fajlovi za update:** 20+ fajlova sa console.*

---

### 2. Environment Variables Validation (2 sata)
**Problem:** API keys bez validacije, security rizik  
**Impact:** Security, Reliability

**Tasks:**
```bash
- [ ] Kreiraj lib/config/env.ts sa Zod schema
- [ ] Validate sve env variables na startup
- [ ] Type-safe getApiKey helper funkcija
- [ ] Update sve API fajlove da koriste helper
- [ ] Kreiraj .env.example sa svim keys
- [ ] Dokumentuj setup u README
```

**Fajlovi za update:** 15+ API fajlova

---

## 🟠 VAŽNO - Ova Nedelja

### 3. Cleanup Duplicated Code (30 minuta)
**Problem:** 3 verzije favorites logike  
**Impact:** Maintainability, Consistency

**Tasks:**
```bash
- [ ] Odluči: Zustand store ILI custom hook
- [ ] Obriši neiskorišćene fajlove:
    - hooks/useFavorites.ts (stari)
    - lib/hooks/useFavorites.ts (ako koristiš Zustand)
    - lib/stores/favoritesStore.ts (ako koristiš hook)
- [ ] Update imports u svim komponentama
- [ ] Test da sve radi
```

**Preporuka:** Zadrži Zustand store (lib/stores/favoritesStore.ts)

---

### 4. Error Boundaries (2 sata)
**Problem:** Nema zaštite od component crashes  
**Impact:** Stability, UX

**Tasks:**
```bash
- [ ] Kreiraj components/common/ErrorBoundary.tsx
- [ ] Wrap kritične komponente:
    - LeafletMap
    - Chart komponente (AirQualityChart, ForecastChart)
    - WeatherCard komponente
- [ ] Test error handling
- [ ] Dodaj error reporting (opciono)
```

---

### 5. Security Headers & Rate Limiting (1 sat)
**Problem:** API routes nemaju rate limiting  
**Impact:** Security, Cost

**Tasks:**
```bash
- [ ] Install @upstash/ratelimit (ili alternative)
- [ ] Kreiraj middleware.ts za rate limiting
- [ ] Apply rate limits na /api/* routes
- [ ] Test sa Postman/curl
```

---

## 🟡 SREDNJI PRIORITET - Sledeća 2 Nedelje

### 6. Unified API Error Handling (3 sata)
**Tasks:**
```bash
- [ ] Kreiraj lib/api/error-handler.ts
- [ ] APIError class
- [ ] handleAPIRequest wrapper funkcija
- [ ] Update sve API fajlove
- [ ] Add error tracking integration (Sentry)
```

---

### 7. TypeScript Improvements (1 sat)
**Tasks:**
```bash
- [ ] Find all 'any' types
- [ ] Replace sa proper interfaces
- [ ] Add missing type definitions
- [ ] Enable strict mode u tsconfig.json
```

---

### 8. Performance Optimizations (2 sata)
**Tasks:**
```bash
- [ ] Add blur placeholders na images
- [ ] Add priority flag na hero images
- [ ] Implement dynamic imports za heavy komponente
- [ ] Add loading skeletons
- [ ] Run Lighthouse audit
```

---

### 9. Accessibility Audit (2 sata)
**Tasks:**
```bash
- [ ] Add ARIA labels gde nedostaju
- [ ] Improve keyboard navigation
- [ ] Better focus indicators
- [ ] Test sa screen reader
- [ ] Run axe DevTools audit
```

---

## 🟢 NIZAK PRIORITET - Dugoročno (1 Mesec+)

### 10. Testing Setup (ongoing)
**Tasks:**
```bash
- [ ] Install Vitest + Testing Library
- [ ] Setup test config
- [ ] Write tests za utilities (aqi.ts, format.ts)
- [ ] Write tests za hooks
- [ ] Write tests za components
- [ ] Add CI/CD test automation
```

---

### 11. Documentation (ongoing)
**Tasks:**
```bash
- [ ] API documentation
- [ ] Component documentation (Storybook?)
- [ ] Architecture diagrams
- [ ] Deployment guide
- [ ] Contributing guide
```

---

### 12. Monitoring & Analytics (1 sat setup)
**Tasks:**
```bash
- [ ] Setup Sentry error tracking
- [ ] Add performance monitoring
- [ ] Track Web Vitals
- [ ] Add API response time tracking
- [ ] Create monitoring dashboard
```

---

## ✅ Quick Wins (< 30 min svaki)

Ove možeš uraditi odmah za brze rezultate:

```bash
☐ npm audit fix                    # Fix vulnerabilities (15min)
☐ Dodaj .env.example fajl          # Documentation (10min)
☐ Dodaj blur na hero images        # Performance (15min)
☐ Fix hardcoded strings → i18n     # I18n (20min)
☐ Add priority na main images      # Performance (10min)
☐ Improve focus indicators         # A11y (15min)
☐ Add loading states               # UX (20min)
```

---

## 📊 Progress Tracking

### Week 1 (20-27 Dec)
- [ ] Logger utility ✅
- [ ] Env validation ✅
- [ ] Cleanup duplicates ✅
- [ ] Error boundaries ✅

### Week 2 (27 Dec - 3 Jan)
- [ ] API error handling
- [ ] TypeScript improvements
- [ ] Performance optimizations

### Week 3-4 (Jan)
- [ ] Testing setup
- [ ] Accessibility improvements
- [ ] Documentation

---

## 🎯 Success Metrics

Po završetku:
- ✅ Nema console.log u production
- ✅ Sve env vars validirane
- ✅ Error boundaries na kritičnim komponentama
- ✅ Unified error handling
- ✅ TypeScript strict mode enabled
- ✅ Lighthouse score > 90
- ✅ No security vulnerabilities
- ✅ Test coverage > 60%

---

## 🚀 Kako Početi

1. **Izaberi prvi task** (preporuka: Logger utility)
2. **Kreiraj branch** (`git checkout -b fix/logger-utility`)
3. **Implementiraj**
4. **Test**
5. **Commit & Push**
6. **Ponovi za sledeći task**

---

**Koji task želiš da uradimo prvi?** 🎯

Mogu ti pomoći da implementiraš bilo koji od ovih fix-eva! Samo reci koji je prioritet.
