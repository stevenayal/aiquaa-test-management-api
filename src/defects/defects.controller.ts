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
import { DefectsService } from './defects.service';
import { CreateDefectDto, UpdateDefectDto, LinkDefectDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('defects')
@Controller('defects')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DefectsController {
  constructor(private readonly defectsService: DefectsService) {}

  @Post()
  @Roles(UserRole.admin, UserRole.qa_lead, UserRole.tester)
  @ApiOperation({ summary: 'Crear nuevo defecto' })
  create(@Body() createDefectDto: CreateDefectDto) {
    return this.defectsService.create(createDefectDto);
  }

  @Get()
  @Roles(UserRole.admin, UserRole.qa_lead, UserRole.tester, UserRole.viewer)
  @ApiOperation({ summary: 'Obtener todos los defectos' })
  findAll(@Query('projectId') projectId?: string) {
    return this.defectsService.findAll(projectId);
  }

  @Get(':id')
  @Roles(UserRole.admin, UserRole.qa_lead, UserRole.tester, UserRole.viewer)
  @ApiOperation({ summary: 'Obtener un defecto por ID' })
  findOne(@Param('id') id: string) {
    return this.defectsService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.admin, UserRole.qa_lead, UserRole.tester)
  @ApiOperation({ summary: 'Actualizar defecto' })
  update(@Param('id') id: string, @Body() updateDefectDto: UpdateDefectDto) {
    return this.defectsService.update(id, updateDefectDto);
  }

  @Delete(':id')
  @Roles(UserRole.admin, UserRole.qa_lead)
  @ApiOperation({ summary: 'Eliminar defecto' })
  remove(@Param('id') id: string) {
    return this.defectsService.remove(id);
  }

  @Post(':id/link')
  @Roles(UserRole.admin, UserRole.qa_lead, UserRole.tester)
  @ApiOperation({ summary: 'Vincular defecto con caso de prueba o resultado' })
  link(@Param('id') defectId: string, @Body() linkDto: LinkDefectDto) {
    return this.defectsService.linkDefect(defectId, linkDto);
  }
}
