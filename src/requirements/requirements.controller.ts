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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { RequirementsService } from './requirements.service';
import { CreateRequirementDto, UpdateRequirementDto, AnalyzeRequirementDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('requirements')
@Controller('requirements')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RequirementsController {
  constructor(private readonly requirementsService: RequirementsService) {}

  @Post()
  @Roles(UserRole.admin, UserRole.qa_lead)
  @ApiOperation({ summary: 'Crear nuevo requisito' })
  create(@Body() createRequirementDto: CreateRequirementDto) {
    return this.requirementsService.create(createRequirementDto);
  }

  @Get()
  @Roles(UserRole.admin, UserRole.qa_lead, UserRole.tester, UserRole.viewer)
  @ApiOperation({ summary: 'Obtener todos los requisitos' })
  @ApiQuery({ name: 'projectId', required: false })
  findAll(@Query('projectId') projectId?: string) {
    return this.requirementsService.findAll(projectId);
  }

  @Get(':id')
  @Roles(UserRole.admin, UserRole.qa_lead, UserRole.tester, UserRole.viewer)
  @ApiOperation({ summary: 'Obtener un requisito por ID' })
  findOne(@Param('id') id: string) {
    return this.requirementsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.admin, UserRole.qa_lead)
  @ApiOperation({ summary: 'Actualizar requisito' })
  update(@Param('id') id: string, @Body() updateRequirementDto: UpdateRequirementDto) {
    return this.requirementsService.update(id, updateRequirementDto);
  }

  @Delete(':id')
  @Roles(UserRole.admin, UserRole.qa_lead)
  @ApiOperation({ summary: 'Eliminar requisito' })
  remove(@Param('id') id: string) {
    return this.requirementsService.remove(id);
  }

  @Post(':id/analyze')
  @Roles(UserRole.admin, UserRole.qa_lead)
  @ApiOperation({ summary: 'Analizar requisito con Req-Lint' })
  @ApiParam({ name: 'id', description: 'ID del requisito' })
  analyze(@Param('id') id: string, @Body() analyzeDto: AnalyzeRequirementDto) {
    return this.requirementsService.analyze(id, analyzeDto);
  }
}
