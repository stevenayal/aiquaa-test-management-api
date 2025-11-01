import { Controller, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiBody } from '@nestjs/swagger';
import { IntegrationsService } from './integrations.service';
import {
  ProcessCiWebhookDto,
  JiraCredentialsDto,
  AzureDevOpsCredentialsDto,
  CreateExternalKeyDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('integrations')
@Controller('integrations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Post('ci/webhook')
  @Roles(UserRole.admin, UserRole.qa_lead)
  @ApiOperation({ summary: 'Recibir webhook de CI con resultados automatizados' })
  @ApiBody({
    schema: {
      example: {
        format: 'junit-xml',
        data: '<?xml version="1.0"?><testsuites>...</testsuites>',
      },
    },
  })
  processCiWebhook(@Body() webhookDto: ProcessCiWebhookDto) {
    return this.integrationsService.processCiWebhook(webhookDto);
  }

  @Post('jira/credentials')
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Guardar credenciales de Jira (stub)' })
  saveJiraCredentials(@Body() credentials: JiraCredentialsDto) {
    return this.integrationsService.saveJiraCredentials(credentials);
  }

  @Post('azure-devops/credentials')
  @Roles(UserRole.admin)
  @ApiOperation({ summary: 'Guardar credenciales de Azure DevOps (stub)' })
  saveAzureDevOpsCredentials(@Body() credentials: AzureDevOpsCredentialsDto) {
    return this.integrationsService.saveAzureDevOpsCredentials(credentials);
  }

  @Post(':entity/:entityId/external-key')
  @Roles(UserRole.admin, UserRole.qa_lead)
  @ApiOperation({ summary: 'Crear external key en Jira/Azure DevOps (stub)' })
  @ApiParam({ name: 'entity', enum: ['defect', 'requirement'] })
  createExternalKey(
    @Param('entity') entity: 'defect' | 'requirement',
    @Param('entityId') entityId: string,
    @Body() createDto: CreateExternalKeyDto,
  ) {
    return this.integrationsService.createExternalKey(entity, entityId, createDto.externalKey);
  }
}
