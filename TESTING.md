# 🧪 Guía de Testing - AIQUAA Test Management API

## 📋 Tabla de Contenidos

- [Configuración Inicial](#configuración-inicial)
- [Tipos de Tests](#tipos-de-tests)
- [Ejecutar Tests](#ejecutar-tests)
- [Cobertura de Código](#cobertura-de-código)
- [Tests Implementados](#tests-implementados)
- [Escribir Nuevos Tests](#escribir-nuevos-tests)
- [Troubleshooting](#troubleshooting)

## 🔧 Configuración Inicial

### Dependencias Instaladas

El proyecto ya tiene todas las dependencias necesarias:

```json
{
  "@nestjs/testing": "^10.3.0",
  "jest": "^29.7.0",
  "supertest": "^6.3.4",
  "@types/supertest": "^6.3.4",
  "ts-jest": "^29.1.1"
}
```

### Variables de Entorno para Tests

Los tests E2E necesitan acceso a una base de datos. Puedes usar:

1. **Base de datos local** (recomendado para tests):
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/aiquaa_test?schema=public"
   ```

2. **Base de datos de desarrollo**: Usa la misma DATABASE_URL del `.env`

⚠️ **Nota**: Los tests E2E crearán y eliminarán datos de prueba automáticamente.

## 📚 Tipos de Tests

### 1. Tests Unitarios (Unit Tests)

- **Ubicación**: `src/**/*.spec.ts`
- **Propósito**: Probar funciones y métodos individuales en aislamiento
- **Características**:
  - Usan mocks de dependencias (PrismaService, EmailService, etc.)
  - Son rápidos de ejecutar
  - No requieren base de datos ni servicios externos

**Ejemplo**:
```typescript
// src/otp/otp.service.spec.ts
describe('OTPService', () => {
  it('should send OTP successfully', async () => {
    // Test con mocks
  });
});
```

### 2. Tests End-to-End (E2E)

- **Ubicación**: `test/**/*.e2e-spec.ts`
- **Propósito**: Probar flujos completos de la API
- **Características**:
  - Prueban endpoints HTTP reales
  - Usan base de datos real
  - Simulan peticiones de clientes
  - Validan respuestas completas

**Ejemplo**:
```typescript
// test/auth.e2e-spec.ts
describe('Auth Endpoints (e2e)', () => {
  it('should register a new user', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'Test123!', role: 'viewer' })
      .expect(201);
  });
});
```

## 🚀 Ejecutar Tests

### Tests Unitarios

```bash
# Ejecutar todos los tests unitarios
npm test

# Ejecutar tests en modo watch (re-ejecuta al cambiar archivos)
npm run test:watch

# Ejecutar tests con cobertura
npm run test:cov

# Ejecutar tests en modo debug
npm run test:debug
```

### Tests E2E

```bash
# Ejecutar todos los tests E2E
npm run test:e2e

# Ejecutar un archivo específico
npm run test:e2e -- test/auth.e2e-spec.ts
```

### Ejecutar Tests Específicos

```bash
# Ejecutar tests que coincidan con un patrón
npm test -- --testNamePattern="should send OTP"

# Ejecutar tests de un archivo específico
npm test -- src/otp/otp.service.spec.ts

# Ejecutar tests en modo verbose (más información)
npm test -- --verbose
```

## 📊 Cobertura de Código

### Generar Reporte de Cobertura

```bash
npm run test:cov
```

Esto generará:
- Un reporte en consola con porcentajes de cobertura
- Un directorio `coverage/` con reportes HTML detallados

### Ver Reporte HTML

```bash
# En Windows
start coverage/lcov-report/index.html

# En Mac/Linux
open coverage/lcov-report/index.html
```

### Métricas de Cobertura

El reporte muestra 4 métricas:

- **Statements**: Líneas de código ejecutadas
- **Branches**: Ramas de if/else cubiertas
- **Functions**: Funciones llamadas
- **Lines**: Líneas de código ejecutadas

**Objetivo recomendado**: > 80% en todas las métricas

## ✅ Tests Implementados

### 1. Tests E2E de Autenticación (`test/auth.e2e-spec.ts`)

Cubre todos los endpoints de autenticación:

#### POST /api/auth/register
- ✓ Registro exitoso con envío de OTP
- ✓ Validación de email duplicado
- ✓ Validación de formato de email
- ✓ Validación de longitud de contraseña

#### POST /api/auth/verify-email
- ✓ Verificación exitosa con código correcto
- ✓ Rechazo de código ya usado
- ✓ Rechazo de código inválido
- ✓ Validación de formato de código (6 dígitos)

#### POST /api/auth/resend-verification
- ✓ No reenviar si el email ya está verificado
- ✓ Rechazo de email no existente

#### POST /api/auth/login
- ✓ Login exitoso con credenciales correctas
- ✓ Rechazo de contraseña incorrecta
- ✓ Rechazo de usuario no existente

#### POST /api/auth/refresh
- ✓ Renovación exitosa de token con refresh token válido
- ✓ Rechazo de refresh token inválido

#### POST /api/auth/forgot-password
- ✓ Envío exitoso de código de recuperación
- ✓ Respuesta segura para email no existente

#### POST /api/auth/reset-password
- ✓ Restablecimiento exitoso con código válido
- ✓ Login exitoso con nueva contraseña
- ✓ Rechazo de contraseña antigua
- ✓ Rechazo de código inválido

#### Endpoints Protegidos
- ✓ Acceso con token válido
- ✓ Rechazo sin token
- ✓ Rechazo con token inválido

### 2. Tests Unitarios de OTP Service (`src/otp/otp.service.spec.ts`)

#### sendOTP()
- ✓ Envío exitoso de OTP
- ✓ Rate limiting (máximo 3 intentos por hora)
- ✓ Invalidación de OTPs anteriores
- ✓ Manejo de errores del servicio de email

#### verifyOTP()
- ✓ Verificación exitosa de OTP válido
- ✓ Rechazo de código inválido
- ✓ Rechazo de código expirado
- ✓ Rechazo de código ya usado
- ✓ Rechazo de propósito incorrecto

#### cleanupExpiredOTPs()
- ✓ Eliminación de OTPs expirados
- ✓ Retorno de 0 si no hay OTPs expirados

### 3. Tests Unitarios de Email Service (`src/email/email.service.spec.ts`)

#### sendOTPEmail()
- ✓ Envío exitoso de email de verificación
- ✓ Envío exitoso de email de recuperación de contraseña
- ✓ Manejo de errores de Resend
- ✓ Manejo de excepciones de red
- ✓ Inclusión correcta del código OTP en HTML
- ✓ Uso correcto de asuntos de email

#### Sin RESEND_API_KEY
- ✓ Retorno de false cuando no hay API key
- ✓ No lanza error sin API key

## 📝 Escribir Nuevos Tests

### Test Unitario - Plantilla

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { MiServicio } from './mi-servicio.service';

describe('MiServicio', () => {
  let service: MiServicio;

  const mockDependencia = {
    metodo: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MiServicio,
        {
          provide: Dependencia,
          useValue: mockDependencia,
        },
      ],
    }).compile();

    service = module.get<MiServicio>(MiServicio);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('miMetodo', () => {
    it('should do something', async () => {
      // Arrange
      mockDependencia.metodo.mockResolvedValue({ data: 'test' });

      // Act
      const result = await service.miMetodo();

      // Assert
      expect(result).toBeDefined();
      expect(mockDependencia.metodo).toHaveBeenCalledWith(/* args */);
    });
  });
});
```

### Test E2E - Plantilla

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('MiEndpoint (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /api/mi-endpoint', () => {
    it('should return data', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/mi-endpoint')
        .expect(200);

      expect(response.body).toHaveProperty('data');
    });
  });
});
```

## 🔍 Mejores Prácticas

### 1. Nomenclatura

- Usa `describe()` para agrupar tests relacionados
- Usa `it()` o `test()` con descripciones claras en inglés o español
- Sigue el patrón: "should [expected behavior] when [condition]"

```typescript
it('should return 400 when email is invalid', async () => {
  // ...
});
```

### 2. Estructura AAA (Arrange-Act-Assert)

```typescript
it('should create a user', async () => {
  // Arrange - Preparar datos
  const userData = { email: 'test@example.com', password: 'Test123!' };

  // Act - Ejecutar acción
  const result = await service.createUser(userData);

  // Assert - Verificar resultado
  expect(result).toBeDefined();
  expect(result.email).toBe(userData.email);
});
```

### 3. Limpiar después de cada test

```typescript
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(async () => {
  // Limpiar base de datos si es necesario
  await prisma.user.deleteMany();
});
```

### 4. Usar mocks apropiadamente

```typescript
// ✅ Bueno: Mock específico
mockPrismaService.user.findUnique.mockResolvedValue({
  id: '1',
  email: 'test@example.com',
});

// ❌ Malo: Mock genérico
jest.spyOn(service, 'findUser').mockReturnValue(anything);
```

## ❓ Troubleshooting

### Error: "Cannot find module"

```bash
# Reinstalar dependencias
npm install
```

### Error: "Connection refused" en tests E2E

- Verifica que la base de datos esté corriendo
- Verifica la variable DATABASE_URL en .env
- Para PostgreSQL local: `docker compose up -d postgres`

### Tests muy lentos

```bash
# Ejecutar tests en paralelo
npm test -- --maxWorkers=4

# Solo tests unitarios (más rápidos)
npm test -- --testPathIgnorePatterns=e2e
```

### Error: "Jest did not exit"

- Asegúrate de cerrar conexiones en afterAll
- Verifica que no haya timers o promesas sin resolver

```typescript
afterAll(async () => {
  await app.close();
  await prisma.$disconnect();
});
```

### Ver más detalles de errores

```bash
# Ejecutar con logs completos
npm test -- --verbose --detectOpenHandles
```

## 📈 Próximos Pasos

Tests pendientes por implementar:

1. **Projects Endpoints**
   - CRUD completo de proyectos
   - Permisos por rol

2. **Requirements Endpoints**
   - CRUD de requisitos
   - Importación desde XML

3. **Test Cases Endpoints**
   - CRUD de casos de prueba
   - Filtros y búsqueda

4. **Ejecutions Endpoints**
   - Crear y actualizar ejecuciones
   - Reportes

5. **Integration Tests**
   - Flujos completos end-to-end
   - Integración con servicios externos

## 📚 Recursos Adicionales

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)

---

**¿Dudas o problemas?** Abre un issue o contacta al equipo de desarrollo.
