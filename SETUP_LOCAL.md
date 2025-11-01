# Configuración Local - AIQUAA Test Management API

## Requisitos

Para ejecutar esta API localmente necesitas **PostgreSQL 15+** o **Docker Desktop**.

## Opción 1: Usar Docker (Recomendado)

1. **Instalar Docker Desktop** desde https://www.docker.com/products/docker-desktop

2. **Levantar PostgreSQL**:
```powershell
docker compose up -d postgres
```

3. **Ejecutar migraciones**:
```powershell
npm run migrate
```

4. **Poblar base de datos**:
```powershell
npm run seed
```

5. **Iniciar la API**:
```powershell
npm run dev
```

## Opción 2: PostgreSQL Local

1. **Instalar PostgreSQL** desde https://www.postgresql.org/download/

2. **Crear base de datos**:
```sql
CREATE DATABASE aiquaa_test_management;
```

3. **Actualizar `.env`** con tus credenciales si son diferentes:
```env
DATABASE_URL="postgresql://TU_USUARIO:TU_PASSWORD@localhost:5432/aiquaa_test_management?schema=public"
```

4. **Ejecutar migraciones**:
```powershell
npm run migrate
```

5. **Poblar base de datos**:
```powershell
npm run seed
```

6. **Iniciar la API**:
```powershell
npm run dev
```

## Verificar que PostgreSQL está corriendo

**Con Docker:**
```powershell
docker compose ps
```

**Localmente:**
- En Windows: Verifica el servicio "postgresql-x64-XX" en Servicios
- O intenta conectarte con: `psql -U postgres`

## Solución de Problemas

### Error: "Connection refused"
- Verifica que PostgreSQL está corriendo
- Verifica el puerto (por defecto 5432)
- Verifica las credenciales en `.env`

### Error: "database does not exist"
- Crea la base de datos: `CREATE DATABASE aiquaa_test_management;`

### No tienes Docker ni PostgreSQL instalado
- Descarga Docker Desktop (más fácil) o PostgreSQL
- O contacta al equipo para acceso a una instancia remota

## Credenciales por defecto del Seed

- **Admin**: `admin@aiquaa.com` / `admin123`
- **QA Lead**: `qalead@aiquaa.com` / `qalead123`
- **Tester**: `tester@aiquaa.com` / `tester123`
- **Viewer**: `viewer@aiquaa.com` / `viewer123`

