import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsUUID, IsEnum, IsArray } from 'class-validator';
import { ChecklistType } from '@prisma/client';

export class CreateChecklistDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  projectId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: ChecklistType })
  @IsEnum(ChecklistType)
  type: ChecklistType;

  @ApiProperty({ type: 'array', items: { type: 'object' } })
  @IsArray()
  items: Array<{ item: string; checked: boolean }>;
}
