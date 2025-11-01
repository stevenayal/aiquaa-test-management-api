import { Module } from '@nestjs/common';
import { TestSuitesService } from './test-suites.service';
import { TestSuitesController } from './test-suites.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TestSuitesController],
  providers: [TestSuitesService],
  exports: [TestSuitesService],
})
export class TestSuitesModule {}
