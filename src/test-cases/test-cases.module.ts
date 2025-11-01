import { Module } from '@nestjs/common';
import { TestCasesService } from './test-cases.service';
import { TestCasesController } from './test-cases.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { RequirementsModule } from '../requirements/requirements.module';

@Module({
  imports: [PrismaModule, RequirementsModule],
  controllers: [TestCasesController],
  providers: [TestCasesService],
  exports: [TestCasesService],
})
export class TestCasesModule {}

