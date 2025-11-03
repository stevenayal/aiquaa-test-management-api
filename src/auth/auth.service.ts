import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { UserRole, OTPPurpose } from '@prisma/client';
import { OTPService } from '../otp/otp.service';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: UserRole;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private otpService: OTPService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const { passwordHash, ...result } = user;
    return result;
  }

  async login(user: any): Promise<AuthResponse> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      accessToken: this.jwtService.sign(payload),
      refreshToken: this.jwtService.sign(payload, {
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN', '7d'),
      }),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  async register(email: string, password: string, role: UserRole = UserRole.viewer) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.usersService.create({
      email,
      passwordHash: hashedPassword,
      role,
      emailVerified: false,
    });

    // Enviar OTP de verificación de email
    await this.otpService.sendOTP(email, OTPPurpose.verify_email);

    return {
      message: 'Usuario registrado exitosamente. Verifica tu email con el código enviado.',
      email: user.email,
      emailVerified: false,
    };
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify<JwtPayload>(refreshToken);
      const newPayload: JwtPayload = {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
      };
      return {
        accessToken: this.jwtService.sign(newPayload),
      };
    } catch (error) {
      throw new UnauthorizedException('Token de refresh inválido');
    }
  }

  async verifyEmail(email: string, code: string): Promise<AuthResponse> {
    // Verificar OTP
    await this.otpService.verifyOTP(email, code, OTPPurpose.verify_email);

    // Marcar email como verificado
    const user = await this.usersService.verifyEmail(email);

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    // Retornar tokens para login automático
    return this.login(user);
  }

  async resendVerificationCode(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new BadRequestException('Usuario no encontrado');
    }

    if (user.emailVerified) {
      throw new BadRequestException('El email ya está verificado');
    }

    await this.otpService.sendOTP(email, OTPPurpose.verify_email);

    return {
      message: 'Código de verificación reenviado',
    };
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      // Por seguridad, no revelar si el usuario existe o no
      return {
        message: 'Si el email existe, recibirás un código de recuperación',
      };
    }

    await this.otpService.sendOTP(email, OTPPurpose.reset_password);

    return {
      message: 'Si el email existe, recibirás un código de recuperación',
    };
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<{ message: string }> {
    // Verificar OTP
    await this.otpService.verifyOTP(email, code, OTPPurpose.reset_password);

    // Actualizar contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.updatePassword(email, hashedPassword);

    return {
      message: 'Contraseña actualizada exitosamente',
    };
  }
}
