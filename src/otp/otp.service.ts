import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { OTPPurpose } from '@prisma/client';

@Injectable()
export class OTPService {
  private readonly logger = new Logger(OTPService.name);
  private readonly OTP_EXPIRATION_MINUTES = 10;
  private readonly MAX_ATTEMPTS_PER_HOUR = 3;

  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  /**
   * Genera un código OTP de 6 dígitos
   */
  private generateOTPCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Crea y envía un OTP por email
   */
  async sendOTP(email: string, purpose: OTPPurpose): Promise<void> {
    // Verificar rate limiting
    await this.checkRateLimit(email, purpose);

    // Invalidar OTPs anteriores del mismo propósito
    await this.prisma.oTP.updateMany({
      where: {
        email,
        purpose,
        used: false,
      },
      data: {
        used: true,
      },
    });

    // Generar nuevo OTP
    const code = this.generateOTPCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.OTP_EXPIRATION_MINUTES);

    // Guardar en BD
    await this.prisma.oTP.create({
      data: {
        email,
        code,
        purpose,
        expiresAt,
      },
    });

    // Enviar por email
    const sent = await this.emailService.sendOTPEmail(
      email,
      code,
      purpose === 'verify_email' ? 'verify_email' : 'reset_password',
    );

    if (!sent) {
      this.logger.warn(`Email service unavailable. OTP for ${email}: ${code}`);
      // En desarrollo, mostrar el código en los logs
      if (process.env.NODE_ENV !== 'production') {
        this.logger.log(`🔑 OTP Code for ${email} (${purpose}): ${code}`);
      }
    }

    this.logger.log(`OTP sent to ${email} for ${purpose}`);
  }

  /**
   * Verifica un código OTP
   */
  async verifyOTP(email: string, code: string, purpose: OTPPurpose): Promise<boolean> {
    const otp = await this.prisma.oTP.findFirst({
      where: {
        email,
        code,
        purpose,
        used: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!otp) {
      throw new BadRequestException('Código OTP inválido o expirado');
    }

    // Marcar como usado
    await this.prisma.oTP.update({
      where: { id: otp.id },
      data: { used: true },
    });

    this.logger.log(`OTP verified for ${email} (${purpose})`);
    return true;
  }

  /**
   * Verifica el rate limiting (máximo de intentos por hora)
   */
  private async checkRateLimit(email: string, purpose: OTPPurpose): Promise<void> {
    const oneHourAgo = new Date();
    oneHourAgo.setHours(oneHourAgo.getHours() - 1);

    const recentOTPs = await this.prisma.oTP.count({
      where: {
        email,
        purpose,
        createdAt: {
          gte: oneHourAgo,
        },
      },
    });

    if (recentOTPs >= this.MAX_ATTEMPTS_PER_HOUR) {
      throw new BadRequestException(
        `Demasiados intentos. Por favor, intenta nuevamente en una hora.`,
      );
    }
  }

  /**
   * Limpia OTPs expirados (debe ejecutarse periódicamente)
   */
  async cleanupExpiredOTPs(): Promise<number> {
    const result = await this.prisma.oTP.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });

    this.logger.log(`Cleaned up ${result.count} expired OTPs`);
    return result.count;
  }
}
