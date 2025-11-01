import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRequirementDto, UpdateRequirementDto, AnalyzeRequirementDto } from './dto';

@Injectable()
export class RequirementsService {
  constructor(private prisma: PrismaService) {}

  async create(createRequirementDto: CreateRequirementDto) {
    return this.prisma.requirement.create({
      data: createRequirementDto,
    });
  }

  async findAll(projectId?: string) {
    return this.prisma.requirement.findMany({
      where: projectId ? { projectId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const requirement = await this.prisma.requirement.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });

    if (!requirement) {
      throw new NotFoundException('Requisito no encontrado');
    }

    return requirement;
  }

  async update(id: string, updateRequirementDto: UpdateRequirementDto) {
    await this.findOne(id);
    return this.prisma.requirement.update({
      where: { id },
      data: updateRequirementDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.requirement.delete({
      where: { id },
    });
  }

  async analyze(id: string, analyzeDto: AnalyzeRequirementDto) {
    const requirement = await this.findOne(id);

    // Stub: Req-Lint integration
    // En producción, esto llamaría al servicio AIQUAA Req-Lint
    const rules = [
      { name: 'completeness', passed: requirement.text.length > 50 },
      {
        name: 'specificity',
        passed: requirement.text.includes('debe') || requirement.text.includes('debería'),
      },
      { name: 'testability', passed: requirement.title.length > 10 },
    ];

    const passed = rules.every((r) => r.passed);
    const result = {
      requirementId: id,
      analyzedAt: new Date(),
      rules,
      passed,
      recommendations: passed
        ? []
        : ['Mejorar la especificidad del requisito', 'Asegurar que sea verificable'],
    };

    // Guardar resultado en el requisito (actualizar metadata si es necesario)
    return result;
  }
}
