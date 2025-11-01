import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTestCaseDto, UpdateTestCaseDto, ImportJsonDto } from './dto';
import { TestCasePriority } from '@prisma/client';
import { RequirementsService } from '../requirements/requirements.service';
import * as ExcelJS from 'exceljs';

@Injectable()
export class TestCasesService {
  constructor(
    private prisma: PrismaService,
    private requirementsService: RequirementsService,
  ) {}

  async create(createTestCaseDto: CreateTestCaseDto) {
    return this.prisma.testCase.create({
      data: {
        ...createTestCaseDto,
        steps: createTestCaseDto.steps as any,
        tags: createTestCaseDto.tags || [],
      },
    });
  }

  async findAll(projectId?: string) {
    return this.prisma.testCase.findMany({
      where: projectId ? { projectId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const testCase = await this.prisma.testCase.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });

    if (!testCase) {
      throw new NotFoundException('Caso de prueba no encontrado');
    }

    return testCase;
  }

  async update(id: string, updateTestCaseDto: UpdateTestCaseDto) {
    await this.findOne(id);
    return this.prisma.testCase.update({
      where: { id },
      data: {
        ...updateTestCaseDto,
        steps: updateTestCaseDto.steps as any,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.testCase.delete({
      where: { id },
    });
  }

  async importFromJson(importDto: ImportJsonDto) {
    const { projectId, data } = importDto;

    // Validar formato AIQUAA
    if (!data.id_work_item || !data.casos_prueba || !Array.isArray(data.casos_prueba)) {
      throw new BadRequestException('Formato JSON inválido. Se espera formato AIQUAA.');
    }

    const results = [];

    // Crear Requirement si viene datos_jira
    if (data.datos_jira?.key) {
      try {
        await this.requirementsService.create({
          projectId,
          externalKey: data.datos_jira.key,
          title: data.datos_jira.summary || `REQ-${data.datos_jira.key}`,
          text: data.datos_jira.description || '',
          status: 'draft',
        });
      } catch (error) {
        // Ignorar si ya existe
      }
    }

    // Mapear casos de prueba
    for (const caso of data.casos_prueba) {
      const steps =
        caso.pasos?.map((paso: string, index: number) => ({
          step: index + 1,
          action: paso,
          expectedResult: caso.datos_prueba?.[`resultado_esperado_${index + 1}`] || '',
        })) || [];

      const priority = this.mapPriority(caso.prioridad || 'Media');

      const testCase = await this.prisma.testCase.create({
        data: {
          projectId,
          externalKey: caso.id_caso_prueba,
          title: caso.titulo || `Caso ${caso.id_caso_prueba}`,
          preconditions: caso.precondiciones?.join('\n') || null,
          priority,
          tags: caso.tags || [],
          steps: steps as any,
        },
      });

      results.push(testCase);
    }

    return {
      imported: results.length,
      testCases: results,
    };
  }

  private mapPriority(prioridad: string): TestCasePriority {
    const normalized = prioridad.toLowerCase();
    if (normalized.includes('alta') || normalized.includes('high')) {
      return TestCasePriority.Alta;
    }
    if (normalized.includes('baja') || normalized.includes('low')) {
      return TestCasePriority.Baja;
    }
    return TestCasePriority.Media;
  }

  async exportToCsv(projectId: string): Promise<string> {
    const testCases = await this.findAll(projectId);

    const headers = ['ID', 'External Key', 'Title', 'Priority', 'Tags', 'Preconditions', 'Steps'];
    const rows = testCases.map((tc) => [
      tc.id,
      tc.externalKey || '',
      tc.title,
      tc.priority,
      tc.tags.join(';'),
      tc.preconditions || '',
      JSON.stringify(tc.steps),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    return csv;
  }

  async exportToXlsx(projectId: string): Promise<Buffer> {
    const testCases = await this.findAll(projectId);
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Test Cases');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 36 },
      { header: 'External Key', key: 'externalKey', width: 20 },
      { header: 'Title', key: 'title', width: 50 },
      { header: 'Priority', key: 'priority', width: 10 },
      { header: 'Tags', key: 'tags', width: 30 },
      { header: 'Preconditions', key: 'preconditions', width: 50 },
      { header: 'Steps', key: 'steps', width: 100 },
    ];

    testCases.forEach((tc) => {
      worksheet.addRow({
        id: tc.id,
        externalKey: tc.externalKey || '',
        title: tc.title,
        priority: tc.priority,
        tags: tc.tags.join(';'),
        preconditions: tc.preconditions || '',
        steps: JSON.stringify(tc.steps),
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }
}
