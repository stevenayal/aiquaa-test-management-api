import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { OTPService } from './otp.service';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { OTPPurpose } from '@prisma/client';

describe('OTPService', () => {
  let service: OTPService;
  let prisma: PrismaService;
  let emailService: EmailService;

  const mockPrismaService = {
    oTP: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockEmailService = {
    sendOTPEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OTPService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<OTPService>(OTPService);
    prisma = module.get<PrismaService>(PrismaService);
    emailService = module.get<EmailService>(EmailService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendOTP', () => {
    const email = 'test@example.com';
    const purpose = OTPPurpose.verify_email;

    it('should send OTP successfully', async () => {
      mockPrismaService.oTP.count.mockResolvedValue(0);
      mockPrismaService.oTP.updateMany.mockResolvedValue({ count: 0 });
      mockPrismaService.oTP.create.mockResolvedValue({
        id: '1',
        email,
        code: '123456',
        purpose,
        expiresAt: new Date(),
        used: false,
        createdAt: new Date(),
      });
      mockEmailService.sendOTPEmail.mockResolvedValue(true);

      await service.sendOTP(email, purpose);

      expect(mockPrismaService.oTP.count).toHaveBeenCalledWith({
        where: {
          email,
          purpose,
          createdAt: {
            gte: expect.any(Date),
          },
        },
      });

      expect(mockPrismaService.oTP.updateMany).toHaveBeenCalledWith({
        where: {
          email,
          purpose,
          used: false,
        },
        data: {
          used: true,
        },
      });

      expect(mockPrismaService.oTP.create).toHaveBeenCalledWith({
        data: {
          email,
          code: expect.stringMatching(/^\d{6}$/),
          purpose,
          expiresAt: expect.any(Date),
        },
      });

      expect(mockEmailService.sendOTPEmail).toHaveBeenCalledWith(
        email,
        expect.stringMatching(/^\d{6}$/),
        'verify_email',
      );
    });

    it('should throw error if rate limit exceeded', async () => {
      mockPrismaService.oTP.count.mockResolvedValue(3); // Max attempts

      await expect(service.sendOTP(email, purpose)).rejects.toThrow(BadRequestException);
      await expect(service.sendOTP(email, purpose)).rejects.toThrow(
        'Demasiados intentos. Por favor, intenta nuevamente en una hora.',
      );
    });

    it('should invalidate previous OTPs before creating new one', async () => {
      mockPrismaService.oTP.count.mockResolvedValue(0);
      mockPrismaService.oTP.updateMany.mockResolvedValue({ count: 2 });
      mockPrismaService.oTP.create.mockResolvedValue({
        id: '1',
        email,
        code: '123456',
        purpose,
        expiresAt: new Date(),
        used: false,
        createdAt: new Date(),
      });
      mockEmailService.sendOTPEmail.mockResolvedValue(true);

      await service.sendOTP(email, purpose);

      expect(mockPrismaService.oTP.updateMany).toHaveBeenCalledWith({
        where: {
          email,
          purpose,
          used: false,
        },
        data: {
          used: true,
        },
      });
    });

    it('should handle email service failure gracefully', async () => {
      mockPrismaService.oTP.count.mockResolvedValue(0);
      mockPrismaService.oTP.updateMany.mockResolvedValue({ count: 0 });
      mockPrismaService.oTP.create.mockResolvedValue({
        id: '1',
        email,
        code: '123456',
        purpose,
        expiresAt: new Date(),
        used: false,
        createdAt: new Date(),
      });
      mockEmailService.sendOTPEmail.mockResolvedValue(false); // Email failed

      // Should not throw error, just log warning
      await expect(service.sendOTP(email, purpose)).resolves.not.toThrow();
    });
  });

  describe('verifyOTP', () => {
    const email = 'test@example.com';
    const code = '123456';
    const purpose = OTPPurpose.verify_email;

    it('should verify valid OTP successfully', async () => {
      const validOTP = {
        id: '1',
        email,
        code,
        purpose,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutos en el futuro
        used: false,
        createdAt: new Date(),
      };

      mockPrismaService.oTP.findFirst.mockResolvedValue(validOTP);
      mockPrismaService.oTP.update.mockResolvedValue({
        ...validOTP,
        used: true,
      });

      const result = await service.verifyOTP(email, code, purpose);

      expect(result).toBe(true);
      expect(mockPrismaService.oTP.findFirst).toHaveBeenCalledWith({
        where: {
          email,
          code,
          purpose,
          used: false,
          expiresAt: {
            gt: expect.any(Date),
          },
        },
      });
      expect(mockPrismaService.oTP.update).toHaveBeenCalledWith({
        where: { id: validOTP.id },
        data: { used: true },
      });
    });

    it('should throw error for invalid OTP code', async () => {
      mockPrismaService.oTP.findFirst.mockResolvedValue(null);

      await expect(service.verifyOTP(email, code, purpose)).rejects.toThrow(BadRequestException);
      await expect(service.verifyOTP(email, code, purpose)).rejects.toThrow(
        'Código OTP inválido o expirado',
      );
    });

    it('should throw error for expired OTP', async () => {
      const expiredOTP = {
        id: '1',
        email,
        code,
        purpose,
        expiresAt: new Date(Date.now() - 1000), // Expirado
        used: false,
        createdAt: new Date(),
      };

      mockPrismaService.oTP.findFirst.mockResolvedValue(null); // No encuentra porque está expirado

      await expect(service.verifyOTP(email, code, purpose)).rejects.toThrow(BadRequestException);
    });

    it('should throw error for already used OTP', async () => {
      mockPrismaService.oTP.findFirst.mockResolvedValue(null); // No encuentra porque used=true

      await expect(service.verifyOTP(email, code, purpose)).rejects.toThrow(BadRequestException);
    });

    it('should throw error for wrong purpose', async () => {
      mockPrismaService.oTP.findFirst.mockResolvedValue(null); // No encuentra porque el propósito no coincide

      await expect(service.verifyOTP(email, code, OTPPurpose.reset_password)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('cleanupExpiredOTPs', () => {
    it('should delete expired OTPs', async () => {
      mockPrismaService.oTP.deleteMany.mockResolvedValue({ count: 5 });

      const result = await service.cleanupExpiredOTPs();

      expect(result).toBe(5);
      expect(mockPrismaService.oTP.deleteMany).toHaveBeenCalledWith({
        where: {
          expiresAt: {
            lt: expect.any(Date),
          },
        },
      });
    });

    it('should return 0 if no expired OTPs', async () => {
      mockPrismaService.oTP.deleteMany.mockResolvedValue({ count: 0 });

      const result = await service.cleanupExpiredOTPs();

      expect(result).toBe(0);
    });
  });
});
