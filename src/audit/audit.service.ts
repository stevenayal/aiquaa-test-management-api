import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditAction, Prisma } from '@prisma/client';

export interface AuditContext {
  actorId: string;
  entity: string;
  entityId: string;
  action: AuditAction;
  diff?: {
    before?: any;
    after?: any;
  };
}

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(context: AuditContext) {
    try {
      await this.prisma.auditEvent.create({
        data: {
          actorId: context.actorId,
          entity: context.entity,
          entityId: context.entityId,
          action: context.action,
          diff: context.diff ? (context.diff as Prisma.InputJsonValue) : undefined,
        },
      });
    } catch (error) {
      // Log error but don't fail the request
      console.error('Error logging audit event:', error);
    }
  }

  async findByEntity(entity: string, entityId: string) {
    return this.prisma.auditEvent.findMany({
      where: {
        entity,
        entityId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        actor: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(filters?: { entity?: string; actorId?: string; action?: AuditAction }) {
    return this.prisma.auditEvent.findMany({
      where: filters,
      orderBy: {
        createdAt: 'desc',
      },
      take: 100,
      include: {
        actor: {
          select: {
            id: true,
            email: true,
          },
        },
      },
    });
  }
}
