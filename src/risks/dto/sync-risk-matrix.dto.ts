import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNotEmpty, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateRiskDto } from './create-risk.dto';

export class SyncRiskMatrixDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty({ type: [CreateRiskDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRiskDto)
  risks: Array<CreateRiskDto & { id?: string }>;
}
