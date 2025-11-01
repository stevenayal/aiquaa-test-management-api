import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateExternalKeyDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  externalKey: string;
}

