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
import { TestSuitesService } from './test-suites.service';
import { CreateTestSuiteDto, UpdateTestSuiteDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('test-suites')
@Controller('test-suites')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TestSuitesController {
  constructor(private readonly testSuitesService: TestSuitesService) {}

  @Post()
  @Roles(UserRole.admin, UserRole.qa_lead)
  @ApiOperation({ summary: 'Crear nueva suite de prueba' })
  create(@Body() createTestSuiteDto: CreateTestSuiteDto) {
    return this.testSuitesService.create(createTestSuiteDto);
  }

  @Get()
  @Roles(UserRole.admin, UserRole.qa_lead, UserRole.tester, UserRole.viewer)
  @ApiOperation({ summary: 'Obtener todas las suites de prueba' })
  findAll(@Query('planId') planId?: string) {
    return this.testSuitesService.findAll(planId);
  }

  @Get(':id')
  @Roles(UserRole.admin, UserRole.qa_lead, UserRole.tester, UserRole.viewer)
  @ApiOperation({ summary: 'Obtener una suite de prueba por ID' })
  findOne(@Param('id') id: string) {
    return this.testSuitesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.admin, UserRole.qa_lead)
  @ApiOperation({ summary: 'Actualizar suite de prueba' })
  update(@Param('id') id: string, @Body() updateTestSuiteDto: UpdateTestSuiteDto) {
    return this.testSuitesService.update(id, updateTestSuiteDto);
  }

  @Delete(':id')
  @Roles(UserRole.admin, UserRole.qa_lead)
  @ApiOperation({ summary: 'Eliminar suite de prueba' })
  remove(@Param('id') id: string) {
    return this.testSuitesService.remove(id);
  }
}
