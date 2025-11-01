import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Health check' })
  async check() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
      };
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error.message,
      };
    }
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Métricas básicas (Prometheus compatible)' })
  async metrics() {
    const [users, projects, testCases, testRuns] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.project.count(),
      this.prisma.testCase.count(),
      this.prisma.testRun.count(),
    ]);

    return {
      users,
      projects,
      testCases,
      testRuns,
      timestamp: new Date().toISOString(),
    };
  }
}

