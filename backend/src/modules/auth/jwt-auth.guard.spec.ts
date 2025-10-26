import { ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from './jwt-auth.guard';
import { TokensService } from './tokens.service';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  const mockTokensService = {
    verifyAccess: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: TokensService,
          useValue: mockTokensService,
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockExecutionContext = (authHeader?: string): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization: authHeader,
          },
        }),
        getResponse: jest.fn(),
        getNext: jest.fn(),
      }),
      getClass: jest.fn(),
      getHandler: jest.fn(),
      getArgs: jest.fn(),
      getArgByIndex: jest.fn(),
      switchToRpc: jest.fn(),
      switchToWs: jest.fn(),
      getType: jest.fn(),
    } as ExecutionContext;
  };

  describe('canActivate', () => {
    it('should allow request with valid token', async () => {
      const mockPayload = {
        sub: '507f1f77bcf86cd799439011',
        phone: '+966501234567',
        isAdmin: false,
      };

      mockTokensService.verifyAccess.mockReturnValue(mockPayload);

      const context = createMockExecutionContext('Bearer valid.jwt.token');
      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockTokensService.verifyAccess).toHaveBeenCalledWith('valid.jwt.token');
    });

    it('should reject request without authorization header', async () => {
      const context = createMockExecutionContext();

      await expect(guard.canActivate(context)).rejects.toThrow();
    });

    it('should reject request with invalid token format', async () => {
      const context = createMockExecutionContext('InvalidFormat');

      await expect(guard.canActivate(context)).rejects.toThrow();
    });

    it('should reject request with expired token', async () => {
      mockTokensService.verifyAccess.mockImplementation(() => {
        throw new Error('Token expired');
      });

      const context = createMockExecutionContext('Bearer expired.jwt.token');

      await expect(guard.canActivate(context)).rejects.toThrow();
    });

    it('should reject request with invalid token', async () => {
      mockTokensService.verifyAccess.mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const context = createMockExecutionContext('Bearer invalid.jwt.token');

      await expect(guard.canActivate(context)).rejects.toThrow();
    });

    it('should attach user to request object', async () => {
      const mockPayload = {
        sub: '507f1f77bcf86cd799439011',
        phone: '+966501234567',
        isAdmin: false,
        roles: ['customer'],
      };

      mockTokensService.verifyAccess.mockReturnValue(mockPayload);

      const mockRequest: { headers: { authorization: string }; user?: unknown } = {
        headers: {
          authorization: 'Bearer valid.jwt.token',
        },
      };

      const context = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
          getResponse: jest.fn(),
          getNext: jest.fn(),
        }),
        getClass: jest.fn(),
        getHandler: jest.fn(),
        getArgs: jest.fn(),
        getArgByIndex: jest.fn(),
        switchToRpc: jest.fn(),
        switchToWs: jest.fn(),
        getType: jest.fn(),
      } as ExecutionContext;

      await guard.canActivate(context);

      expect(mockRequest.user).toEqual(mockPayload);
    });
  });

  describe('Token Extraction', () => {
    it('should extract token from Bearer format', () => {
      const context = createMockExecutionContext('Bearer test.token.here');
      mockTokensService.verifyAccess.mockReturnValue({ sub: '123' });

      guard.canActivate(context);

      expect(mockTokensService.verifyAccess).toHaveBeenCalledWith('test.token.here');
    });

    it('should handle token with extra spaces', () => {
      const context = createMockExecutionContext('Bearer  test.token.here');
      mockTokensService.verifyAccess.mockReturnValue({ sub: '123' });

      guard.canActivate(context);

      expect(mockTokensService.verifyAccess).toHaveBeenCalledWith('test.token.here');
    });
  });
});

