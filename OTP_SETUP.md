# 🔐 Sistema OTP - Configuración y Uso

## ✅ ¿Qué se implementó?

Se ha agregado un sistema completo de OTP (One-Time Password) para:

1. ✉️ **Verificación de Email** al registrarse
2. 🔑 **Recuperación de Contraseña**

## 📧 Configuración de Resend

### 1. Crear cuenta en Resend

1. Ve a [resend.com](https://resend.com)
2. Regístrate con tu email
3. Verifica tu cuenta

### 2. Obtener API Key

1. En el dashboard de Resend, ve a **API Keys**
2. Click en **"Create API Key"**
3. Dale un nombre (ej: "AIQUAA Production")
4. Copia la API Key (comienza con `re_`)

### 3. Configurar en Railway

Ve a **Railway Dashboard → tu proyecto → Variables** y agrega:

```env
RESEND_API_KEY=re_tu_api_key_aqui
FROM_EMAIL=onboarding@resend.dev
```

**Importante**:
- Si usas el dominio `onboarding@resend.dev`, solo puedes enviar a TU email (para testing)
- Para enviar a cualquier email, debes [verificar tu dominio](https://resend.com/docs/dashboard/domains/introduction) en Resend

### 4. (Opcional) Configurar Dominio Propio

Para usar tu propio dominio (ej: `noreply@tuempresa.com`):

1. En Resend → **Domains** → **Add Domain**
2. Agrega tu dominio
3. Configura los registros DNS (MX, TXT, CNAME) según las instrucciones
4. Una vez verificado, actualiza la variable en Railway:

```env
FROM_EMAIL=noreply@tuempresa.com
```

## 🚀 Redesplegar en Railway

Railway detectará los cambios automáticamente del push a GitHub y redesplegará.

**Espera a que termine el deployment** y verifica en los logs que diga:
```
📋 Sincronizando esquema con db push...
✅ Esquema de base de datos sincronizado
```

## 📝 Nuevos Endpoints

### 1. Registro (modificado)

**POST `/api/auth/register`**

```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "role": "viewer"
}
```

**Response**:
```json
{
  "message": "Usuario registrado exitosamente. Verifica tu email con el código enviado.",
  "email": "user@example.com",
  "emailVerified": false
}
```

El usuario recibirá un email con un código de 6 dígitos.

### 2. Verificar Email

**POST `/api/auth/verify-email`**

```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response** (200 OK):
```json
{
  "accessToken": "eyJhbGci...",
  "refreshToken": "eyJhbGci...",
  "user": {
    "id": "...",
    "email": "user@example.com",
    "role": "viewer"
  }
}
```

Después de verificar el email, el usuario recibe tokens para login automático.

### 3. Reenviar Código de Verificación

**POST `/api/auth/resend-verification`**

```json
{
  "email": "user@example.com"
}
```

**Response**:
```json
{
  "message": "Código de verificación reenviado"
}
```

### 4. Olvidé mi Contraseña

**POST `/api/auth/forgot-password`**

```json
{
  "email": "user@example.com"
}
```

**Response**:
```json
{
  "message": "Si el email existe, recibirás un código de recuperación"
}
```

El usuario recibirá un email con un código de 6 dígitos.

### 5. Restablecer Contraseña

**POST `/api/auth/reset-password`**

```json
{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "NewPassword123!"
}
```

**Response**:
```json
{
  "message": "Contraseña actualizada exitosamente"
}
```

## 🔒 Seguridad Implementada

- ✅ **OTPs de 6 dígitos** (100,000 - 999,999)
- ✅ **Expiración**: 10 minutos
- ✅ **Un solo uso**: El código se marca como usado después de verificar
- ✅ **Rate limiting**: Máximo 3 intentos por hora por email
- ✅ **Códigos únicos por propósito**: Un código para email, otro para password
- ✅ **Limpieza automática**: Los códigos expirados se pueden limpiar (implementar cron job)

## 🧪 Flujo Completo de Prueba

### Flujo 1: Registro + Verificación

```bash
# 1. Registrar usuario
curl -X POST https://tu-api.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "role": "viewer"
  }'

# 2. Revisar email y copiar código de 6 dígitos

# 3. Verificar email
curl -X POST https://tu-api.railway.app/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "code": "123456"
  }'

# 4. Ya tienes accessToken y refreshToken para usar la API
```

### Flujo 2: Recuperación de Contraseña

```bash
# 1. Solicitar código de recuperación
curl -X POST https://tu-api.railway.app/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'

# 2. Revisar email y copiar código de 6 dígitos

# 3. Restablecer contraseña
curl -X POST https://tu-api.railway.app/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "code": "123456",
    "newPassword": "NewPassword123!"
  }'

# 4. Hacer login con la nueva contraseña
curl -X POST https://tu-api.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "NewPassword123!"
  }'
```

## 💡 Modo Desarrollo (Sin Resend)

Si `RESEND_API_KEY` no está configurado, el sistema:

- ⚠️ **No enviará emails**
- 📝 **Mostrará el código OTP en los logs** del servidor
- ✅ **Todo lo demás funciona normalmente**

Esto es útil para desarrollo local sin necesidad de configurar Resend.

En los logs verás:
```
[EmailService] ⚠️  RESEND_API_KEY no configurado. El envío de emails estará deshabilitado.
[EmailService] Email service disabled. OTP for test@example.com: 123456
[OTPService] 🔑 OTP Code for test@example.com (verify_email): 123456
```

## 📊 Cambios en la Base de Datos

### Tabla `users` (modificada)
- Nuevo campo: `email_verified` (boolean, default: false)

### Tabla `otps` (nueva)
```sql
CREATE TABLE otps (
  id UUID PRIMARY KEY,
  email VARCHAR NOT NULL,
  code VARCHAR(6) NOT NULL,
  purpose ENUM('verify_email', 'reset_password') NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX(email, code)
);
```

## 🎨 Templates de Email

Los emails tienen un diseño profesional con:

- 🎨 Gradientes de colores (morado para verificación, rojo para recuperación)
- 📱 Responsive design
- ✨ Código destacado en grande y fácil de leer
- ⚠️ Avisos de seguridad
- ⏰ Indicación de expiración

## 🔧 Próximas Mejoras (Opcional)

1. **Cron Job**: Limpiar OTPs expirados automáticamente
2. **2FA**: Agregar autenticación de dos factores para login
3. **SMS**: Opción de enviar OTP por SMS (usando Twilio)
4. **Email Templates**: Personalizar más los templates
5. **Logs de Auditoría**: Registrar intentos de verificación fallidos

## ❓ Troubleshooting

### Los emails no llegan

1. Verifica que `RESEND_API_KEY` esté configurado en Railway
2. Si usas `onboarding@resend.dev`, solo puedes enviar a tu email de Resend
3. Verifica tu carpeta de spam
4. Revisa los logs de Railway para ver si hay errores

### Error: "Código OTP inválido o expirado"

- El código tiene 10 minutos de validez
- Cada código solo se puede usar una vez
- Solicita un nuevo código con `/api/auth/resend-verification`

### Error: "Demasiados intentos"

- Límite de 3 códigos por hora por email
- Espera 1 hora o contacta soporte

## 📚 Documentación Completa

Toda la documentación de los endpoints está en Swagger:

👉 https://tu-api.railway.app/api/docs

Busca la sección **"auth"** para ver todos los endpoints de OTP.
