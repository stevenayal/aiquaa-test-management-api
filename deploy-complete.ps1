# Script completo de despliegue en Railway
# Ejecuta esto DESPUÉS de hacer: railway login

$ErrorActionPreference = "Continue"

Write-Host "`n🚂 DESPLIEGUE COMPLETO EN RAILWAY" -ForegroundColor Cyan
Write-Host "=================================`n" -ForegroundColor Cyan

# Verificar autenticación
Write-Host "1️⃣  Verificando autenticación..." -ForegroundColor Yellow
$whoami = railway whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ No estás autenticado. Ejecuta primero: railway login" -ForegroundColor Red
    exit 1
}
Write-Host "✅ $whoami" -ForegroundColor Green

# Crear o verificar proyecto
Write-Host "`n2️⃣  Configurando proyecto..." -ForegroundColor Yellow
if (-not (Test-Path .railway)) {
    Write-Host "   Creando nuevo proyecto..." -ForegroundColor Gray
    railway init --name aiquaa-test-management-api
} else {
    Write-Host "   Proyecto ya existe, vinculando..." -ForegroundColor Gray
    railway link
}

# Agregar PostgreSQL
Write-Host "`n3️⃣  Agregando PostgreSQL..." -ForegroundColor Yellow
railway add postgresql

# Configurar variables de entorno
Write-Host "`n4️⃣  Configurando variables de entorno..." -ForegroundColor Yellow

$variables = @{
    "JWT_SECRET" = "change-me-in-production-very-secure-secret-key-$(Get-Random -Minimum 100000 -Maximum 999999)"
    "JWT_EXPIRES_IN" = "15m"
    "JWT_REFRESH_EXPIRES_IN" = "7d"
    "PORT" = "3000"
    "NODE_ENV" = "production"
    "CORS_ORIGIN" = "*"
    "LOG_LEVEL" = "info"
}

foreach ($var in $variables.GetEnumerator()) {
    Write-Host "   Configurando $($var.Key)..." -ForegroundColor Gray
    railway variables set "$($var.Key)=$($var.Value)"
}

# Ejecutar migraciones
Write-Host "`n5️⃣  Ejecutando migraciones..." -ForegroundColor Yellow
railway run npm run migrate:prod

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migraciones completadas" -ForegroundColor Green
} else {
    Write-Host "⚠️  Error en migraciones. Verifica los logs." -ForegroundColor Yellow
}

# Desplegar
Write-Host "`n6️⃣  Desplegando aplicación..." -ForegroundColor Yellow
railway up

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Despliegue iniciado" -ForegroundColor Green
} else {
    Write-Host "⚠️  Error en despliegue. Verifica los logs." -ForegroundColor Yellow
}

# Mostrar información
Write-Host "`n📊 Información del proyecto:" -ForegroundColor Cyan
railway status

Write-Host "`n📝 Próximos pasos:" -ForegroundColor Yellow
Write-Host "   - Ver logs: railway logs" -ForegroundColor White
Write-Host "   - Ver estado: railway status" -ForegroundColor White
Write-Host "   - Abrir dashboard: railway open" -ForegroundColor White

Write-Host "`n✅ ¡Despliegue completado!`n" -ForegroundColor Green

