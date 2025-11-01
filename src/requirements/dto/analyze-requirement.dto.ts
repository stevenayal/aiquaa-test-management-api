import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsObject } from 'class-validator';

export class AnalyzeRequirementDto {
  @ApiProperty({ required: false })
  @IsObject()
  @IsOptional()
  options?: Record<string, any>;
}
