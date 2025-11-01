import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateTestResultDto } from './create-test-result.dto';

export class BulkResultItemDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  caseId: string;

  @ApiProperty()
  outcome: any;

  @ApiProperty({ required: false })
  evidenceUrl?: string;

  @ApiProperty({ required: false })
  comment?: string;
}

export class BulkCreateTestResultDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  runId: string;

  @ApiProperty({ type: [BulkResultItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkResultItemDto)
  results: BulkResultItemDto[];
}
