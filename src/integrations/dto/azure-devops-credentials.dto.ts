import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AzureDevOpsCredentialsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  organization: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  project: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;
}
