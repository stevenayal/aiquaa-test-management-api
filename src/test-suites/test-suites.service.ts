import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTestSuiteDto, UpdateTestSuiteDto } from './dto';

@Injectable()
export class TestSuitesService {
  constructor(private prisma: PrismaService) {}

  async create(createTestSuiteDto: CreateTestSuiteDto) {
    return this.prisma.testSuite.create({
      data: createTestSuiteDto,
    });
  }

  async findAll(planId?: string) {
    return this.prisma.testSuite.findMany({
      where: planId ? { planId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const suite = await this.prisma.testSuite.findUnique({
      where: { id },
      include: {
        plan: true,
      },
    });

    if (!suite) {
      throw new NotFoundException('Suite de prueba no encontrada');
    }

    return suite;
  }

  async update(id: string, updateTestSuiteDto: UpdateTestSuiteDto) {
    await this.findOne(id);
    return this.prisma.testSuite.update({
      where: { id },
      data: updateTestSuiteDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.testSuite.delete({
      where: { id },
    });
  }
}

