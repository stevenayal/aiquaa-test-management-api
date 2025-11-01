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
import { TestPlansService } from './test-plans.service';
import { CreateTestPlanDto, UpdateTestPlanDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('test-plans')
@Controller('test-plans')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TestPlansController {
  constructor(private readonly testPlansService: TestPlansService) {}

  @Post()
  @Roles(UserRole.admin, UserRole.qa_lead)
  @ApiOperation({ summary: 'Crear nuevo plan de prueba' })
  create(@Body() createTestPlanDto: CreateTestPlanDto) {
    return this.testPlansService.create(createTestPlanDto);
  }

  @Get()
  @Roles(UserRole.admin, UserRole.qa_lead, UserRole.tester, UserRole.viewer)
  @ApiOperation({ summary: 'Obtener todos los planes de prueba' })
  findAll(@Query('projectId') projectId?: string) {
    return this.testPlansService.findAll(projectId);
  }

  @Get(':id')
  @Roles(UserRole.admin, UserRole.qa_lead, UserRole.tester, UserRole.viewer)
  @ApiOperation({ summary: 'Obtener un plan de prueba por ID' })
  findOne(@Param('id') id: string) {
    return this.testPlansService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.admin, UserRole.qa_lead)
  @ApiOperation({ summary: 'Actualizar plan de prueba' })
  update(@Param('id') id: string, @Body() updateTestPlanDto: UpdateTestPlanDto) {
    return this.testPlansService.update(id, updateTestPlanDto);
  }

  @Delete(':id')
  @Roles(UserRole.admin, UserRole.qa_lead)
  @ApiOperation({ summary: 'Eliminar plan de prueba' })
  remove(@Param('id') id: string) {
    return this.testPlansService.remove(id);
  }
}
