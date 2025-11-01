import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUUID, IsEnum, IsArray, IsObject } from 'class-validator';
import { TestCasePriority } from '@prisma/client';

export class CreateTestCaseDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  externalKey?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  preconditions?: string;

  @ApiProperty({ enum: TestCasePriority })
  @IsEnum(TestCasePriority)
  priority: TestCasePriority;

  @ApiProperty({ type: [String], required: false, default: [] })
  @IsArray()
  @IsOptional()
  tags?: string[];

  @ApiProperty({ type: 'array', items: { type: 'object' } })
  @IsArray()
  steps: Array<{ step: number; action: string; expectedResult?: string }>;
}

