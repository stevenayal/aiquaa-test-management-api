import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RisksService } from './risks.service';
import { CreateRiskDto, UpdateRiskDto, SyncRiskMatrixDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('risks')
@Controller('risks')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RisksController {
  constructor(private readonly risksService: RisksService) {}

  @Post()
  @Roles(UserRole.admin, UserRole.qa_lead)
  @ApiOperation({ summary: 'Crear nuevo riesgo' })
  create(@Body() createRiskDto: CreateRiskDto) {
    return this.risksService.create(createRiskDto);
  }

  @Get()
  @Roles(UserRole.admin, UserRole.qa_lead, UserRole.tester, UserRole.viewer)
  @ApiOperation({ summary: 'Obtener todos los riesgos' })
  findAll(@Query('projectId') projectId?: string) {
    return this.risksService.findAll(projectId);
  }

  @Get(':id')
  @Roles(UserRole.admin, UserRole.qa_lead, UserRole.tester, UserRole.viewer)
  @ApiOperation({ summary: 'Obtener un riesgo por ID' })
  findOne(@Param('id') id: string) {
    return this.risksService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.admin, UserRole.qa_lead)
  @ApiOperation({ summary: 'Actualizar riesgo' })
  update(@Param('id') id: string, @Body() updateRiskDto: UpdateRiskDto) {
    return this.risksService.update(id, updateRiskDto);
  }

  @Delete(':id')
  @Roles(UserRole.admin, UserRole.qa_lead)
  @ApiOperation({ summary: 'Eliminar riesgo' })
  remove(@Param('id') id: string) {
    return this.risksService.remove(id);
  }

  @Post('sync')
  @Roles(UserRole.admin, UserRole.qa_lead)
  @ApiOperation({ summary: 'Sincronizar con Matriz de Riesgos AIQUAA' })
  sync(@Body() syncDto: SyncRiskMatrixDto) {
    return this.risksService.syncRiskMatrix(syncDto.projectId, syncDto);
  }
}
