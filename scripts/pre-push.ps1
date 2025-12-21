#!/usr/bin/env pwsh
# Pre-push validation script
# Run this before every git push to catch errors early

Write-Host "🔍 Running pre-push validation..." -ForegroundColor Cyan
Write-Host ""

# 1. TypeScript Type Check
Write-Host "📘 Checking TypeScript types..." -ForegroundColor Yellow
npm run type-check
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ TypeScript type check FAILED!" -ForegroundColor Red
    Write-Host "Fix the type errors before pushing." -ForegroundColor Red
    exit 1
}
Write-Host "✅ TypeScript types OK" -ForegroundColor Green
Write-Host ""

# 2. Build Check
Write-Host "🏗️  Building project..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Build FAILED!" -ForegroundColor Red
    Write-Host "Fix the build errors before pushing." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build successful" -ForegroundColor Green
Write-Host ""

Write-Host "🎉 All checks passed! Safe to push." -ForegroundColor Green
Write-Host ""
