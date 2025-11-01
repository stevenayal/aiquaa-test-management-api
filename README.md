# AIQUAA Test Management API

API REST completa para gestión de pruebas que integra utilidades AIQUAA como "JSON to Test Plans", "Matriz de Riesgos" y "Req-Lint" de forma orquestada.

## 🏗️ Arquitectura

La API está construida con **Node.js 20 + NestJS + TypeScript**, siguiendo principios de arquitectura limpia y patrones de diseño robustos.

### Stack Tecnológico

- **Runtime**: Node.js 20
- **Framework**: NestJS 10
- **Lenguaje**: TypeScript 5.3
- **Base de Datos**: PostgreSQL 15
- **ORM**: Prisma 5
- **Autenticación**: JWT (Passport)
- **Documentación**: Swagger/OpenAPI
- **Logging**: Pino (estructurado)
- **Validación**: class-validator
- **Testing**: Jest

## 📦 Modelos del Dominio

### Entidades Principales

```
User
├── id, email, passwordHash, role, createdAt, updatedAt
│
Project
├── id, name, key (unique), active, createdAt, updatedAt
│
Requirement
├── id, projectId, externalKey, title, text, status
│
TestPlan
├── id, projectId, name, description
│
TestSuite
├── id, planId, name, type (static|query), query
│
TestCase
├── id, projectId, externalKey, title, preconditions, priority, tags[], steps[]
│
TestRun
├── id, planId, suiteId, name, scheduledAt, status
│
TestResult
├── id, runId, caseId, outcome (Pass|Fail|Blocked|NotRun), evidenceUrl, comment
│
Defect
├── id, projectId, title, description, severity, status, externalKey
│
Risk
├── id, projectId, description, category, probability (1-5), impact (1-5)
├── score (= probability × impact), status, owner, mitigation, contingency
│
Checklist
├── id, projectId, name, type (Web|API|Mobile|Security), items[]
│
AuditEvent
└── id, actorId, entity, entityId, action, diff, createdAt
```

## 🔐 Autenticación y Autorización

### Roles

- **admin**: Acceso total al sistema
- **qa_lead**: Todo excepto gestión de usuarios
- **tester**: CRUD de resultados/defectos, lectura general
- **viewer**: Solo lectura

### RBAC por Recurso/Acción

Cada endpoint está protegido con guards que verifican:
- Autenticación JWT válida
- Rol requerido para la acción

## 📡 Endpoints Principales

### Autenticación (`/api/auth`)

- `POST /api/auth/register` - Registrar nuevo usuario
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/refresh` - Refrescar token

### Proyectos (`/api/projects`)

- `GET /api/projects` - Listar proyectos
- `POST /api/projects` - Crear proyecto
- `GET /api/projects/:id` - Obtener proyecto
- `PATCH /api/projects/:id` - Actualizar proyecto
- `DELETE /api/projects/:id` - Eliminar proyecto

### Requisitos (`/api/requirements`)

- `GET /api/requirements` - Listar requisitos
- `POST /api/requirements` - Crear requisito
- `POST /api/requirements/:id/analyze` - Analizar con Req-Lint

### Casos de Prueba (`/api/test-cases`)

- `GET /api/test-cases` - Listar casos
- `POST /api/test-cases` - Crear caso
- `POST /api/test-cases/import/json` - Importar desde JSON (formato AIQUAA)
- `GET /api/test-cases/export/csv` - Exportar a CSV
- `GET /api/test-cases/export/xlsx` - Exportar a Excel

### Ejecuciones (`/api/test-runs`)

- `GET /api/test-runs` - Listar ejecuciones
- `POST /api/test-runs` - Crear ejecución
- `POST /api/test-runs/:id/results` - Agregar resultados (bulk)

### Resultados (`/api/test-results`)

- `POST /api/test-results` - Crear resultado
- `POST /api/test-results/bulk` - Crear múltiples resultados
- `GET /api/test-results?runId=xxx` - Listar resultados

### Defectos (`/api/defects`)

- `GET /api/defects` - Listar defectos
- `POST /api/defects` - Crear defecto
- `POST /api/defects/link` - Vincular con caso/resultado

### Riesgos (`/api/risks`)

- `GET /api/risks` - Listar riesgos
- `POST /api/risks` - Crear riesgo
- `POST /api/risks/sync` - Sincronizar con Matriz de Riesgos AIQUAA

### Integraciones (`/api/integrations`)

- `POST /api/integrations/ci/webhook` - Recibir resultados de CI (JUnit XML / JSON)
- `POST /api/integrations/jira/credentials` - Guardar credenciales Jira (stub)
- `POST /api/integrations/azure-devops/credentials` - Guardar credenciales Azure DevOps (stub)

### Auditoría (`/api/audit`)

- `GET /api/audit` - Listar eventos de auditoría
- `GET /api/audit?entity=TestCase&entityId=xxx` - Filtrar por entidad

### Health (`/api/health`)

- `GET /api/health` - Health check
- `GET /api/health/metrics` - Métricas básicas

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 20+
- PostgreSQL 15+
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**

```bash
git clone <repository-url>
cd aiquaa-test-management-api
```

2. **Instalar dependencias**

```bash
npm install
```

3. **Configurar variables de entorno**

Copiar `.env.example` a `.env` y configurar:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/aiquaa_test_management?schema=public"
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
PORT=3000
CORS_ORIGIN=http://localhost:3000
```

