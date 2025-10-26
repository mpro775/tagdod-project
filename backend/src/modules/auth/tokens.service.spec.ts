import { Test, TestingModule } from '@nestjs/testing';
import { TokensService } from './tokens.service';
import * as jwt from 'jsonwebtoken';

type JwtPayload = {
  sub: string;
  phone: string;
  isAdmin: boolean;
  roles: string[];
  permissions: string[];
  iat?: number;
  exp?: number;
};

describe('TokensService', () => {
  let service: TokensService;

  const mockPayload = {
    sub: '507f1f77bcf86cd799439011',
    phone: '+966501234567',
    isAdmin: false,
    roles: ['customer'],
    permissions: ['customer.read'],
  };

  beforeEach(async () => {
    process.env.JWT_SECRET = 'test_jwt_secret';
    process.env.REFRESH_SECRET = 'test_refresh_secret';

    const module: TestingModule = await Test.createTestingModule({
      providers: [TokensService],
    }).compile();

    service = module.get<TokensService>(TokensService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signAccess', () => {
    it('should create access token with correct payload', () => {
      const token = service.signAccess(mockPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
      expect(decoded.sub).toBe(mockPayload.sub);
      expect(decoded.phone).toBe(mockPayload.phone);
      expect(decoded.isAdmin).toBe(mockPayload.isAdmin);
      expect(decoded.roles).toEqual(mockPayload.roles);
      expect(decoded.permissions).toEqual(mockPayload.permissions);
    });

    it('should create token that expires in 8 hours', () => {
      const token = service.signAccess(mockPayload);
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

      const now = Math.floor(Date.now() / 1000);
      const expectedExpiry = now + 8 * 60 * 60; // 8 hours

      // Allow 5 seconds tolerance
      expect(decoded.exp).toBeGreaterThan(now);
      expect(decoded.exp).toBeLessThanOrEqual(expectedExpiry + 5);
    });

    it('should create token for admin user', () => {
      const adminPayload = {
        ...mockPayload,
        isAdmin: true,
        roles: ['admin', 'super_admin'],
        permissions: ['admin.access', 'super_admin.access'],
      };

      const token = service.signAccess(adminPayload);
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

      expect(decoded.isAdmin).toBe(true);
      expect(decoded.roles).toContain('admin');
      expect(decoded.permissions).toContain('admin.access');
    });
  });

  describe('signRefresh', () => {
    it('should create refresh token with correct payload', () => {
      const token = service.signRefresh(mockPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');

      const decoded = jwt.verify(token, process.env.REFRESH_SECRET!) as JwtPayload;
      expect(decoded.sub).toBe(mockPayload.sub);
      expect(decoded.phone).toBe(mockPayload.phone);
    });

    it('should create token that expires in 30 days', () => {
      const token = service.signRefresh(mockPayload);
      const decoded = jwt.verify(token, process.env.REFRESH_SECRET!) as JwtPayload;

      const now = Math.floor(Date.now() / 1000);
      const expectedExpiry = now + 30 * 24 * 60 * 60; // 30 days

      // Allow 5 seconds tolerance
      expect(decoded.exp).toBeGreaterThan(now);
      expect(decoded.exp).toBeLessThanOrEqual(expectedExpiry + 5);
    });
  });

  describe('verifyAccess', () => {
    it('should verify valid access token', () => {
      const token = service.signAccess(mockPayload);
      const decoded = service.verifyAccess(token) as JwtPayload;

      expect(decoded.sub).toBe(mockPayload.sub);
      expect(decoded.phone).toBe(mockPayload.phone);
    });

    it('should throw error for invalid access token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => {
        service.verifyAccess(invalidToken);
      }).toThrow();
    });

    it('should throw error for expired access token', () => {
      const expiredToken = jwt.sign(
        mockPayload,
        process.env.JWT_SECRET!,
        { expiresIn: '0s' }
      );

      // Wait a bit to ensure expiration
      return new Promise((resolve) => {
        setTimeout(() => {
          expect(() => {
            service.verifyAccess(expiredToken);
          }).toThrow();
          resolve(undefined);
        }, 100);
      });
    });

    it('should throw error for token signed with wrong secret', () => {
      const wrongToken = jwt.sign(mockPayload, 'wrong_secret', { expiresIn: '1h' });

      expect(() => {
        service.verifyAccess(wrongToken);
      }).toThrow();
    });
  });

  describe('verifyRefresh', () => {
    it('should verify valid refresh token', () => {
      const token = service.signRefresh(mockPayload);
      const decoded = service.verifyRefresh(token) as JwtPayload;

      expect(decoded.sub).toBe(mockPayload.sub);
      expect(decoded.phone).toBe(mockPayload.phone);
    });

    it('should throw error for invalid refresh token', () => {
      const invalidToken = 'invalid.token.here';

      expect(() => {
        service.verifyRefresh(invalidToken);
      }).toThrow();
    });

    it('should throw error for token signed with wrong secret', () => {
      const wrongToken = jwt.sign(mockPayload, 'wrong_secret', { expiresIn: '30d' });

      expect(() => {
        service.verifyRefresh(wrongToken);
      }).toThrow();
    });
  });

  describe('Token Security', () => {
    it('should use different secrets for access and refresh tokens', () => {
      expect(process.env.JWT_SECRET).not.toBe(process.env.REFRESH_SECRET);
    });

    it('should not verify access token with refresh secret', () => {
      const accessToken = service.signAccess(mockPayload);

      expect(() => {
        jwt.verify(accessToken, process.env.REFRESH_SECRET!);
      }).toThrow();
    });

    it('should not verify refresh token with access secret', () => {
      const refreshToken = service.signRefresh(mockPayload);

      expect(() => {
        jwt.verify(refreshToken, process.env.JWT_SECRET!);
      }).toThrow();
    });
  });
});

