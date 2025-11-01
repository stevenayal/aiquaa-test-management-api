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
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { TestResultsService } from './test-results.service';
import { CreateTestResultDto, BulkCreateTestResultDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('test-results')
@Controller('test-results')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TestResultsController {
  constructor(private readonly testResultsService: TestResultsService) {}

  @Post()
  @Roles(UserRole.admin, UserRole.qa_lead, UserRole.tester)
  @ApiOperation({ summary: 'Crear nuevo resultado de prueba' })
  create(@Body() createTestResultDto: CreateTestResultDto) {
    return this.testResultsService.create(createTestResultDto);
  }

  @Post('bulk')
  @Roles(UserRole.admin, UserRole.qa_lead, UserRole.tester)
  @ApiOperation({ summary: 'Crear múltiples resultados de prueba' })
  createBulk(@Body() bulkDto: BulkCreateTestResultDto) {
    return this.testResultsService.createBulk(bulkDto.runId, bulkDto);
  }

  @Get()
  @Roles(UserRole.admin, UserRole.qa_lead, UserRole.tester, UserRole.viewer)
  @ApiOperation({ summary: 'Obtener todos los resultados de prueba' })
  findAll(@Query('runId') runId?: string) {
    return this.testResultsService.findAll(runId);
  }

  @Get(':id')
  @Roles(UserRole.admin, UserRole.qa_lead, UserRole.tester, UserRole.viewer)
  @ApiOperation({ summary: 'Obtener un resultado de prueba por ID' })
  findOne(@Param('id') id: string) {
    return this.testResultsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.admin, UserRole.qa_lead, UserRole.tester)
  @ApiOperation({ summary: 'Actualizar resultado de prueba' })
  update(@Param('id') id: string, @Body() updateDto: Partial<CreateTestResultDto>) {
    return this.testResultsService.update(id, updateDto);
  }

  @Delete(':id')
  @Roles(UserRole.admin, UserRole.qa_lead)
  @ApiOperation({ summary: 'Eliminar resultado de prueba' })
  remove(@Param('id') id: string) {
    return this.testResultsService.remove(id);
  }

  @Post('runs/:id/results')
  @Roles(UserRole.admin, UserRole.qa_lead, UserRole.tester)
  @ApiOperation({ summary: 'Agregar resultados a una ejecución (bulk)' })
  @ApiParam({ name: 'id', description: 'ID de la ejecución' })
  addResults(@Param('id') runId: string, @Body() bulkDto: BulkCreateTestResultDto) {
    return this.testResultsService.createBulk(runId, bulkDto);
  }
}

