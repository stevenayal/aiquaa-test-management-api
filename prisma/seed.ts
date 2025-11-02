import { PrismaClient, UserRole, TestCasePriority, TestSuiteType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// Helper function para crear o ignorar si ya existe
async function createOrIgnore<T>(
  operation: () => Promise<T>,
  errorMessage?: string,
): Promise<T | null> {
  try {
    return await operation();
  } catch (error: any) {
    // Ignorar errores de constraint único (duplicados)
    if (
      error?.code === 'P2002' ||
      error?.message?.includes('Unique constraint') ||
      error?.message?.includes('already exists')
    ) {
      if (errorMessage) {
        console.log(`ℹ️  ${errorMessage} (ya existe, omitiendo)`);
      }
      return null;
    }
    throw error;
  }
}

async function main() {
  console.log('🌱 Seeding database...');

  // Crear usuarios usando upsert para evitar problemas de concurrencia
  const adminPassword = await bcrypt.hash('admin123', 10);
  const qaLeadPassword = await bcrypt.hash('qalead123', 10);
  const testerPassword = await bcrypt.hash('tester123', 10);
  const viewerPassword = await bcrypt.hash('viewer123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@aiquaa.com' },
    update: {},
    create: {
      email: 'admin@aiquaa.com',
      passwordHash: adminPassword,
      role: UserRole.admin,
    },
  });

  const qaLead = await prisma.user.upsert({
    where: { email: 'qalead@aiquaa.com' },
    update: {},
    create: {
      email: 'qalead@aiquaa.com',
      passwordHash: qaLeadPassword,
      role: UserRole.qa_lead,
    },
  });

  const tester = await prisma.user.upsert({
    where: { email: 'tester@aiquaa.com' },
    update: {},
    create: {
      email: 'tester@aiquaa.com',
      passwordHash: testerPassword,
      role: UserRole.tester,
    },
  });

  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@aiquaa.com' },
    update: {},
    create: {
      email: 'viewer@aiquaa.com',
      passwordHash: viewerPassword,
      role: UserRole.viewer,
    },
  });

  console.log('✅ Users created');

  // Crear proyecto demo
  const project = await prisma.project.upsert({
    where: { key: 'DEMO' },
    update: {},
    create: {
      name: 'Proyecto Demo',
      key: 'DEMO',
      active: true,
    },
  });

  console.log('✅ Project created');

  // Crear requisito demo
  const requirement = await createOrIgnore(
    () =>
      prisma.requirement.create({
        data: {
          projectId: project.id,
          externalKey: 'REQ-001',
          title: 'El sistema debe permitir autenticación de usuarios',
          text: 'El sistema debe permitir que los usuarios se autentiquen utilizando email y contraseña. La contraseña debe tener al menos 6 caracteres.',
          status: 'approved',
        },
      }),
    'Requisito REQ-001',
  );

  if (requirement) {
    console.log('✅ Requirement created');
  }

  // Crear plan de prueba demo - usar findFirst para obtenerlo si ya existe
  let testPlan = await prisma.testPlan.findFirst({
    where: {
      projectId: project.id,
      name: 'Plan de Prueba Demo - Autenticación',
    },
  });

  if (!testPlan) {
    testPlan = await prisma.testPlan.create({
      data: {
        projectId: project.id,
        name: 'Plan de Prueba Demo - Autenticación',
        description: 'Plan de prueba para validar el flujo de autenticación',
      },
    });
    console.log('✅ Test plan created');
  } else {
    console.log('ℹ️  Test plan ya existe, usando el existente');
  }

  // Crear suite de prueba
  let testSuite = await prisma.testSuite.findFirst({
    where: {
      planId: testPlan.id,
      name: 'Suite de Autenticación',
    },
  });

  if (!testSuite) {
    testSuite = await prisma.testSuite.create({
      data: {
        planId: testPlan.id,
        name: 'Suite de Autenticación',
        type: TestSuiteType.static,
      },
    });
    console.log('✅ Test suite created');
  } else {
    console.log('ℹ️  Test suite ya existe, usando la existente');
  }

  // Crear casos de prueba demo
  let testCase1 = await prisma.testCase.findFirst({
    where: {
      projectId: project.id,
      externalKey: 'TC-001',
    },
  });

  if (!testCase1) {
    testCase1 = await prisma.testCase.create({
      data: {
        projectId: project.id,
        externalKey: 'TC-001',
        title: 'Login exitoso con credenciales válidas',
        preconditions: 'Usuario registrado en el sistema',
        priority: TestCasePriority.Alta,
        tags: ['autenticación', 'login'],
        steps: [
          { step: 1, action: 'Ingresar email válido', expectedResult: 'Campo acepta el input' },
          { step: 2, action: 'Ingresar contraseña válida', expectedResult: 'Campo acepta el input' },
          { step: 3, action: 'Hacer clic en "Iniciar sesión"', expectedResult: 'Usuario autenticado exitosamente' },
        ],
      },
    });
  }

  let testCase2 = await prisma.testCase.findFirst({
    where: {
      projectId: project.id,
      externalKey: 'TC-002',
    },
  });

  if (!testCase2) {
    testCase2 = await prisma.testCase.create({
      data: {
        projectId: project.id,
        externalKey: 'TC-002',
        title: 'Login fallido con credenciales inválidas',
        preconditions: 'Usuario intenta iniciar sesión',
        priority: TestCasePriority.Alta,
        tags: ['autenticación', 'login', 'seguridad'],
        steps: [
          { step: 1, action: 'Ingresar email inválido', expectedResult: 'Campo acepta el input' },
          { step: 2, action: 'Ingresar contraseña inválida', expectedResult: 'Campo acepta el input' },
          { step: 3, action: 'Hacer clic en "Iniciar sesión"', expectedResult: 'Mensaje de error: Credenciales inválidas' },
        ],
      },
    });
  }

  let testCase3 = await prisma.testCase.findFirst({
    where: {
      projectId: project.id,
      externalKey: 'TC-003',
    },
  });

  if (!testCase3) {
    testCase3 = await prisma.testCase.create({
      data: {
        projectId: project.id,
        externalKey: 'TC-003',
        title: 'Validación de campos requeridos',
        preconditions: 'Usuario en la pantalla de login',
        priority: TestCasePriority.Media,
        tags: ['validación', 'ui'],
        steps: [
          { step: 1, action: 'Dejar campos vacíos', expectedResult: 'Campos muestran estado inicial' },
          { step: 2, action: 'Intentar hacer clic en "Iniciar sesión"', expectedResult: 'Mensaje de validación: Campos requeridos' },
        ],
      },
    });
  }

  // Asegurar que los casos de prueba existen
  if (!testCase1 || !testCase2 || !testCase3) {
    throw new Error('No se pudieron crear o encontrar los casos de prueba necesarios');
  }

  console.log('✅ Test cases verificados/creados');

  // Crear ejecución de prueba demo
  let testRun = await prisma.testRun.findFirst({
    where: {
      planId: testPlan.id,
      suiteId: testSuite.id,
      name: 'Ejecución Demo - Sprint 1',
    },
  });

  if (!testRun) {
    testRun = await prisma.testRun.create({
      data: {
        planId: testPlan.id,
        suiteId: testSuite.id,
        name: 'Ejecución Demo - Sprint 1',
        scheduledAt: new Date(),
        status: 'in_progress',
      },
    });
    console.log('✅ Test run created');
  } else {
    console.log('ℹ️  Test run ya existe, usando el existente');
  }

  // Crear resultados de prueba demo (solo si no existen)
  if (testRun) {
    const existingResults = await prisma.testResult.findMany({
      where: {
        runId: testRun.id,
      },
    });

    if (existingResults.length === 0) {
      await createOrIgnore(
        () =>
          prisma.testResult.create({
            data: {
              runId: testRun.id,
              caseId: testCase1!.id,
              outcome: 'Pass',
              comment: 'Caso ejecutado exitosamente',
              executedAt: new Date(),
            },
          }),
        'Test result TC-001',
      );

      await createOrIgnore(
        () =>
          prisma.testResult.create({
            data: {
              runId: testRun.id,
              caseId: testCase2!.id,
              outcome: 'Pass',
              comment: 'Validación de error funciona correctamente',
              executedAt: new Date(),
            },
          }),
        'Test result TC-002',
      );

      await createOrIgnore(
        () =>
          prisma.testResult.create({
            data: {
              runId: testRun.id,
              caseId: testCase3!.id,
              outcome: 'NotRun',
              comment: 'Pendiente de ejecución',
            },
          }),
        'Test result TC-003',
      );

      console.log('✅ Test results created');
    } else {
      console.log('ℹ️  Test results ya existen, omitiendo');
    }
  }

  // Crear defecto demo
  let defect = await prisma.defect.findFirst({
    where: {
      projectId: project.id,
      externalKey: 'DEF-001',
    },
  });

  if (!defect) {
    defect = await prisma.defect.create({
      data: {
        projectId: project.id,
        title: 'Error al validar formato de email',
        description: 'El sistema no valida correctamente el formato de email cuando se ingresa un email inválido',
        severity: 'high',
        status: 'new',
        externalKey: 'DEF-001',
      },
    });

    // Vincular defecto con caso de prueba
    await createOrIgnore(
      () =>
        prisma.defectLink.create({
          data: {
            defectId: defect.id,
            testCaseId: testCase2!.id,
          },
        }),
      'Defect link',
    );

    console.log('✅ Defect created and linked');
  } else {
    console.log('ℹ️  Defect ya existe, omitiendo');
  }

  // Crear riesgo demo
  await createOrIgnore(
    () =>
      prisma.risk.create({
        data: {
          projectId: project.id,
          description: 'Riesgo de exposición de credenciales en logs',
          category: 'security',
          probability: 3,
          impact: 5,
          score: 15,
          status: 'open',
          ownerId: qaLead.id,
          mitigation: 'Implementar sanitización de logs y usar niveles de log apropiados',
          contingency: 'Rotar credenciales expuestas y notificar a usuarios afectados',
          detectionMetric: 'Revisión de logs cada 24 horas',
        },
      }),
    'Risk',
  );

  if (await prisma.risk.count({ where: { projectId: project.id } }) > 0) {
    console.log('✅ Risk verificado/creado');
  }

  // Crear checklist demo
  await createOrIgnore(
    () =>
      prisma.checklist.create({
        data: {
          projectId: project.id,
          name: 'Checklist de Seguridad - Autenticación',
          type: 'Security',
          items: [
            { item: 'Validar autenticación', checked: true },
            { item: 'Verificar autorización', checked: true },
            { item: 'Comprobar encriptación de datos', checked: false },
            { item: 'Validar manejo de sesiones', checked: true },
            { item: 'Verificar protección CSRF/XSS', checked: false },
          ],
        },
      }),
    'Checklist',
  );

  if (await prisma.checklist.count({ where: { projectId: project.id } }) > 0) {
    console.log('✅ Checklist verificado/creado');
  }

  console.log('\n📊 Seed Summary:');
  console.log(`  - Users: 4`);
  console.log(`  - Projects: 1`);
  console.log(`  - Requirements: 1`);
  console.log(`  - Test Plans: 1`);
  console.log(`  - Test Suites: 1`);
  console.log(`  - Test Cases: 3`);
  console.log(`  - Test Runs: 1`);
  console.log(`  - Test Results: 3`);
  console.log(`  - Defects: 1`);
  console.log(`  - Risks: 1`);
  console.log(`  - Checklists: 1`);
  console.log('\n✨ Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

