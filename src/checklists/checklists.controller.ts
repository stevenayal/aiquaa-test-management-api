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
import { ChecklistsService } from './checklists.service';
import { CreateChecklistDto, UpdateChecklistDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('checklists')
@Controller('checklists')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ChecklistsController {
  constructor(private readonly checklistsService: ChecklistsService) {}

  @Post()
  @Roles(UserRole.admin, UserRole.qa_lead)
  @ApiOperation({ summary: 'Crear nuevo checklist' })
  create(@Body() createChecklistDto: CreateChecklistDto) {
    return this.checklistsService.create(createChecklistDto);
  }

  @Get()
  @Roles(UserRole.admin, UserRole.qa_lead, UserRole.tester, UserRole.viewer)
  @ApiOperation({ summary: 'Obtener todos los checklists' })
  findAll(@Query('projectId') projectId?: string) {
    return this.checklistsService.findAll(projectId);
  }

  @Get('templates')
  @Roles(UserRole.admin, UserRole.qa_lead, UserRole.tester, UserRole.viewer)
  @ApiOperation({ summary: 'Obtener plantillas de checklists' })
  getTemplates() {
    return this.checklistsService.getTemplates();
  }

  @Get(':id')
  @Roles(UserRole.admin, UserRole.qa_lead, UserRole.tester, UserRole.viewer)
  @ApiOperation({ summary: 'Obtener un checklist por ID' })
  findOne(@Param('id') id: string) {
    return this.checklistsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.admin, UserRole.qa_lead)
  @ApiOperation({ summary: 'Actualizar checklist' })
  update(@Param('id') id: string, @Body() updateChecklistDto: UpdateChecklistDto) {
    return this.checklistsService.update(id, updateChecklistDto);
  }

  @Delete(':id')
  @Roles(UserRole.admin, UserRole.qa_lead)
  @ApiOperation({ summary: 'Eliminar checklist' })
  remove(@Param('id') id: string) {
    return this.checklistsService.remove(id);
  }
}
