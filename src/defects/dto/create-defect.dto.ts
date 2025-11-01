import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUUID, IsEnum } from 'class-validator';
import { DefectSeverity, DefectStatus } from '@prisma/client';

export class CreateDefectDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ enum: DefectSeverity })
  @IsEnum(DefectSeverity)
  severity: DefectSeverity;

  @ApiProperty({ enum: DefectStatus, required: false, default: 'new' })
  @IsEnum(DefectStatus)
  @IsOptional()
  status?: DefectStatus;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  externalKey?: string;
}
