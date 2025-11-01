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
import { TestRunsService } from './test-runs.service';
import { CreateTestRunDto, UpdateTestRunDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('test-runs')
@Controller('test-runs')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TestRunsController {
  constructor(private readonly testRunsService: TestRunsService) {}

  @Post()
  @Roles(UserRole.admin, UserRole.qa_lead, UserRole.tester)
  @ApiOperation({ summary: 'Crear nueva ejecución de prueba' })
  create(@Body() createTestRunDto: CreateTestRunDto) {
    return this.testRunsService.create(createTestRunDto);
  }

  @Get()
  @Roles(UserRole.admin, UserRole.qa_lead, UserRole.tester, UserRole.viewer)
  @ApiOperation({ summary: 'Obtener todas las ejecuciones de prueba' })
  findAll(@Query('planId') planId?: string) {
    return this.testRunsService.findAll(planId);
  }

  @Get(':id')
  @Roles(UserRole.admin, UserRole.qa_lead, UserRole.tester, UserRole.viewer)
  @ApiOperation({ summary: 'Obtener una ejecución de prueba por ID' })
  findOne(@Param('id') id: string) {
    return this.testRunsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.admin, UserRole.qa_lead, UserRole.tester)
  @ApiOperation({ summary: 'Actualizar ejecución de prueba' })
  update(@Param('id') id: string, @Body() updateTestRunDto: UpdateTestRunDto) {
    return this.testRunsService.update(id, updateTestRunDto);
  }

  @Delete(':id')
  @Roles(UserRole.admin, UserRole.qa_lead)
  @ApiOperation({ summary: 'Eliminar ejecución de prueba' })
  remove(@Param('id') id: string) {
    return this.testRunsService.remove(id);
  }
}
