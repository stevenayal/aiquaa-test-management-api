# Despliegue en Railway

## Método 1: Usando Railway CLI (Recomendado)

### 1. Instalar Railway CLI (si no está instalado)

```powershell
npm install -g @railway/cli
```

### 2. Autenticar con Railway

```powershell
railway login
```

O con tu API key:

```powershell
$env:RAILWAY_TOKEN="758784cc-1be8-4fe2-80d2-e06718b2e5f8"
railway login --token $env:RAILWAY_TOKEN
```

### 3. Crear o conectar proyecto

```powershell
# Crear nuevo proyecto
railway init

# O si ya tienes un proyecto creado en Railway, enlazarlo:
railway link
```

### 4. Agregar servicio PostgreSQL

Railway puede agregar PostgreSQL automáticamente:

```powershell
railway add postgresql
```

O puedes agregarlo desde el dashboard de Railway.

### 5. Configurar variables de entorno

Desde el dashboard de Railway o con CLI:

```powershell
railway variables set JWT_SECRET="tu-secret-key-super-seguro-aqui"
railway variables set JWT_EXPIRES_IN="15m"
railway variables set JWT_REFRESH_EXPIRES_IN="7d"
railway variables set PORT="3000"
railway variables set NODE_ENV="production"
railway variables set CORS_ORIGIN="*"
railway variables set LOG_LEVEL="info"
```

**Importante**: Railway automáticamente inyecta `DATABASE_URL` cuando agregas PostgreSQL, pero asegúrate de que esté configurada como:

```
DATABASE_URL=${{Postgres.DATABASE_URL}}
```

### 6. Ejecutar migraciones

```powershell
railway run npm run migrate:prod
```

### 7. Desplegar

```powershell
railway up
```

O simplemente hacer push a tu repositorio conectado a Railway:

```powershell
git push
```

## Método 2: Desde el Dashboard de Railway

1. Ve a [railway.app](https://railway.app)
2. Inicia sesión
3. Click en "New Project"
4. Selecciona "Deploy from GitHub repo" (si tienes el repo en GitHub)
   - O "Empty Project" y luego "GitHub Repo"
5. Agrega el servicio PostgreSQL:
   - Click en "New" → "Database" → "Add PostgreSQL"
6. Configura las variables de entorno en "Variables"
7. Railway detectará automáticamente Node.js y ejecutará el build
8. Ejecuta migraciones desde "Deployments" → "Deploy Logs" o desde CLI:

```powershell
railway run npm run migrate:prod
```

## Configuración de Build

Railway detectará automáticamente que es un proyecto Node.js. Los archivos de configuración están listos:

- `railway.toml` - Configuración de Railway
- `.nixpacks.toml` - Configuración de build con Nixpacks

### Build Command

Railway ejecutará automáticamente:
```bash
npm install
npm run generate
npm run build
```

### Start Command

```bash
npm run start:prod
```

## Variables de Entorno Requeridas

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | URL de PostgreSQL (automática de Railway) | `${{Postgres.DATABASE_URL}}` |
| `JWT_SECRET` | Secret para JWT (cambiar en producción) | `tu-secret-super-seguro` |
| `JWT_EXPIRES_IN` | Expiración del access token | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Expiración del refresh token | `7d` |
| `PORT` | Puerto del servidor | `3000` |
| `NODE_ENV` | Entorno | `production` |
| `CORS_ORIGIN` | Origen CORS permitido | `*` o tu dominio |
| `LOG_LEVEL` | Nivel de logging | `info` |

## Health Check

Railway usará automáticamente:
- **Path**: `/api/health`
- **Timeout**: 100 segundos

## Ejecutar Migraciones en Producción

Después del primer deploy:

```powershell
railway run npm run migrate:prod
```

## Ejecutar Seed (Opcional)

Solo si quieres datos de demostración:

```powershell
railway run npm run seed
```

**Nota**: No ejecutes seed en producción a menos que sea necesario.

## Monitoreo

- Ver logs: `railway logs`
- Ver estado: `railway status`
- Ver métricas: Dashboard de Railway

## Troubleshooting

### Error: "DATABASE_URL not found"
- Verifica que el servicio PostgreSQL esté agregado
- Verifica que la variable esté configurada como `${{Postgres.DATABASE_URL}}`

### Error: "Migration failed"
- Ejecuta manualmente: `railway run npm run migrate:prod`

### Build falla
- Verifica que todas las dependencias estén en `package.json`
- Revisa los logs: `railway logs`

## URL del Proyecto

Después del deploy, Railway te dará una URL como:
```
https://aiquaa-test-management-api-production.up.railway.app
```

La documentación Swagger estará en:
```
https://tu-url.railway.app/api/docs
```

