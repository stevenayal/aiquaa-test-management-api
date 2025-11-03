import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private resend: Resend;
  private fromEmail: string;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');

    if (!apiKey) {
      this.logger.warn('⚠️  RESEND_API_KEY no configurado. El envío de emails estará deshabilitado.');
      this.resend = null;
    } else {
      this.resend = new Resend(apiKey);
    }

    this.fromEmail = this.configService.get<string>('FROM_EMAIL', 'onboarding@resend.dev');
  }

  async sendOTPEmail(to: string, otp: string, purpose: 'verify_email' | 'reset_password'): Promise<boolean> {
    if (!this.resend) {
      this.logger.warn(`Email service disabled. OTP for ${to}: ${otp}`);
      return false;
    }

    try {
      const subject = purpose === 'verify_email'
        ? 'Verifica tu email - AIQUAA'
        : 'Recuperación de contraseña - AIQUAA';

      const html = this.getOTPTemplate(otp, purpose);

      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html,
      });

      if (error) {
        this.logger.error(`Error sending email to ${to}:`, error);
        return false;
      }

      this.logger.log(`✅ Email sent to ${to} - ID: ${data.id}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${to}:`, error);
      return false;
    }
  }

  private getOTPTemplate(otp: string, purpose: 'verify_email' | 'reset_password'): string {
    if (purpose === 'verify_email') {
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verifica tu email</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">AIQUAA Test Management</h1>
            </div>

            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Verifica tu email</h2>

              <p>Gracias por registrarte en AIQUAA Test Management. Para completar tu registro, usa el siguiente código de verificación:</p>

              <div style="background: white; border: 2px solid #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                <p style="margin: 0; color: #666; font-size: 14px;">Tu código de verificación es:</p>
                <h1 style="color: #667eea; font-size: 48px; margin: 10px 0; letter-spacing: 8px; font-weight: bold;">${otp}</h1>
              </div>

              <p style="color: #666; font-size: 14px;">
                <strong>Nota:</strong> Este código expira en 10 minutos.
              </p>

              <p style="color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                Si no solicitaste este código, puedes ignorar este email de forma segura.
              </p>
            </div>
          </body>
        </html>
      `;
    } else {
      return `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Recuperación de contraseña</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">AIQUAA Test Management</h1>
            </div>

            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
              <h2 style="color: #333; margin-top: 0;">Recuperación de contraseña</h2>

              <p>Recibimos una solicitud para restablecer tu contraseña. Usa el siguiente código para continuar:</p>

              <div style="background: white; border: 2px solid #f5576c; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0;">
                <p style="margin: 0; color: #666; font-size: 14px;">Tu código de verificación es:</p>
                <h1 style="color: #f5576c; font-size: 48px; margin: 10px 0; letter-spacing: 8px; font-weight: bold;">${otp}</h1>
              </div>

              <p style="color: #666; font-size: 14px;">
                <strong>Nota:</strong> Este código expira en 10 minutos.
              </p>

              <p style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
                <strong>⚠️ Importante:</strong> Si no solicitaste restablecer tu contraseña, ignora este email y tu cuenta permanecerá segura.
              </p>

              <p style="color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                Por tu seguridad, nunca compartas este código con nadie.
              </p>
            </div>
          </body>
        </html>
      `;
    }
  }
}
