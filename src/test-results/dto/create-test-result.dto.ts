import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUUID, IsEnum, IsUrl } from 'class-validator';
import { TestResultOutcome } from '@prisma/client';

export class CreateTestResultDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  runId: string;

  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  caseId: string;

  @ApiProperty({ enum: TestResultOutcome })
  @IsEnum(TestResultOutcome)
  outcome: TestResultOutcome;

  @ApiProperty({ required: false })
  @IsUrl()
  @IsOptional()
  evidenceUrl?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  comment?: string;
}
