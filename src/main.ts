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

    // Agregar timeout de 30 segundos para evitar que bloquee el inicio
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Migration timeout')), 30000),
    );

    const migrationPromise = (async () => {
      // Primero intentamos ejecutar migraciones (para producción)
      try {
        const { stdout, stderr } = await execAsync('npx prisma migrate deploy');
        if (stdout) logger.log(stdout.trim());
        // Verificar si no hay migraciones para ejecutar db push
        if (stderr && (stderr.includes('No migration') || stderr.includes('migration directory'))) {
          logger.log('📋 No hay migraciones disponibles. Sincronizando esquema...');
          try {
            const { stdout: pushStdout, stderr: pushStderr } = await execAsync(
              'npx prisma db push --skip-generate',
            );
            if (pushStdout) logger.log(pushStdout.trim());
            if (pushStderr) logger.log(pushStderr.trim());
            logger.log('✅ Esquema de base de datos sincronizado');
            return;
          } catch (pushError: unknown) {
            const pushErr = pushError as { message?: string; stderr?: string; stdout?: string };
            // Si db push falla, puede ser porque las tablas ya existen o hay un error de conexión
            const errorMsg = pushErr.message || pushErr.stderr || '';
            if (
              errorMsg.includes('already exists') ||
              errorMsg.includes('P1009') ||
              errorMsg.includes('Database is up to date')
            ) {
              logger.log('ℹ️  Las tablas ya existen o el esquema está actualizado');
              return;
            }
            logger.warn(`⚠️  db push falló: ${errorMsg}`);
            throw pushError;
          }
        }
        if (stderr && !stderr.includes('No migration') && !stderr.includes('migration directory')) {
          logger.warn(stderr.trim());
        }
        logger.log('✅ Migraciones aplicadas correctamente');
        return;
      } catch (migrateError: unknown) {
        const error = migrateError as { message?: string; code?: number; stderr?: string };
        const errorMsg = error.message || error.stderr || '';

        // Si no hay migraciones o falla, intentamos db push (sincroniza el esquema)
        if (
          errorMsg.includes('No migration') ||
          errorMsg.includes('migration directory') ||
          error.code === 1
        ) {
          logger.log('📋 No hay migraciones disponibles. Sincronizando esquema...');
          try {
            const { stdout: pushStdout, stderr: pushStderr } = await execAsync(
              'npx prisma db push --skip-generate',
            );
            if (pushStdout) logger.log(pushStdout.trim());
            if (pushStderr) logger.log(pushStderr.trim());
            logger.log('✅ Esquema de base de datos sincronizado');
            return;
          } catch (pushError: unknown) {
            const pushErr = pushError as { message?: string; stderr?: string };
            const pushErrorMsg = pushErr.message || pushErr.stderr || '';
            // Si db push falla, puede ser porque las tablas ya existen o hay un error de conexión
            if (
              pushErrorMsg.includes('already exists') ||
              pushErrorMsg.includes('P1009') ||
              pushErrorMsg.includes('Database is up to date')
            ) {
              logger.log('ℹ️  Las tablas ya existen o el esquema está actualizado');
              return;
            }
            logger.warn(`⚠️  db push falló: ${pushErrorMsg}`);
            throw pushError;
          }
        }
        throw migrateError;
      }
    })();

    await Promise.race([migrationPromise, timeout]);
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

    // Agregar timeout de 30 segundos
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Seed timeout')), 30000),
    );

    const seedPromise = execAsync('npx ts-node --transpile-only prisma/seed.ts')
      .then(({ stdout, stderr }) => {
        if (stdout) logger.log(stdout.trim());
        if (stderr) {
          // Mostrar stderr completo para debugging
          logger.log(`Seed stderr: ${stderr.trim()}`);
        }
        logger.log('✅ Seed completado - Usuarios y datos iniciales creados');
      })
      .catch((seedErr: unknown) => {
        throw seedErr; // Re-throw para que el catch externo lo maneje
      });

    await Promise.race([seedPromise, timeout]);
  } catch (error: unknown) {
    const err = error as { message?: string; stderr?: string; stdout?: string };
    const errorMsg = err.message || err.stderr || '';

    // Si el seed falla, puede ser porque los datos ya existen
    if (
      errorMsg.includes('Unique constraint') ||
      errorMsg.includes('already exists') ||
      errorMsg.includes('timeout') ||
      errorMsg.includes('P2002') // Prisma unique constraint error code
    ) {
      if (errorMsg.includes('timeout')) {
        logger.warn('⏱️  Seed timeout - continuando sin datos iniciales');
      } else {
        logger.log('ℹ️  Los datos del seed ya existen o hay conflictos de unicidad');
      }
      return;
    }

    // Mostrar el error completo para debugging
    logger.error('❌ Error al ejecutar seed:');
    logger.error(`   Mensaje: ${errorMsg || 'Error desconocido'}`);
    if (err.stdout) logger.error(`   stdout: ${err.stdout.substring(0, 500)}`);
    if (err.stderr) logger.error(`   stderr: ${err.stderr.substring(0, 500)}`);
    logger.warn('⚠️  Continuando sin datos iniciales - puede que ya existan');
  }
}

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, {
      bufferLogs: true,
    });

    const configService = app.get(ConfigService);
    const logger = app.get(Logger);

    app.useLogger(logger);

    // Run database migrations automatically (non-blocking)
    runMigrations(logger).catch((err) => {
      logger.error('Error en migraciones (no bloqueante):', err);
    });

    // Run seed to create initial users and data (non-blocking)
    runSeed(logger, configService).catch((err) => {
      logger.error('Error en seed (no bloqueante):', err);
    });

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

    // Railway asigna el puerto automáticamente, usar process.env.PORT o variable de entorno
    const port = process.env.PORT || configService.get('PORT') || 3000;
    const portNumber = typeof port === 'string' ? parseInt(port, 10) : port;

    await app.listen(portNumber, '0.0.0.0');
    logger.log(`🚀 Application is running on port ${portNumber}`);
    logger.log(`📚 Swagger documentation available at /api/docs`);
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error('❌ Error fatal al iniciar la aplicación:', err.message || 'Error desconocido');
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('❌ Error fatal en bootstrap:', error);
  process.exit(1);
});
