import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUUID, IsEnum } from 'class-validator';
import { TestSuiteType } from '@prisma/client';

export class CreateTestSuiteDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  planId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: TestSuiteType })
  @IsEnum(TestSuiteType)
  type: TestSuiteType;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  query?: string;
}

