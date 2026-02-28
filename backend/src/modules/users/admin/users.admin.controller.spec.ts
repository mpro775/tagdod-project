import { Request } from 'express';
import { UsersAdminController } from './users.admin.controller';
import { UserRole, UserStatus } from '../schemas/user.schema';
import {
  AuthException,
  ForbiddenException,
  UserNotFoundException,
} from '../../../shared/exceptions';

describe('UsersAdminController', () => {
  let controller: UsersAdminController;

  const userModelMock = {
    findById: jest.fn(),
    deleteOne: jest.fn(),
  };

  const engineerProfileModelMock = {
    deleteOne: jest.fn(),
  };

  const capsModelMock = {
    deleteOne: jest.fn(),
  };

  const auditServiceMock = {
    logAdminAction: jest.fn().mockResolvedValue(undefined),
  };

  const mockRequest = {
    user: { sub: 'admin-1' },
    ip: '127.0.0.1',
    headers: { 'user-agent': 'jest' },
  } as unknown as { user: { sub: string } } & Request;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new UsersAdminController(
      userModelMock as any,
      engineerProfileModelMock as any,
      capsModelMock as any,
      auditServiceMock as any,
      {} as any,
    );
  });

  describe('permanentDelete', () => {
    it('permanently deletes a soft-deleted user and related records', async () => {
      const userId = 'user-1';
      const user = {
        _id: userId,
        phone: '+967771234567',
        roles: [UserRole.USER],
        status: UserStatus.DELETED,
        deletedAt: new Date('2026-01-01'),
      };

      userModelMock.findById.mockResolvedValue(user);
      userModelMock.deleteOne.mockResolvedValue({ deletedCount: 1 });
      capsModelMock.deleteOne.mockResolvedValue({ deletedCount: 1 });
      engineerProfileModelMock.deleteOne.mockResolvedValue({ deletedCount: 1 });

      const result = await controller.permanentDelete(userId, mockRequest);

      expect(result).toEqual({ id: userId, permanentlyDeleted: true });
      expect(userModelMock.deleteOne).toHaveBeenCalledWith({ _id: userId });
      expect(capsModelMock.deleteOne).toHaveBeenCalledWith({ userId });
      expect(engineerProfileModelMock.deleteOne).toHaveBeenCalledWith({ userId });
      expect(auditServiceMock.logAdminAction).toHaveBeenCalledWith(
        expect.objectContaining({
          adminId: 'admin-1',
          action: 'permanent_delete_user',
          resource: 'user',
          resourceId: userId,
        }),
      );
    });

    it('throws UserNotFoundException when user does not exist', async () => {
      userModelMock.findById.mockResolvedValue(null);

      await expect(controller.permanentDelete('missing-user', mockRequest)).rejects.toBeInstanceOf(
        UserNotFoundException,
      );
      expect(userModelMock.deleteOne).not.toHaveBeenCalled();
    });

    it('throws AuthException when user is not soft-deleted first', async () => {
      userModelMock.findById.mockResolvedValue({
        _id: 'active-user',
        roles: [UserRole.USER],
        status: UserStatus.ACTIVE,
        deletedAt: null,
      });

      await expect(controller.permanentDelete('active-user', mockRequest)).rejects.toBeInstanceOf(
        AuthException,
      );
      expect(userModelMock.deleteOne).not.toHaveBeenCalled();
    });

    it('throws ForbiddenException when trying to permanently delete super admin', async () => {
      userModelMock.findById.mockResolvedValue({
        _id: 'super-admin-user',
        roles: [UserRole.SUPER_ADMIN],
        status: UserStatus.DELETED,
        deletedAt: new Date('2026-01-01'),
      });

      await expect(
        controller.permanentDelete('super-admin-user', mockRequest),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(userModelMock.deleteOne).not.toHaveBeenCalled();
    });
  });
});