4. **Generar Prisma Client**

```bash
npm run generate
```

5. **Ejecutar migraciones**

```bash
npm run migrate
```

6. **Poblar base de datos (opcional)**

```bash
npm run seed
```

### Desarrollo con Docker

```bash
# Levantar servicios
docker-compose up -d

# Ver logs
docker-compose logs -f api

# Detener servicios
docker-compose down
```

## 📝 Scripts Disponibles

```bash
npm run dev          # Desarrollo con hot-reload
npm run build        # Compilar TypeScript
npm run start        # Iniciar aplicación (producción)
npm run lint         # Linting con ESLint
npm run test         # Ejecutar tests
npm run test:watch   # Tests en modo watch
npm run test:cov     # Tests con cobertura
npm run migrate      # Ejecutar migraciones
npm run seed         # Poblar base de datos
npm run generate     # Generar Prisma Client
npm run studio       # Abrir Prisma Studio
```

## 🔄 Migraciones

### Crear nueva migración

```bash
npx prisma migrate dev --name nombre_migracion
```

### Aplicar migraciones en producción

```bash
npm run migrate:prod
```

## 🌱 Seeds

El seed crea datos de demostración:

- 4 usuarios (admin, qa_lead, tester, viewer)
- 1 proyecto demo
- 1 requisito
- 1 plan de prueba con suite
- 3 casos de prueba
- 1 ejecución con resultados
- 1 defecto vinculado
- 1 riesgo
- 1 checklist

**Credenciales por defecto:**

- Admin: `admin@aiquaa.com` / `admin123`
- QA Lead: `qalead@aiquaa.com` / `qalead123`
- Tester: `tester@aiquaa.com` / `tester123`
- Viewer: `viewer@aiquaa.com` / `viewer123`

## 🔒 Reglas de Negocio

### Validaciones Implementadas

1. **Proyectos**: No se puede eliminar un proyecto si tiene planes de prueba activos
2. **Ejecuciones**: No se puede cerrar una ejecución si tiene resultados pendientes (NotRun)
3. **Riesgos**: 
   - Score = probability × impact
   - Status automático: ≤4 (closed), 5-11 (mitigated), ≥12 (open)
4. **Casos de Prueba**: Priority debe ser {Alta, Media, Baja}
5. **Trazabilidad**: Los defectos creados desde resultados fallidos mantienen links con caseId, runId, requirementId

## 📊 Integraciones AIQUAA

### JSON to Test Plans

Formato de importación:

