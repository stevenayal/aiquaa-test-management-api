import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChecklistDto, UpdateChecklistDto } from './dto';
import { ChecklistType } from '@prisma/client';

@Injectable()
export class ChecklistsService {
  constructor(private prisma: PrismaService) {}

  async create(createChecklistDto: CreateChecklistDto) {
    return this.prisma.checklist.create({
      data: {
        ...createChecklistDto,
        items: createChecklistDto.items as any,
      },
    });
  }

  async findAll(projectId?: string) {
    return this.prisma.checklist.findMany({
      where: projectId ? { projectId } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const checklist = await this.prisma.checklist.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });

    if (!checklist) {
      throw new NotFoundException('Checklist no encontrado');
    }

    return checklist;
  }

  async update(id: string, updateChecklistDto: UpdateChecklistDto) {
    await this.findOne(id);
    return this.prisma.checklist.update({
      where: { id },
      data: {
        ...updateChecklistDto,
        items: updateChecklistDto.items as any,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.checklist.delete({
      where: { id },
    });
  }

  getTemplates(): Record<ChecklistType, any> {
    return {
      Web: {
        items: [
          { item: 'Verificar compatibilidad con navegadores', checked: false },
          { item: 'Validar responsive design', checked: false },
          { item: 'Comprobar accesibilidad WCAG', checked: false },
          { item: 'Verificar carga de imágenes', checked: false },
          { item: 'Validar formularios', checked: false },
        ],
      },
      API: {
        items: [
          { item: 'Validar formato de respuesta JSON', checked: false },
          { item: 'Verificar códigos de estado HTTP', checked: false },
          { item: 'Comprobar autenticación/autorización', checked: false },
          { item: 'Validar manejo de errores', checked: false },
          { item: 'Verificar rate limiting', checked: false },
        ],
      },
      Mobile: {
        items: [
          { item: 'Verificar en diferentes dispositivos', checked: false },
          { item: 'Validar gestos y navegación', checked: false },
          { item: 'Comprobar notificaciones push', checked: false },
          { item: 'Verificar orientación', checked: false },
          { item: 'Validar almacenamiento local', checked: false },
        ],
      },
      Security: {
        items: [
          { item: 'Validar autenticación', checked: false },
          { item: 'Verificar autorización', checked: false },
          { item: 'Comprobar encriptación de datos', checked: false },
          { item: 'Validar manejo de sesiones', checked: false },
          { item: 'Verificar protección CSRF/XSS', checked: false },
        ],
      },
    };
  }
}
