# 📡 Integración Frontend - AIQUAA Test Management API

Esta guía explica cómo integrar la API en tu aplicación frontend.

## 📄 Archivo OpenAPI/Swagger

El frontend puede usar el archivo **OpenAPI JSON** que contiene toda la documentación de los endpoints.

## 🎯 Opción 1: Descargar desde la API (Recomendado)

Una vez que la API esté desplegada, puedes descargar el archivo OpenAPI directamente:

### URL del archivo JSON:

Swagger expone automáticamente el JSON de OpenAPI en:

**Producción:**
```
https://aiquaa-test-management-api-production.up.railway.app/api/docs-json
```

**Desarrollo Local:**
```
http://localhost:3000/api/docs-json
```

También puedes acceder a la documentación interactiva en:
```
https://aiquaa-test-management-api-production.up.railway.app/api/docs
```

### Descargar con cURL o navegador:
```bash
# Con cURL
curl -o openapi.json https://aiquaa-test-management-api-production.up.railway.app/api/docs-json

# O simplemente abre en el navegador y guarda el archivo
```

## 🎯 Opción 2: Generar localmente

Puedes generar el archivo `openapi.json` localmente antes de desplegar:

```bash
npm run openapi:generate
```

Esto creará el archivo `openapi.json` en la raíz del proyecto.

## 🔧 Uso del archivo OpenAPI

### Con OpenAPI Generator

Genera clientes TypeScript, JavaScript, React, etc.:

```bash
# Instalar OpenAPI Generator globalmente
npm install -g @openapitools/openapi-generator-cli

# Generar cliente TypeScript
openapi-generator-cli generate \
  -i openapi.json \
  -g typescript-axios \
  -o ./generated-client

# Generar cliente JavaScript
openapi-generator-cli generate \
  -i openapi.json \
  -g javascript \
  -o ./generated-client

# Generar hooks de React
openapi-generator-cli generate \
  -i openapi.json \
  -g typescript-react-query \
  -o ./generated-client
```

### Con Swagger Codegen

```bash
swagger-codegen generate \
  -i openapi.json \
  -l typescript-axios \
  -o ./generated-client
```

### Con Orval (Recomendado para React/TypeScript)

```bash
# Instalar Orval
npm install -D orval

# Configurar orval.config.js
```

**orval.config.js:**
```javascript
module.exports = {
  api: {
    input: {
      target: './openapi.json',
    },
    output: {
      mode: 'tags-split',
      target: './src/api',
      schemas: './src/models',
      client: 'react-query',
      mock: true,
    },
  },
};
```

Luego ejecuta:
```bash
orval
```

## 📋 Ejemplo: Uso en Frontend

Una vez generado el cliente, puedes usarlo así:

### TypeScript/React Example:
```typescript
import { AuthApi, ProjectsApi } from './generated-client';

const authApi = new AuthApi({
  basePath: 'https://aiquaa-test-management-api-production.up.railway.app/api',
});

// Login
const response = await authApi.authControllerLogin({
  loginDto: {
    email: 'admin@aiquaa.com',
    password: 'admin123',
  },
});

// Guardar token
localStorage.setItem('token', response.data.accessToken);

// Usar en requests autenticados
const projectsApi = new ProjectsApi({
  basePath: 'https://aiquaa-test-management-api-production.up.railway.app/api',
  accessToken: localStorage.getItem('token'),
});

const projects = await projectsApi.projectsControllerFindAll();
```

## 🔐 Autenticación

La API usa **Bearer Token** (JWT). Para endpoints protegidos:

1. **Login**: `POST /api/auth/login`
2. **Guardar token**: `localStorage.setItem('token', accessToken)`
3. **Usar en headers**: `Authorization: Bearer <token>`

## 📚 Endpoints Principales

### Autenticación
- `POST /api/auth/register` - Registro
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refrescar token

### Proyectos
- `GET /api/projects` - Listar proyectos
- `POST /api/projects` - Crear proyecto
- `GET /api/projects/:id` - Obtener proyecto
- `PATCH /api/projects/:id` - Actualizar proyecto
- `DELETE /api/projects/:id` - Eliminar proyecto

### Casos de Prueba
- `GET /api/test-cases` - Listar casos de prueba
- `POST /api/test-cases` - Crear caso de prueba
- `GET /api/test-cases/:id` - Obtener caso de prueba
- `PATCH /api/test-cases/:id` - Actualizar caso de prueba

### Y muchos más...

Ver la documentación completa en Swagger: `/api/docs`

## 🌐 URL Base de la API

**Producción:**
```
https://aiquaa-test-management-api-production.up.railway.app/api
```

**Desarrollo Local:**
```
http://localhost:3000/api
```

## 📝 Notas Importantes

1. **CORS**: Asegúrate de configurar `CORS_ORIGIN` en la API con tu dominio frontend
2. **Base URL**: Todos los endpoints tienen el prefijo `/api`
3. **Autenticación**: La mayoría de endpoints requieren Bearer Token (excepto login/register)
4. **Versión**: La API está en versión 1.0

## 🛠️ Herramientas Recomendadas

- **Orval** - Generador de clientes TypeScript/React con React Query
- **swagger-typescript-api** - Generador de clientes TypeScript
- **OpenAPI Generator** - Generador multi-lenguaje
- **Swagger UI** - Visualización interactiva (ya incluida en `/api/docs`)

