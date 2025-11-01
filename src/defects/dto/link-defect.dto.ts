import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsOptional } from 'class-validator';

export class LinkDefectDto {
  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  testCaseId?: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  testResultId?: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  requirementId?: string;
}
