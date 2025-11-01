import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTestPlanDto, UpdateTestPlanDto } from './dto';

@Injectable()
export class TestPlansService {
  constructor(private prisma: PrismaService) {}

  async create(createTestPlanDto: CreateTestPlanDto) {
    return this.prisma.testPlan.create({
      data: createTestPlanDto,
    });
  }

  async findAll(projectId?: string) {
    return this.prisma.testPlan.findMany({
      where: projectId ? { projectId } : undefined,
      include: {
        _count: {
          select: {
            suites: true,
            testRuns: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const plan = await this.prisma.testPlan.findUnique({
      where: { id },
      include: {
        project: true,
        suites: true,
        _count: {
          select: {
            testRuns: true,
          },
        },
      },
    });

    if (!plan) {
      throw new NotFoundException('Plan de prueba no encontrado');
    }

    return plan;
  }

  async update(id: string, updateTestPlanDto: UpdateTestPlanDto) {
    await this.findOne(id);
    return this.prisma.testPlan.update({
      where: { id },
      data: updateTestPlanDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.testPlan.delete({
      where: { id },
    });
  }
}

