# TypeScript Validation Checklist

## ✅ PRE SVAKOG COMMIT-A

```powershell
# UVEK pokreni ovu komandu!
npm run check
```

## ✅ PRE SVAKOG PUSH-A

```powershell
# OBAVEZNO pokreni punu validaciju!
npm run pre-push
```

## 🚨 PRAVILA

1. **NIKAD ne push-uj bez validacije**
2. **NIKAD ne ignoriši TypeScript greške**
3. **UVEK testiraj build lokalno**

## 🔥 Brzi workflow

```powershell
# 1. Proveravaj tipove dok radiš
npm run check

# 2. Pre commit-a - validate
npm run validate

# 3. Pre push-a - FULL check
npm run pre-push

# 4. Ako sve OK - push
git push
```

---

**Zapamti: 5 minuta lokalne provere = 0 grešaka na Vercel-u!** 🎯
