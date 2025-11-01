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
  Res,
  Header,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { Response } from 'express';
import { TestCasesService } from './test-cases.service';
import { CreateTestCaseDto, UpdateTestCaseDto, ImportJsonDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('test-cases')
@Controller('test-cases')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class TestCasesController {
  constructor(private readonly testCasesService: TestCasesService) {}

  @Post()
  @Roles(UserRole.admin, UserRole.qa_lead)
  @ApiOperation({ summary: 'Crear nuevo caso de prueba' })
  create(@Body() createTestCaseDto: CreateTestCaseDto) {
    return this.testCasesService.create(createTestCaseDto);
  }

  @Get()
  @Roles(UserRole.admin, UserRole.qa_lead, UserRole.tester, UserRole.viewer)
  @ApiOperation({ summary: 'Obtener todos los casos de prueba' })
  findAll(@Query('projectId') projectId?: string) {
    return this.testCasesService.findAll(projectId);
  }

  @Get(':id')
  @Roles(UserRole.admin, UserRole.qa_lead, UserRole.tester, UserRole.viewer)
  @ApiOperation({ summary: 'Obtener un caso de prueba por ID' })
  findOne(@Param('id') id: string) {
    return this.testCasesService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.admin, UserRole.qa_lead)
  @ApiOperation({ summary: 'Actualizar caso de prueba' })
  update(@Param('id') id: string, @Body() updateTestCaseDto: UpdateTestCaseDto) {
    return this.testCasesService.update(id, updateTestCaseDto);
  }

  @Delete(':id')
  @Roles(UserRole.admin, UserRole.qa_lead)
  @ApiOperation({ summary: 'Eliminar caso de prueba' })
  remove(@Param('id') id: string) {
    return this.testCasesService.remove(id);
  }

  @Post('import/json')
  @Roles(UserRole.admin, UserRole.qa_lead)
  @ApiOperation({ summary: 'Importar casos de prueba desde JSON (formato AIQUAA)' })
  @ApiBody({
    schema: {
      example: {
        projectId: 'uuid',
        data: {
          id_work_item: 'KAN-6',
          datos_jira: { key: 'KAN-6', summary: 'Test', description: '...' },
          casos_prueba: [
            {
              id_caso_prueba: 'TC001',
              titulo: 'Caso de prueba',
              pasos: ['paso 1', 'paso 2'],
              precondiciones: ['precondición'],
              prioridad: 'Alta',
            },
          ],
        },
      },
    },
  })
  importFromJson(@Body() importDto: ImportJsonDto) {
    return this.testCasesService.importFromJson(importDto);
  }

  @Get('export/csv')
  @Roles(UserRole.admin, UserRole.qa_lead, UserRole.tester, UserRole.viewer)
  @ApiOperation({ summary: 'Exportar casos de prueba a CSV' })
  @Header('Content-Type', 'text/csv')
  async exportCsv(@Query('projectId') projectId: string, @Res() res: Response) {
    const csv = await this.testCasesService.exportToCsv(projectId);
    res.setHeader('Content-Disposition', `attachment; filename=test-cases-${projectId}.csv`);
    res.send(csv);
  }

  @Get('export/xlsx')
  @Roles(UserRole.admin, UserRole.qa_lead, UserRole.tester, UserRole.viewer)
  @ApiOperation({ summary: 'Exportar casos de prueba a Excel' })
  async exportXlsx(@Query('projectId') projectId: string, @Res() res: Response) {
    const buffer = await this.testCasesService.exportToXlsx(projectId);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename=test-cases-${projectId}.xlsx`);
    res.send(buffer);
  }
}
