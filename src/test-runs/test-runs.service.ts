import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTestRunDto, UpdateTestRunDto } from './dto';
import { TestRunStatus } from '@prisma/client';

@Injectable()
export class TestRunsService {
  constructor(private prisma: PrismaService) {}

  async create(createTestRunDto: CreateTestRunDto) {
    return this.prisma.testRun.create({
      data: {
        ...createTestRunDto,
        status: TestRunStatus.scheduled,
      },
    });
  }

  async findAll(planId?: string) {
    return this.prisma.testRun.findMany({
      where: planId ? { planId } : undefined,
      include: {
        plan: true,
        suite: true,
        _count: {
          select: {
            results: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const run = await this.prisma.testRun.findUnique({
      where: { id },
      include: {
        plan: true,
        suite: true,
        results: {
          include: {
            testCase: true,
          },
        },
      },
    });

    if (!run) {
      throw new NotFoundException('Ejecución de prueba no encontrada');
    }

    return run;
  }

  async update(id: string, updateTestRunDto: UpdateTestRunDto) {
    const run = await this.findOne(id);

    // Business rule: TestRun solo puede cerrarse si todos los TestResult tienen outcome distinto de NotRun
    if (
      updateTestRunDto.status === TestRunStatus.completed ||
      updateTestRunDto.status === TestRunStatus.cancelled
    ) {
      const results = await this.prisma.testResult.findMany({
        where: { runId: id },
      });

      const hasNotRun = results.some((r) => r.outcome === 'NotRun');
      if (hasNotRun) {
        throw new BadRequestException(
          'No se puede cerrar una ejecución con resultados pendientes (NotRun)',
        );
      }
    }

    return this.prisma.testRun.update({
      where: { id },
      data: updateTestRunDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.testRun.delete({
      where: { id },
    });
  }
}
