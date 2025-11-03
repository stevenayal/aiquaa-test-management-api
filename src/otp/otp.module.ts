import { Module } from '@nestjs/common';
import { OTPService } from './otp.service';
import { EmailModule } from '../email/email.module';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [EmailModule, PrismaModule],
  providers: [OTPService],
  exports: [OTPService],
})
export class OTPModule {}