```json
{
  "id_work_item": "KAN-6",
  "datos_jira": {
    "key": "KAN-6",
    "summary": "Implementar autenticación",
    "description": "..."
  },
  "casos_prueba": [
    {
      "id_caso_prueba": "TC001",
      "titulo": "Login exitoso",
      "pasos": ["paso 1", "paso 2"],
      "precondiciones": ["precondición"],
      "prioridad": "Alta",
      "tags": ["autenticación"]
    }
  ]
}
```

**Endpoint**: `POST /api/test-cases/import/json`

### Matriz de Riesgos

Sincronización con estructura de riesgos:

**Endpoint**: `POST /api/risks/sync`

El sistema calcula automáticamente el score y asigna el status según umbrales.

### Req-Lint

Análisis de requisitos con reglas determinísticas:

**Endpoint**: `POST /api/requirements/:id/analyze`

Reglas implementadas:
- Completitud (texto > 50 caracteres)
- Especificidad (contiene "debe"/"debería")
- Testabilidad (título > 10 caracteres)

## 🔗 Integraciones CI/CD

### Webhook CI

Acepta resultados automatizados en dos formatos:

1. **JUnit XML**: `POST /api/integrations/ci/webhook`
   ```json
   {
     "runId": "uuid",
     "format": "junit-xml",
     "data": "<?xml version='1.0'?>..."
   }
   ```

2. **JSON**: 
   ```json
   {
     "runId": "uuid",
     "format": "json",
     "data": [
       {
         "caseExternalId": "TC-001",
         "outcome": "Pass",
         "evidenceUrl": "https://...",
         "comment": "..."
       }
     ]
   }
   ```

### Jira / Azure DevOps (Stub)

Endpoints para guardar credenciales y crear external keys. En producción se conectarían con las APIs reales.

## 📚 Documentación Swagger

Una vez iniciada la aplicación, acceder a:

```
http://localhost:3000/api/docs
```

Incluye:
- Descripción completa de todos los endpoints
- DTOs con ejemplos
- Sección "Try it out" para probar endpoints
- Autenticación Bearer token

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## 📈 Observabilidad

### Logs

Logs estructurados con Pino:
- Nivel configurable via `LOG_LEVEL`
- Formato JSON en producción
- Pretty print en desarrollo

### Auditoría

Todos los cambios se registran automáticamente en `AuditEvent`:
- Actor (usuario)
- Entidad y ID
- Acción (create/update/delete/execute)
- Diff (antes/después)

### Métricas

- `GET /api/health/metrics`: Métricas básicas del sistema

## 🔄 CI/CD

El workflow de GitHub Actions (`/.github/workflows/ci.yml`) ejecuta:

1. **Lint**: Verificación de código
2. **Test**: Tests unitarios y E2E
3. **Build**: Compilación de TypeScript

## 📋 Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `DATABASE_URL` | URL de conexión PostgreSQL | - |
| `JWT_SECRET` | Secret para firmar JWT | - |
| `JWT_EXPIRES_IN` | Expiración del access token | `15m` |
| `JWT_REFRESH_EXPIRES_IN` | Expiración del refresh token | `7d` |
| `PORT` | Puerto del servidor | `3000` |
| `CORS_ORIGIN` | Origen permitido para CORS | `http://localhost:3000` |
| `LOG_LEVEL` | Nivel de logging | `info` |
| `NODE_ENV` | Entorno de ejecución | `development` |

## 🗺️ Roadmap

### Próximas Funcionalidades

- [ ] Integración real con Jira API
- [ ] Integración real con Azure DevOps API
- [ ] Upload de evidencia a S3
- [ ] Notificaciones por email
- [ ] Reportes avanzados (PDF/Excel)
- [ ] Dashboard de métricas
- [ ] Integración con más herramientas CI/CD
- [ ] API GraphQL adicional
- [ ] Webhooks salientes
- [ ] Soporte multi-idioma

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

MIT

## 👥 Autor

AIQUAA Team

---

## 📞 Soporte

Para consultas o soporte, abrir un issue en el repositorio.

