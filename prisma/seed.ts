import { PrismaClient, UserRole, TestCasePriority, TestSuiteType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Crear usuarios
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
  const requirement = await prisma.requirement.create({
    data: {
      projectId: project.id,
      externalKey: 'REQ-001',
      title: 'El sistema debe permitir autenticación de usuarios',
      text: 'El sistema debe permitir que los usuarios se autentiquen utilizando email y contraseña. La contraseña debe tener al menos 6 caracteres.',
      status: 'approved',
    },
  });

  console.log('✅ Requirement created');

  // Crear plan de prueba demo
  const testPlan = await prisma.testPlan.create({
    data: {
      projectId: project.id,
      name: 'Plan de Prueba Demo - Autenticación',
      description: 'Plan de prueba para validar el flujo de autenticación',
    },
  });

  console.log('✅ Test plan created');

  // Crear suite de prueba
  const testSuite = await prisma.testSuite.create({
    data: {
      planId: testPlan.id,
      name: 'Suite de Autenticación',
      type: TestSuiteType.static,
    },
  });

  console.log('✅ Test suite created');

  // Crear casos de prueba demo
  const testCase1 = await prisma.testCase.create({
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

  const testCase2 = await prisma.testCase.create({
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

  const testCase3 = await prisma.testCase.create({
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

  console.log('✅ Test cases created');

  // Crear ejecución de prueba demo
  const testRun = await prisma.testRun.create({
    data: {
      planId: testPlan.id,
      suiteId: testSuite.id,
      name: 'Ejecución Demo - Sprint 1',
      scheduledAt: new Date(),
      status: 'in_progress',
    },
  });

  console.log('✅ Test run created');

  // Crear resultados de prueba demo
  await prisma.testResult.create({
    data: {
      runId: testRun.id,
      caseId: testCase1.id,
      outcome: 'Pass',
      comment: 'Caso ejecutado exitosamente',
      executedAt: new Date(),
    },
  });

  await prisma.testResult.create({
    data: {
      runId: testRun.id,
      caseId: testCase2.id,
      outcome: 'Pass',
      comment: 'Validación de error funciona correctamente',
      executedAt: new Date(),
    },
  });

  await prisma.testResult.create({
    data: {
      runId: testRun.id,
      caseId: testCase3.id,
      outcome: 'NotRun',
      comment: 'Pendiente de ejecución',
    },
  });

  console.log('✅ Test results created');

  // Crear defecto demo
  const defect = await prisma.defect.create({
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
  await prisma.defectLink.create({
    data: {
      defectId: defect.id,
      testCaseId: testCase2.id,
    },
  });

  console.log('✅ Defect created and linked');

  // Crear riesgo demo
  await prisma.risk.create({
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
  });

  console.log('✅ Risk created');

  // Crear checklist demo
  await prisma.checklist.create({
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
  });

  console.log('✅ Checklist created');

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

