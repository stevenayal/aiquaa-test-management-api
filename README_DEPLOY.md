# 🚀 Guía de Despliegue en Railway

## Método Rápido (Recomendado)

### Paso 1: Autenticar
```powershell
railway login
```
Esto abrirá tu navegador para autenticarte.

### Paso 2: Ejecutar Script Automático
```powershell
.\deploy-complete.ps1
```

Este script automáticamente:
- ✅ Verifica autenticación
- ✅ Crea/vincula proyecto
- ✅ Agrega PostgreSQL
- ✅ Configura todas las variables de entorno
- ✅ Ejecuta migraciones
- ✅ Despliega la aplicación

## Método Manual (Paso a Paso)

Si prefieres hacerlo manualmente:

### 1. Autenticar
```powershell
railway login
```

### 2. Crear Proyecto
```powershell
railway init --name aiquaa-test-management-api
```

O si ya tienes proyecto:
```powershell
railway link
```

### 3. Agregar PostgreSQL
```powershell
railway add postgresql
```

### 4. Configurar Variables de Entorno

Ejecuta estos comandos uno por uno:

```powershell
railway variables set JWT_SECRET="tu-secret-super-seguro-aqui"
railway variables set JWT_EXPIRES_IN="15m"
railway variables set JWT_REFRESH_EXPIRES_IN="7d"
railway variables set PORT="3000"
railway variables set NODE_ENV="production"
railway variables set CORS_ORIGIN="*"
railway variables set LOG_LEVEL="info"
```

**Nota**: `DATABASE_URL` se configura automáticamente cuando agregas PostgreSQL.

### 5. Ejecutar Migraciones
```powershell
railway run npm run migrate:prod
```

### 6. Desplegar
```powershell
railway up
```

## Verificar Despliegue

### Ver Estado
```powershell
railway status
```

### Ver Logs
```powershell
railway logs
```

### Abrir Dashboard
```powershell
railway open
```

### Verificar Endpoints

Una vez desplegado, Railway te dará una URL. Verifica:

- **Health Check**: `https://tu-url.railway.app/api/health`
- **Swagger Docs**: `https://tu-url.railway.app/api/docs`

## Comandos Útiles

```powershell
# Ver información del proyecto
railway status

# Ver logs en tiempo real
railway logs --follow

# Ejecutar comando en Railway
railway run npm run seed

# Ver variables de entorno
railway variables

# Abrir dashboard
railway open

# Ver deployments
railway deployment list
```

## Solución de Problemas

### Error: "Unauthorized"
```powershell
railway login
```

### Error: "Project not found"
```powershell
railway link
```

### Error en Migraciones
```powershell
railway run npm run migrate:prod
railway logs
```

### Build Falla
```powershell
railway logs
# Revisa los logs para ver el error específico
```

## Configuración Completa

Los siguientes archivos están configurados para Railway:

- ✅ `railway.toml` - Configuración de Railway
- ✅ `.nixpacks.toml` - Configuración de build
- ✅ `package.json` - Scripts de producción
- ✅ `prisma/schema.prisma` - Schema de base de datos

## Notas Importantes

1. **JWT_SECRET**: Cambia el valor por defecto en producción por uno seguro
2. **CORS_ORIGIN**: Ajusta `*` por tu dominio específico en producción
3. **Migraciones**: Se ejecutan automáticamente solo en el primer deploy si está configurado
4. **PostgreSQL**: Railway proporciona una instancia gratuita de PostgreSQL

## Soporte

Para más información:
- [Railway Docs](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)

