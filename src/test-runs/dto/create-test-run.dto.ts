import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsUUID, IsDateString } from 'class-validator';

export class CreateTestRunDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  planId: string;

  @ApiProperty({ required: false })
  @IsUUID()
  @IsOptional()
  suiteId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ required: false })
  @IsDateString()
  @IsOptional()
  scheduledAt?: string;
}
