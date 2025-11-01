import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from '../src/app.module';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function generateOpenAPI() {
  const app = await NestFactory.create(AppModule, { logger: false });
  
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
  
  // Guardar como JSON
  const jsonPath = join(process.cwd(), 'openapi.json');
  writeFileSync(jsonPath, JSON.stringify(document, null, 2), 'utf8');
  console.log(`✅ OpenAPI JSON generado en: ${jsonPath}`);
  
  // Guardar como YAML (opcional, requiere js-yaml)
  // const yamlPath = join(process.cwd(), 'openapi.yaml');
  // writeFileSync(yamlPath, yaml.dump(document), 'utf8');
  // console.log(`✅ OpenAPI YAML generado en: ${yamlPath}`);
  
  await app.close();
}

generateOpenAPI().catch((error) => {
  console.error('Error al generar OpenAPI:', error);
  process.exit(1);
});

