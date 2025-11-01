import { ApiProperty } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { CreateTestRunDto } from './create-test-run.dto';
import { TestRunStatus } from '@prisma/client';

export class UpdateTestRunDto extends PartialType(CreateTestRunDto) {
  @ApiProperty({ enum: TestRunStatus, required: false })
  @IsEnum(TestRunStatus)
  @IsOptional()
  status?: TestRunStatus;
}
