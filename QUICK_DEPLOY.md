# 🚀 Despliegue Rápido en Railway

## Pasos Rápidos

### 1. Autenticar con Railway

Ejecuta en PowerShell:

```powershell
railway login
```

Esto abrirá el navegador para autenticarte.

### 2. Crear/Conectar Proyecto

```powershell
railway init
```

O si ya tienes un proyecto:
```powershell
railway link
```

### 3. Agregar PostgreSQL

```powershell
railway add postgresql
```

### 4. Configurar Variables de Entorno

Copia y pega todos estos comandos:

```powershell
railway variables set JWT_SECRET="cambia-este-secret-en-produccion-123456789"
railway variables set JWT_EXPIRES_IN="15m"
railway variables set JWT_REFRESH_EXPIRES_IN="7d"
railway variables set PORT="3000"
railway variables set NODE_ENV="production"
railway variables set CORS_ORIGIN="*"
railway variables set LOG_LEVEL="info"
```

**Importante**: Railway configura automáticamente `DATABASE_URL` cuando agregas PostgreSQL.

### 5. Ejecutar Migraciones

```powershell
railway run npm run migrate:prod
```

### 6. Desplegar

```powershell
railway up
```

O simplemente hacer push a tu repo conectado a Railway:

```powershell
git add .
git commit -m "Initial deploy"
git push
```

## ✅ Verificar Despliegue

Después del deploy, Railway te dará una URL. Verifica:

- **Health**: `https://tu-url.railway.app/api/health`
- **Swagger**: `https://tu-url.railway.app/api/docs`

## 📝 Notas

- Railway detectará automáticamente Node.js y ejecutará el build
- El archivo `railway.toml` está configurado correctamente
- Las migraciones se deben ejecutar manualmente la primera vez
- Para ver logs: `railway logs`
- Para ver estado: `railway status`

