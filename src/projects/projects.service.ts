import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(createProjectDto: CreateProjectDto) {
    // Check if key already exists
    const existing = await this.prisma.project.findUnique({
      where: { key: createProjectDto.key },
    });

    if (existing) {
      throw new BadRequestException('Ya existe un proyecto con esta clave');
    }

    return this.prisma.project.create({
      data: createProjectDto,
    });
  }

  async findAll() {
    return this.prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            testPlans: true,
            testCases: true,
            requirements: true,
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    return project;
  }

  async update(id: string, updateProjectDto: UpdateProjectDto) {
    await this.findOne(id);

    if (updateProjectDto.key) {
      const existing = await this.prisma.project.findFirst({
        where: {
          key: updateProjectDto.key,
          id: { not: id },
        },
      });

      if (existing) {
        throw new BadRequestException('Ya existe un proyecto con esta clave');
      }
    }

    return this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
    });
  }

  async remove(id: string) {
    const project = await this.findOne(id);

    // Business rule: No permitir eliminar Project si tiene TestPlan activo
    const activePlans = await this.prisma.testPlan.findFirst({
      where: {
        projectId: id,
      },
    });

    if (activePlans) {
      throw new BadRequestException(
        'No se puede eliminar un proyecto que tiene planes de prueba activos',
      );
    }

    return this.prisma.project.delete({
      where: { id },
    });
  }
}

