import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDefectDto, UpdateDefectDto, LinkDefectDto } from './dto';

@Injectable()
export class DefectsService {
  constructor(private prisma: PrismaService) {}

  async create(createDefectDto: CreateDefectDto) {
    return this.prisma.defect.create({
      data: createDefectDto,
    });
  }

  async findAll(projectId?: string) {
    return this.prisma.defect.findMany({
      where: projectId ? { projectId } : undefined,
      include: {
        links: {
          include: {
            testCase: true,
            testResult: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const defect = await this.prisma.defect.findUnique({
      where: { id },
      include: {
        project: true,
        links: {
          include: {
            testCase: true,
            testResult: true,
          },
        },
      },
    });

    if (!defect) {
      throw new NotFoundException('Defecto no encontrado');
    }

    return defect;
  }

  async update(id: string, updateDefectDto: UpdateDefectDto) {
    await this.findOne(id);
    return this.prisma.defect.update({
      where: { id },
      data: updateDefectDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.defect.delete({
      where: { id },
    });
  }

  async linkDefect(defectId: string, linkDto: LinkDefectDto) {
    await this.findOne(defectId);

    // Verificar que los IDs existen
    if (linkDto.testCaseId) {
      const testCase = await this.prisma.testCase.findUnique({
        where: { id: linkDto.testCaseId },
      });
      if (!testCase) {
        throw new NotFoundException('Caso de prueba no encontrado');
      }
    }

    if (linkDto.testResultId) {
      const testResult = await this.prisma.testResult.findUnique({
        where: { id: linkDto.testResultId },
      });
      if (!testResult) {
        throw new NotFoundException('Resultado de prueba no encontrado');
      }
    }

    return this.prisma.defectLink.create({
      data: {
        defectId,
        testCaseId: linkDto.testCaseId,
        testResultId: linkDto.testResultId,
        requirementId: linkDto.requirementId,
      },
    });
  }
}

