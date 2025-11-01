# Railway Deployment Script
# Ejecuta este script para desplegar a Railway

$ErrorActionPreference = "Stop"

Write-Host "🚂 Desplegando AIQUAA Test Management API a Railway..." -ForegroundColor Cyan

# API Key de Railway
$RAILWAY_TOKEN = "758784cc-1be8-4fe2-80d2-e06718b2e5f8"

# Configurar token como variable de entorno
$env:RAILWAY_TOKEN = $RAILWAY_TOKEN

Write-Host "📦 Verificando Railway CLI..." -ForegroundColor Yellow
railway --version

Write-Host "🔐 Autenticando con Railway..." -ForegroundColor Yellow
# Intentar login con token
try {
    railway login --token $RAILWAY_TOKEN
    Write-Host "✅ Autenticado correctamente" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Login con token falló, intenta ejecutar manualmente: railway login" -ForegroundColor Yellow
    Write-Host "   O desde el navegador: https://railway.app/account/tokens" -ForegroundColor Yellow
}

Write-Host "`n📋 Pasos siguientes para completar el despliegue:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Autentica con Railway:" -ForegroundColor White
Write-Host "   railway login" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Crea o conecta un proyecto:" -ForegroundColor White
Write-Host "   railway init" -ForegroundColor Gray
Write-Host "   # O si ya tienes proyecto:" -ForegroundColor Gray
Write-Host "   railway link" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Agrega PostgreSQL:" -ForegroundColor White
Write-Host "   railway add postgresql" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Configura variables de entorno:" -ForegroundColor White
Write-Host "   railway variables set JWT_SECRET=`"tu-secret-super-seguro`"" -ForegroundColor Gray
Write-Host "   railway variables set JWT_EXPIRES_IN=`"15m`"" -ForegroundColor Gray
Write-Host "   railway variables set JWT_REFRESH_EXPIRES_IN=`"7d`"" -ForegroundColor Gray
Write-Host "   railway variables set PORT=`"3000`"" -ForegroundColor Gray
Write-Host "   railway variables set NODE_ENV=`"production`"" -ForegroundColor Gray
Write-Host "   railway variables set CORS_ORIGIN=`"*`"" -ForegroundColor Gray
Write-Host "   railway variables set LOG_LEVEL=`"info`"" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Ejecuta migraciones:" -ForegroundColor White
Write-Host "   railway run npm run migrate:prod" -ForegroundColor Gray
Write-Host ""
Write-Host "6. Despliega:" -ForegroundColor White
Write-Host "   railway up" -ForegroundColor Gray
Write-Host ""
Write-Host "📚 Para más detalles, consulta DEPLOY_RAILWAY.md" -ForegroundColor Cyan

