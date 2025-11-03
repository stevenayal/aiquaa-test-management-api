import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Auth Endpoints (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // Variables para almacenar datos de prueba
  let testUserEmail: string;
  let testUserPassword: string;
  let verificationCode: string;
  let resetPasswordCode: string;
  let accessToken: string;
  let refreshToken: string;

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
    prisma = app.get<PrismaService>(PrismaService);

    // Generar email único para cada test
    testUserEmail = `test-${Date.now()}@example.com`;
    testUserPassword = 'Test123!';
  });

  afterAll(async () => {
    // Limpiar datos de prueba
    await prisma.user.deleteMany({
      where: { email: { contains: 'test-' } },
    });
    await prisma.oTP.deleteMany({
      where: { email: { contains: 'test-' } },
    });

    await app.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user and send verification email', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: testUserEmail,
          password: testUserPassword,
          role: 'viewer',
        })
        .expect(201);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('email', testUserEmail);
      expect(response.body).toHaveProperty('emailVerified', false);

      // Verificar que el usuario fue creado
      const user = await prisma.user.findUnique({
        where: { email: testUserEmail },
      });
      expect(user).toBeDefined();
      expect(user.emailVerified).toBe(false);

      // Obtener el código OTP de la base de datos para testing
      const otp = await prisma.oTP.findFirst({
        where: {
          email: testUserEmail,
          purpose: 'verify_email',
          used: false,
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(otp).toBeDefined();
      verificationCode = otp.code;
    });

    it('should not allow duplicate email registration', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: testUserEmail,
          password: testUserPassword,
          role: 'viewer',
        })
        .expect(400);
    });

    it('should validate email format', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'invalid-email',
          password: testUserPassword,
          role: 'viewer',
        })
        .expect(400);
    });

    it('should validate password minimum length', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'another@example.com',
          password: '123',
          role: 'viewer',
        })
        .expect(400);
    });
  });

  describe('POST /api/auth/verify-email', () => {
    it('should verify email with correct OTP code', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/verify-email')
        .send({
          email: testUserEmail,
          code: verificationCode,
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUserEmail);

      // Guardar tokens para tests posteriores
      accessToken = response.body.accessToken;
      refreshToken = response.body.refreshToken;

      // Verificar que el email fue marcado como verificado
      const user = await prisma.user.findUnique({
        where: { email: testUserEmail },
      });
      expect(user.emailVerified).toBe(true);

      // Verificar que el OTP fue marcado como usado
      const otp = await prisma.oTP.findFirst({
        where: {
          email: testUserEmail,
          code: verificationCode,
        },
      });
      expect(otp.used).toBe(true);
    });

    it('should not allow reusing the same OTP code', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/verify-email')
        .send({
          email: testUserEmail,
          code: verificationCode,
        })
        .expect(400);
    });

    it('should reject invalid OTP code', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/verify-email')
        .send({
          email: testUserEmail,
          code: '000000',
        })
        .expect(400);
    });

    it('should validate OTP code format (6 digits)', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/verify-email')
        .send({
          email: testUserEmail,
          code: '12345', // Solo 5 dígitos
        })
        .expect(400);
    });
  });

  describe('POST /api/auth/resend-verification', () => {
    it('should not resend code if email is already verified', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/resend-verification')
        .send({
          email: testUserEmail,
        })
        .expect(400);
    });

    it('should reject non-existent email', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/resend-verification')
        .send({
          email: 'nonexistent@example.com',
        })
        .expect(400);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with correct credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testUserEmail,
          password: testUserPassword,
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUserEmail);
    });

    it('should reject incorrect password', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testUserEmail,
          password: 'WrongPassword123!',
        })
        .expect(401);
    });

    it('should reject non-existent user', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUserPassword,
        })
        .expect(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should refresh access token with valid refresh token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({
          refreshToken: refreshToken,
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(typeof response.body.accessToken).toBe('string');
    });

    it('should reject invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .send({
          refreshToken: 'invalid-token',
        })
        .expect(401);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('should send password reset code', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send({
          email: testUserEmail,
        })
        .expect(200);

      expect(response.body).toHaveProperty('message');

      // Obtener el código OTP de la base de datos
      const otp = await prisma.oTP.findFirst({
        where: {
          email: testUserEmail,
          purpose: 'reset_password',
          used: false,
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(otp).toBeDefined();
      resetPasswordCode = otp.code;
    });

    it('should return success even for non-existent email (security)', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send({
          email: 'nonexistent@example.com',
        })
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });
  });

  describe('POST /api/auth/reset-password', () => {
    const newPassword = 'NewPassword123!';

    it('should reset password with valid OTP code', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send({
          email: testUserEmail,
          code: resetPasswordCode,
          newPassword: newPassword,
        })
        .expect(200);

      expect(response.body).toHaveProperty('message');

      // Verificar que el OTP fue marcado como usado
      const otp = await prisma.oTP.findFirst({
        where: {
          email: testUserEmail,
          code: resetPasswordCode,
        },
      });
      expect(otp.used).toBe(true);
    });

    it('should login with new password', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testUserEmail,
          password: newPassword,
        })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
    });

    it('should not login with old password', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testUserEmail,
          password: testUserPassword,
        })
        .expect(401);
    });

    it('should reject invalid OTP code', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send({
          email: testUserEmail,
          code: '000000',
          newPassword: 'AnotherPassword123!',
        })
        .expect(400);
    });
  });

  describe('Protected Endpoints (with JWT)', () => {
    it('should access protected endpoint with valid token', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/projects')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should reject protected endpoint without token', async () => {
      await request(app.getHttpServer())
        .get('/api/projects')
        .expect(401);
    });

    it('should reject protected endpoint with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/projects')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });
});
