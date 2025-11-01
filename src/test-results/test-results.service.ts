import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTestResultDto, BulkCreateTestResultDto } from './dto';
import { TestResultOutcome } from '@prisma/client';

@Injectable()
export class TestResultsService {
  constructor(private prisma: PrismaService) {}

  async create(createTestResultDto: CreateTestResultDto) {
    return this.prisma.testResult.create({
      data: {
        ...createTestResultDto,
        executedAt: new Date(),
      },
    });
  }

  async createBulk(runId: string, bulkDto: BulkCreateTestResultDto) {
    const results = bulkDto.results.map((result) => ({
      runId,
      caseId: result.caseId,
      outcome: result.outcome,
      evidenceUrl: result.evidenceUrl,
      comment: result.comment,
      executedAt: new Date(),
    }));

    return this.prisma.testResult.createMany({
      data: results,
      skipDuplicates: true,
    });
  }

  async findAll(runId?: string) {
    return this.prisma.testResult.findMany({
      where: runId ? { runId } : undefined,
      include: {
        run: true,
        testCase: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const result = await this.prisma.testResult.findUnique({
      where: { id },
      include: {
        run: true,
        testCase: true,
      },
    });

    if (!result) {
      throw new NotFoundException('Resultado de prueba no encontrado');
    }

    return result;
  }

  async update(id: string, updateDto: Partial<CreateTestResultDto>) {
    await this.findOne(id);
    return this.prisma.testResult.update({
      where: { id },
      data: {
        ...updateDto,
        executedAt: new Date(),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.testResult.delete({
      where: { id },
    });
  }
}

