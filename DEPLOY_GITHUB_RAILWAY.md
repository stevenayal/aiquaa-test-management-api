# 🚂 Despliegue Automático a Railway via GitHub

Esta guía explica cómo configurar el despliegue automático a Railway cuando hagas push a GitHub.

## 📋 Prerrequisitos

1. ✅ Tener el proyecto en un repositorio de GitHub
2. ✅ Tener una cuenta en Railway
3. ✅ Tener Railway CLI instalado localmente (opcional, para setup inicial)

## 🔧 Configuración Paso a Paso

### Paso 1: Configurar Railway

1. **Inicia sesión en Railway**:
   ```powershell
   railway login
   ```

2. **Crea un proyecto nuevo** (si no lo tienes):
   ```powershell
   railway init
   ```
   O conecta un proyecto existente:
   ```powershell
   railway link
   ```

3. **Agrega PostgreSQL**:
   ```powershell
   railway add postgresql
   ```

4. **Configura las variables de entorno en Railway**:
   - Ve al dashboard de Railway: https://railway.app
   - Selecciona tu proyecto
   - Ve a "Variables"
   - Agrega estas variables:

   ```
   JWT_SECRET=tu-secret-super-seguro-aqui
   JWT_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d
   PORT=3000
   NODE_ENV=production
   CORS_ORIGIN=*
   LOG_LEVEL=info
   ```

   **Nota**: `DATABASE_URL` se configura automáticamente cuando agregas PostgreSQL.

### Paso 2: Obtener Token de Railway

1. Ve a https://railway.app/account/tokens
2. Click en "New Token"
3. Dale un nombre (ej: "GitHub Actions")
4. Copia el token generado

### Paso 3: Configurar GitHub Secrets

1. Ve a tu repositorio en GitHub
2. Ve a **Settings** → **Secrets and variables** → **Actions**
3. Click en **New repository secret**
4. Agrega el siguiente secret:

   - **Name**: `RAILWAY_TOKEN`
   - **Value**: El token que copiaste de Railway

5. Click en **Add secret**

### Paso 4: Configurar el Repositorio

El archivo `.github/workflows/railway-deploy.yml` ya está configurado. Este workflow:

- ✅ Se ejecuta automáticamente en push a `main` o `master`
- ✅ Instala dependencias
- ✅ Genera Prisma Client
- ✅ Despliega a Railway
- ✅ Ejecuta migraciones (si es necesario)

### Paso 5: Hacer Push a GitHub

```powershell
git add .
git commit -m "Configure Railway deployment"
git push origin main
```

GitHub Actions ejecutará automáticamente el workflow y desplegará a Railway.

## 🔍 Verificar el Despliegue

### Ver el estado del deployment:

1. Ve a tu repositorio en GitHub
2. Click en la pestaña **Actions**
3. Verás el workflow ejecutándose
4. Click en el workflow para ver los logs

### Ver el estado en Railway:

```powershell
railway status
```

O desde el dashboard: https://railway.app

### Ver logs en Railway:

```powershell
railway logs
```

## 📝 Variables de Entorno Requeridas

Asegúrate de que estas variables estén configuradas en Railway:

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | URL de PostgreSQL (automática) | `${{Postgres.DATABASE_URL}}` |
| `JWT_SECRET` | Secret para JWT | `tu-secret-super-seguro` |
| `JWT_EXPIRES_IN` | Expiración del access token | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Expiración del refresh token | `7d` |
| `PORT` | Puerto del servidor | `3000` |
| `NODE_ENV` | Entorno | `production` |
| `CORS_ORIGIN` | Origen CORS permitido | `*` o tu dominio |
| `LOG_LEVEL` | Nivel de logging | `info` |

## 🚀 Workflow de Desarrollo

### Flujo Normal:

1. **Desarrolla localmente**
2. **Haz commit y push**:
   ```powershell
   git add .
   git commit -m "Tu mensaje"
   git push origin main
   ```
3. **GitHub Actions despliega automáticamente a Railway**
4. **Railway ejecuta el build y migraciones**

### Ejecutar Migraciones Manualmente:

Si necesitas ejecutar migraciones manualmente:

```powershell
railway run npm run migrate:prod
```

### Ver Logs en Tiempo Real:

```powershell
railway logs --follow
```

## 🔧 Solución de Problemas

### El workflow falla en GitHub Actions

1. Verifica que el secret `RAILWAY_TOKEN` esté configurado correctamente
2. Verifica los logs en GitHub Actions para ver el error específico
3. Asegúrate de que Railway CLI esté instalado correctamente en el workflow

### Error: "Unauthorized"

- Verifica que el token de Railway sea válido
- Regenera el token en Railway si es necesario

### Error: "Project not found"

- Ejecuta `railway link` localmente para conectar el proyecto
- O crea un nuevo proyecto con `railway init`

### Migraciones no se ejecutan

- Ejecuta manualmente: `railway run npm run migrate:prod`
- Verifica que `DATABASE_URL` esté configurada correctamente

### Build falla

- Revisa los logs en Railway: `railway logs`
- Verifica que todas las dependencias estén en `package.json`
- Asegúrate de que el build funcione localmente primero

## 📚 Recursos Adicionales

- [Railway Documentation](https://docs.railway.app)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Railway CLI Reference](https://docs.railway.app/develop/cli)

## ✅ Checklist de Despliegue

- [ ] Proyecto creado en Railway
- [ ] PostgreSQL agregado al proyecto
- [ ] Variables de entorno configuradas en Railway
- [ ] Token de Railway obtenido
- [ ] Secret `RAILWAY_TOKEN` configurado en GitHub
- [ ] Archivo `.github/workflows/railway-deploy.yml` presente
- [ ] Código pusheado a GitHub
- [ ] Workflow ejecutado exitosamente
- [ ] Migraciones ejecutadas
- [ ] API accesible en la URL de Railway

---

**¡Listo!** Cada vez que hagas push a `main`, GitHub Actions desplegará automáticamente a Railway. 🚀

