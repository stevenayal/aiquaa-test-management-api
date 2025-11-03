import { IsEmail, IsString, Length, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'user@example.com',
    description: 'Email del usuario',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '123456',
    description: 'Código OTP de 6 dígitos',
    minLength: 6,
    maxLength: 6,
  })
  @IsString()
  @Length(6, 6)
  code: string;

  @ApiProperty({
    example: 'NewPassword123!',
    description: 'Nueva contraseña',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
