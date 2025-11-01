import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  const configService = app.get(ConfigService);
  const logger = app.get(Logger);

  app.useLogger(logger);

  // Redirect root to Swagger
  app.getHttpAdapter().get('/', (req, res) => {
    res.redirect('/api/docs');
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

