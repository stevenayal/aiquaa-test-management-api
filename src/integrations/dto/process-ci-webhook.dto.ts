import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum } from 'class-validator';

export class ProcessCiWebhookDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  runId: string;

  @ApiProperty({ enum: ['junit-xml', 'json'] })
  @IsEnum(['junit-xml', 'json'])
  format: 'junit-xml' | 'json';

  @ApiProperty({ description: 'XML string o JSON object/array' })
  @IsString()
  @IsNotEmpty()
  data: string | any;
}

