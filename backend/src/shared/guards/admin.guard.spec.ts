import { ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AdminGuard } from './admin.guard';

describe('AdminGuard', () => {
  let guard: AdminGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdminGuard],
    }).compile();

    guard = module.get<AdminGuard>(AdminGuard);
  });

  const createMockExecutionContext = (user?: unknown): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          user,
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
    it('should allow admin user', () => {
      const adminUser = {
        sub: '507f1f77bcf86cd799439011',
        isAdmin: true,
        roles: ['admin'],
      };

      const context = createMockExecutionContext(adminUser);
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should allow super admin user', () => {
      const superAdminUser = {
        sub: '507f1f77bcf86cd799439011',
        isAdmin: true,
        roles: ['super_admin'],
      };

      const context = createMockExecutionContext(superAdminUser);
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should reject non-admin user', () => {
      const regularUser = {
        sub: '507f1f77bcf86cd799439011',
        isAdmin: false,
        roles: ['customer'],
      };

      const context = createMockExecutionContext(regularUser);

      expect(() => guard.canActivate(context)).toThrow();
    });

    it('should reject user without isAdmin flag', () => {
      const user = {
        sub: '507f1f77bcf86cd799439011',
        roles: ['customer'],
      };

      const context = createMockExecutionContext(user);

      expect(() => guard.canActivate(context)).toThrow();
    });

    it('should reject request without user', () => {
      const context = createMockExecutionContext();

      expect(() => guard.canActivate(context)).toThrow();
    });

    it('should reject user with empty roles', () => {
      const user = {
        sub: '507f1f77bcf86cd799439011',
        isAdmin: false,
        roles: [],
      };

      const context = createMockExecutionContext(user);

      expect(() => guard.canActivate(context)).toThrow();
    });
  });

  describe('Admin Role Validation', () => {
    it('should validate user has admin role in array', () => {
      const user = {
        sub: '507f1f77bcf86cd799439011',
        isAdmin: true,
        roles: ['customer', 'admin', 'engineer'],
      };

      const context = createMockExecutionContext(user);
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should validate user has super_admin role in array', () => {
      const user = {
        sub: '507f1f77bcf86cd799439011',
        isAdmin: true,
        roles: ['super_admin', 'admin'],
      };

      const context = createMockExecutionContext(user);
      const result = guard.canActivate(context);

      expect(result).toBe(true);
    });
  });
});

