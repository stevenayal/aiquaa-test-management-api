import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, AuditAction } from '@prisma/client';
import { AuditService } from './audit.service';

@ApiTags('audit')
@Controller('audit')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Get()
  @Roles(UserRole.admin, UserRole.qa_lead)
  @ApiOperation({ summary: 'Obtener eventos de auditoría' })
  @ApiResponse({ status: 200, description: 'Lista de eventos de auditoría' })
  async findAll(
    @Query('entity') entity?: string,
    @Query('entityId') entityId?: string,
    @Query('action') action?: AuditAction,
    @Query('actorId') actorId?: string,
  ) {
    if (entity && entityId) {
      return this.auditService.findByEntity(entity, entityId);
    }
    return this.auditService.findAll({ entity, action, actorId });
  }
}

