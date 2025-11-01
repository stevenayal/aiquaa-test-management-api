import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUUID, IsEnum } from 'class-validator';
import { RequirementStatus } from '@prisma/client';

export class CreateRequirementDto {
  @ApiProperty({ example: 'uuid-project-id' })
  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({ example: 'REQ-001', required: false })
  @IsString()
  @IsOptional()
  externalKey?: string;

  @ApiProperty({ example: 'El sistema debe permitir autenticación' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Descripción detallada del requisito...' })
  @IsString()
  @IsNotEmpty()
  text: string;

  @ApiProperty({ enum: RequirementStatus, required: false, default: 'draft' })
  @IsEnum(RequirementStatus)
  @IsOptional()
  status?: RequirementStatus;
}
