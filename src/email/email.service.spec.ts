import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

// Mock de Resend
const mockResendSend = jest.fn();
jest.mock('resend', () => {
  return {
    Resend: jest.fn().mockImplementation(() => {
      return {
        emails: {
          send: mockResendSend,
        },
      };
    }),
  };
});

describe('EmailService', () => {
  let service: EmailService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: string) => {
      const config = {
        RESEND_API_KEY: 're_test_key_123',
        FROM_EMAIL: 'test@example.com',
      };
      return config[key] || defaultValue;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
    configService = module.get<ConfigService>(ConfigService);

    // Reset mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendOTPEmail', () => {
    const testEmail = 'user@example.com';
    const testOTP = '123456';

    it('should send verification email successfully', async () => {
      mockResendSend.mockResolvedValue({
        data: { id: 'email-id-123' },
        error: null,
      });

      const result = await service.sendOTPEmail(testEmail, testOTP, 'verify_email');

      expect(result).toBe(true);
      expect(mockResendSend).toHaveBeenCalledWith({
        from: 'test@example.com',
        to: testEmail,
        subject: 'Verifica tu email - AIQUAA',
        html: expect.stringContaining(testOTP),
      });
    });

    it('should send password reset email successfully', async () => {
      mockResendSend.mockResolvedValue({
        data: { id: 'email-id-456' },
        error: null,
      });

      const result = await service.sendOTPEmail(testEmail, testOTP, 'reset_password');

      expect(result).toBe(true);
      expect(mockResendSend).toHaveBeenCalledWith({
        from: 'test@example.com',
        to: testEmail,
        subject: 'Recuperación de contraseña - AIQUAA',
        html: expect.stringContaining(testOTP),
      });
    });

    it('should return false when Resend returns an error', async () => {
      mockResendSend.mockResolvedValue({
        data: null,
        error: { message: 'API error', name: 'ResendError' },
      });

      const result = await service.sendOTPEmail(testEmail, testOTP, 'verify_email');

      expect(result).toBe(false);
    });

    it('should return false when Resend throws an exception', async () => {
      mockResendSend.mockRejectedValue(new Error('Network error'));

      const result = await service.sendOTPEmail(testEmail, testOTP, 'verify_email');

      expect(result).toBe(false);
    });

    it('should include OTP code in email HTML', async () => {
      mockResendSend.mockResolvedValue({
        data: { id: 'email-id-789' },
        error: null,
      });

      await service.sendOTPEmail(testEmail, '654321', 'verify_email');

      const callArgs = mockResendSend.mock.calls[0][0];
      expect(callArgs.html).toContain('654321');
    });

    it('should use correct subject for verification email', async () => {
      mockResendSend.mockResolvedValue({
        data: { id: 'email-id-abc' },
        error: null,
      });

      await service.sendOTPEmail(testEmail, testOTP, 'verify_email');

      const callArgs = mockResendSend.mock.calls[0][0];
      expect(callArgs.subject).toBe('Verifica tu email - AIQUAA');
    });

    it('should use correct subject for password reset email', async () => {
      mockResendSend.mockResolvedValue({
        data: { id: 'email-id-def' },
        error: null,
      });

      await service.sendOTPEmail(testEmail, testOTP, 'reset_password');

      const callArgs = mockResendSend.mock.calls[0][0];
      expect(callArgs.subject).toBe('Recuperación de contraseña - AIQUAA');
    });
  });

  describe('EmailService without RESEND_API_KEY', () => {
    let serviceWithoutKey: EmailService;

    beforeEach(async () => {
      const mockConfigWithoutKey = {
        get: jest.fn((key: string, defaultValue?: string) => {
          const config = {
            RESEND_API_KEY: undefined,
            FROM_EMAIL: 'onboarding@resend.dev',
          };
          return config[key] || defaultValue;
        }),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          EmailService,
          {
            provide: ConfigService,
            useValue: mockConfigWithoutKey,
          },
        ],
      }).compile();

      serviceWithoutKey = module.get<EmailService>(EmailService);
      jest.clearAllMocks();
    });

    it('should return false when RESEND_API_KEY is not configured', async () => {
      const result = await serviceWithoutKey.sendOTPEmail(
        'test@example.com',
        '123456',
        'verify_email',
      );

      expect(result).toBe(false);
      expect(mockResendSend).not.toHaveBeenCalled();
    });

    it('should not throw error when sending email without API key', async () => {
      await expect(
        serviceWithoutKey.sendOTPEmail('test@example.com', '123456', 'verify_email'),
      ).resolves.not.toThrow();
    });
  });
});
