# Script de despliegue usando Railway API
$RAILWAY_TOKEN = "758784cc-1be8-4fe2-80d2-e06718b2e5f8"

Write-Host "🚂 Iniciando despliegue en Railway..." -ForegroundColor Cyan

# Headers para Railway API
$headers = @{
    "Authorization" = "Bearer $RAILWAY_TOKEN"
    "Content-Type" = "application/json"
}

# Verificar autenticación
Write-Host "`n🔐 Verificando autenticación..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "https://api.railway.app/v1/user" -Headers $headers -Method GET
    Write-Host "✅ Autenticado como: $($response.email)" -ForegroundColor Green
} catch {
    Write-Host "❌ Error de autenticación. Verifica tu token." -ForegroundColor Red
    Write-Host "   El token debe ser un Personal Access Token, no un Project Token" -ForegroundColor Yellow
    exit 1
}

# Listar proyectos existentes
Write-Host "`n📋 Proyectos existentes:" -ForegroundColor Yellow
try {
    $projects = Invoke-RestMethod -Uri "https://api.railway.app/v1/projects" -Headers $headers -Method GET
    if ($projects.projects) {
        foreach ($project in $projects.projects) {
            Write-Host "   - $($project.name) (ID: $($project.id))" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "   No se pudieron listar proyectos" -ForegroundColor Yellow
}

Write-Host "`n📝 Para completar el despliegue, ejecuta estos comandos manualmente:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. railway login" -ForegroundColor White
Write-Host "2. railway init" -ForegroundColor White  
Write-Host "3. railway add postgresql" -ForegroundColor White
Write-Host "4. railway variables set JWT_SECRET=`"tu-secret`"" -ForegroundColor White
Write-Host "5. railway run npm run migrate:prod" -ForegroundColor White
Write-Host "6. railway up" -ForegroundColor White
Write-Host ""
Write-Host "O usa el dashboard de Railway: https://railway.app" -ForegroundColor Cyan

