import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRiskDto, UpdateRiskDto, SyncRiskMatrixDto } from './dto';
import { RiskStatus } from '@prisma/client';

@Injectable()
export class RisksService {
  constructor(private prisma: PrismaService) {}

  async create(createRiskDto: CreateRiskDto) {
    // Calcular score y status
    const score = createRiskDto.probability * createRiskDto.impact;
    const status = this.calculateRiskStatus(score);

    return this.prisma.risk.create({
      data: {
        ...createRiskDto,
        score,
        status,
      },
    });
  }

  async findAll(projectId?: string) {
    return this.prisma.risk.findMany({
      where: projectId ? { projectId } : undefined,
      include: {
        owner: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: { score: 'desc' },
    });
  }

  async findOne(id: string) {
    const risk = await this.prisma.risk.findUnique({
      where: { id },
      include: {
        project: true,
        owner: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });

    if (!risk) {
      throw new NotFoundException('Riesgo no encontrado');
    }

    return risk;
  }

  async update(id: string, updateRiskDto: UpdateRiskDto) {
    const risk = await this.findOne(id);

    // Recalcular score si cambió probability o impact
    let score = risk.score;
    if (updateRiskDto.probability !== undefined || updateRiskDto.impact !== undefined) {
      const probability = updateRiskDto.probability ?? risk.probability;
      const impact = updateRiskDto.impact ?? risk.impact;
      score = probability * impact;
    }

    const status = this.calculateRiskStatus(score);

    return this.prisma.risk.update({
      where: { id },
      data: {
        ...updateRiskDto,
        score,
        status,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.risk.delete({
      where: { id },
    });
  }

  async syncRiskMatrix(projectId: string, syncDto: SyncRiskMatrixDto) {
    const results = [];

    for (const riskData of syncDto.risks) {
      // Validar probability e impact (1-5)
      if (
        riskData.probability < 1 ||
        riskData.probability > 5 ||
        riskData.impact < 1 ||
        riskData.impact > 5
      ) {
        throw new BadRequestException('Probability e impact deben estar entre 1 y 5');
      }

      const score = riskData.probability * riskData.impact;
      const status = this.calculateRiskStatus(score);

      const risk = await this.prisma.risk.upsert({
        where: {
          id: riskData.id || 'temp',
        },
        update: {
          description: riskData.description,
          category: riskData.category,
          probability: riskData.probability,
          impact: riskData.impact,
          score,
          status,
          mitigation: riskData.mitigation,
          contingency: riskData.contingency,
          detectionMetric: riskData.detectionMetric,
          dueDate: riskData.dueDate,
        },
        create: {
          projectId,
          description: riskData.description,
          category: riskData.category,
          probability: riskData.probability,
          impact: riskData.impact,
          score,
          status,
          mitigation: riskData.mitigation,
          contingency: riskData.contingency,
          detectionMetric: riskData.detectionMetric,
          dueDate: riskData.dueDate,
          ownerId: riskData.ownerId,
        },
      });

      results.push(risk);
    }

    return {
      synced: results.length,
      risks: results,
    };
  }

  private calculateRiskStatus(score: number): RiskStatus {
    if (score <= 4) {
      return RiskStatus.closed; // Verde
    } else if (score >= 12) {
      return RiskStatus.open; // Rojo
    } else {
      return RiskStatus.mitigated; // Amarillo (5-11)
    }
  }
}
