import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { exec } from 'child_process';
import { promisify } from 'util';
import { Request, Response } from 'express';

const execAsync = promisify(exec);

async function runMigrations(logger: Logger) {
  try {
    logger.log('🔄 Verificando y aplicando migraciones de base de datos...');

    // Primero intentamos ejecutar migraciones (para producción)
    try {
      const { stdout, stderr } = await execAsync('npx prisma migrate deploy');
      if (stdout) logger.log(stdout.trim());
      if (stderr && !stderr.includes('No migration') && !stderr.includes('migration directory')) {
        logger.warn(stderr.trim());
      }
      logger.log('✅ Migraciones aplicadas correctamente');
      return;
    } catch (migrateError: unknown) {
      const error = migrateError as { message?: string; code?: number };
      // Si no hay migraciones o falla, intentamos db push (sincroniza el esquema)
      if (
        error.message?.includes('No migration') ||
        error.message?.includes('migration directory') ||
        error.code === 1
      ) {
        logger.log('📋 No hay migraciones disponibles. Sincronizando esquema...');
        try {
          const { stdout } = await execAsync('npx prisma db push --skip-generate');
          logger.log(stdout.trim());
          logger.log('✅ Esquema de base de datos sincronizado');
          return;
        } catch (pushError: unknown) {
          const pushErr = pushError as { message?: string };
          // Si db push falla, puede ser porque las tablas ya existen o hay un error de conexión
          if (pushErr.message?.includes('already exists') || pushErr.message?.includes('P1009')) {
            logger.log('ℹ️  Las tablas ya existen o el esquema está actualizado');
            return;
          }
          throw pushError;
        }
      }
      throw migrateError;
    }
  } catch (error: unknown) {
    const err = error as { message?: string };
    logger.error('❌ Error al configurar base de datos:', err.message || 'Error desconocido');
    // Continuamos de todos modos - puede que las tablas ya existan
    logger.warn('⚠️  Continuando sin aplicar cambios de base de datos');
  }
}

async function runSeed(logger: Logger, configService: ConfigService) {
  try {
    // Verificar si el seed está habilitado (por defecto solo en desarrollo o si se especifica)
    const runSeed = configService.get('RUN_SEED', 'false').toLowerCase() === 'true';
    const nodeEnv = configService.get('NODE_ENV', 'development');

    // Solo ejecutar seed si está explícitamente habilitado o en desarrollo
    if (!runSeed && nodeEnv === 'production') {
      logger.log('ℹ️  Seed deshabilitado en producción. Usa RUN_SEED=true para habilitarlo.');
      return;
    }

    logger.log('🌱 Ejecutando seed para crear usuarios y datos iniciales...');

    const { stdout, stderr } = await execAsync('npx ts-node prisma/seed.ts');
    if (stdout) logger.log(stdout.trim());
    if (stderr && !stderr.includes('warning')) {
      logger.warn(stderr.trim());
    }
    logger.log('✅ Seed completado - Usuarios y datos iniciales creados');
  } catch (error: unknown) {
    const err = error as { message?: string };
    // Si el seed falla, puede ser porque los datos ya existen
    if (err.message?.includes('Unique constraint') || err.message?.includes('already exists')) {
      logger.log('ℹ️  Los datos del seed ya existen o hay conflictos de unicidad');
      return;
    }
    logger.error('❌ Error al ejecutar seed:', err.message || 'Error desconocido');
    logger.warn('⚠️  Continuando sin datos iniciales - puede que ya existan');
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const logger = app.get(Logger);

  app.useLogger(logger);

  // Run database migrations automatically
  await runMigrations(logger);

  // Run seed to create initial users and data
  await runSeed(logger, configService);

  // Redirect root to Swagger (must be before global prefix)
  const httpAdapter = app.getHttpAdapter();
  const instance = httpAdapter.getInstance();

  // Middleware to redirect root path to Swagger - must be first
  instance.get('/', (_req: Request, res: Response) => {
    res.redirect(301, '/api/docs');
  });

  // CORS
  app.enableCors({
    origin: configService.get('CORS_ORIGIN', 'http://localhost:3000'),
    credentials: true,
  });

  // Global prefix
  app.setGlobalPrefix('api');

  // Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('AIQUAA Test Management API')
    .setDescription('API REST para gestión de pruebas con integración AIQUAA')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Autenticación')
    .addTag('projects', 'Proyectos')
    .addTag('requirements', 'Requisitos')
    .addTag('test-plans', 'Planes de Prueba')
    .addTag('test-suites', 'Suites de Prueba')
    .addTag('test-cases', 'Casos de Prueba')
    .addTag('test-runs', 'Ejecuciones de Prueba')
    .addTag('test-results', 'Resultados de Prueba')
    .addTag('defects', 'Defectos')
    .addTag('risks', 'Riesgos')
    .addTag('checklists', 'Checklists')
    .addTag('audit', 'Auditoría')
    .addTag('integrations', 'Integraciones')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = configService.get('PORT', 3000);
  await app.listen(port);
  logger.log(`🚀 Application is running on: http://localhost:${port}`);
  logger.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}

bootstrap();
