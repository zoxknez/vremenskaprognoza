# Pre-Push Validation Scripts

## 🚀 Kako koristiti

### Pre svakog push-a:

```powershell
# Pokreni KOMPLETNU validaciju (TypeScript + ESLint + Build)
.\scripts\pre-push.ps1

# Ili koristi npm skriptu
npm run pre-push
```

### Tokom development-a:

```powershell
# Brza TypeScript provera
.\scripts\check-types.ps1

# Ili
npm run check
```

### Sve validacije zajedno:

```powershell
npm run validate
```

## 📋 Šta se proverava?

### 1. TypeScript Type Check
- Proverava sve TypeScript tipove
- **Mora** proći pre push-a
- Sprečava build greške na Vercel-u

### 2. ESLint
- Proverava code quality
- Detektuje probleme u kodu
- Sprečava runtime greške

### 3. Build Test
- Pravi production build
- Testira da li će Vercel build uspeti
- **Najvažnija provera!**

## ⚠️ VAŽNO

**NIKAD ne push-uj bez ovih provera!**

```powershell
# ❌ LOŠE - push bez provere
git push

# ✅ DOBRO - prvo proveri, pa push
npm run pre-push
git push
```

## 🔧 Git Workflow

```powershell
# 1. Napravi izmene
# ... code, code, code ...

# 2. Proveri tipove tokom rada
npm run check

# 3. Kad završiš, kompletna validacija
npm run pre-push

# 4. Ako sve prođe, commit i push
git add .
git commit -m "Your message"
git push
```

## 💡 Brzi command

Kreiraj alias u PowerShell profilu:

```powershell
# Dodaj u $PROFILE
function gpush {
    npm run pre-push
    if ($LASTEXITCODE -eq 0) {
        git push
    }
}
```

Sad samo kucaj `gpush` umesto `git push`!

## 🎯 Cilj

**0 TypeScript grešaka na Vercel-u!**

Sve greške hvatamo lokalno pre push-a. 🛡️
