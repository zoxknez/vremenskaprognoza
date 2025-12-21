#!/usr/bin/env pwsh
# Quick TypeScript type check
# Run this frequently during development

Write-Host "🔍 TypeScript Type Check" -ForegroundColor Cyan
Write-Host ""

npm run type-check

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ Type errors found!" -ForegroundColor Red
    exit 1
} else {
    Write-Host ""
    Write-Host "✅ No type errors!" -ForegroundColor Green
}
