import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { FavoritesService } from './favorites.service';
import { Favorite } from './schemas/favorite.schema';

describe('FavoritesService', () => {
  let service: FavoritesService;

  const mockFavorite = {
    _id: '507f1f77bcf86cd799439011',
    userId: '507f1f77bcf86cd799439015',
    productId: '507f1f77bcf86cd799439020',
    note: '',
    viewsCount: 0,
    isSynced: false,
    deletedAt: null,
    createdAt: new Date(),
    save: jest.fn(),
  };

  const mockGuestFavorite = {
    _id: '507f1f77bcf86cd799439012',
    deviceId: 'device-123',
    userId: null,
    productId: '507f1f77bcf86cd799439020',
    note: '',
    viewsCount: 0,
    isSynced: false,
    deletedAt: null,
    createdAt: new Date(),
    save: jest.fn(),
  };

  const mockFavoriteModel = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    deleteOne: jest.fn(),
    updateOne: jest.fn(),
    updateMany: jest.fn(),
    countDocuments: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FavoritesService,
        {
          provide: getModelToken(Favorite.name),
          useValue: mockFavoriteModel,
        },
      ],
    }).compile();

    service = module.get<FavoritesService>(FavoritesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listUserFavorites', () => {
    it('should return user favorites', async () => {
      mockFavoriteModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([mockFavorite]),
      });

      const result = await service.listUserFavorites('507f1f77bcf86cd799439015');

      expect(result).toEqual([mockFavorite]);
      expect(mockFavoriteModel.find).toHaveBeenCalled();
    });

    it('should return empty array when user has no favorites', async () => {
      mockFavoriteModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([]),
      });

      const result = await service.listUserFavorites('507f1f77bcf86cd799439015');

      expect(result).toEqual([]);
    });
  });

  describe('listGuestFavorites', () => {
    it('should return guest favorites', async () => {
      mockFavoriteModel.find.mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        lean: jest.fn().mockResolvedValue([mockGuestFavorite]),
      });

      const result = await service.listGuestFavorites('device-123');

      expect(result).toEqual([mockGuestFavorite]);
      expect(mockFavoriteModel.find).toHaveBeenCalled();
    });
  });

  describe('addUserFavorite', () => {
    it('should add product to user favorites', async () => {
      mockFavoriteModel.findOne.mockResolvedValue(null);
      mockFavoriteModel.create.mockResolvedValue(mockFavorite);

      const result = await service.addUserFavorite('507f1f77bcf86cd799439015', {
        productId: '507f1f77bcf86cd799439020',
      });

      expect(result).toEqual(mockFavorite);
      expect(mockFavoriteModel.create).toHaveBeenCalled();
    });

    it('should update existing favorite if already exists', async () => {
      const existingFavorite = { ...mockFavorite, save: jest.fn() };
      mockFavoriteModel.findOne.mockResolvedValue(existingFavorite);

      const result = await service.addUserFavorite('507f1f77bcf86cd799439015', {
        productId: '507f1f77bcf86cd799439020',
        note: 'Updated note',
      });

      expect(result).toEqual(existingFavorite);
      expect(existingFavorite.save).toHaveBeenCalled();
      expect(mockFavoriteModel.create).not.toHaveBeenCalled();
    });
  });

  describe('addGuestFavorite', () => {
    it('should add product to guest favorites', async () => {
      mockFavoriteModel.findOne.mockResolvedValue(null);
      mockFavoriteModel.create.mockResolvedValue(mockGuestFavorite);

      const result = await service.addGuestFavorite('device-123', {
        productId: '507f1f77bcf86cd799439020',
      });

      expect(result).toEqual(mockGuestFavorite);
      expect(mockFavoriteModel.create).toHaveBeenCalled();
    });
  });

  describe('removeUserFavorite', () => {
    it('should remove product from user favorites', async () => {
      mockFavoriteModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await service.removeUserFavorite('507f1f77bcf86cd799439015', {
        productId: '507f1f77bcf86cd799439020',
      });

      expect(result.deleted).toBe(true);
      expect(mockFavoriteModel.updateOne).toHaveBeenCalled();
    });

    it('should return false when favorite not found', async () => {
      mockFavoriteModel.updateOne.mockResolvedValue({ modifiedCount: 0 });

      const result = await service.removeUserFavorite('507f1f77bcf86cd799439015', {
        productId: '507f1f77bcf86cd799439020',
      });

      expect(result.deleted).toBe(false);
    });
  });

  describe('removeGuestFavorite', () => {
    it('should remove product from guest favorites', async () => {
      mockFavoriteModel.updateOne.mockResolvedValue({ modifiedCount: 1 });

      const result = await service.removeGuestFavorite('device-123', {
        productId: '507f1f77bcf86cd799439020',
      });

      expect(result.deleted).toBe(true);
      expect(mockFavoriteModel.updateOne).toHaveBeenCalled();
    });
  });

  describe('syncGuestToUser', () => {
    it('should sync guest favorites to user account', async () => {
      const guestFavorites = [
        { productId: '507f1f77bcf86cd799439020' },
        { productId: '507f1f77bcf86cd799439021' },
      ];

      mockFavoriteModel.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue(guestFavorites),
      });

      mockFavoriteModel.findOne.mockResolvedValue(null);
      mockFavoriteModel.create.mockResolvedValue(mockFavorite);
      mockFavoriteModel.updateMany.mockResolvedValue({ modifiedCount: 2 });

      const result = await service.syncGuestToUser('device-123', '507f1f77bcf86cd799439015');

      expect(result.synced).toBe(2);
      expect(mockFavoriteModel.create).toHaveBeenCalledTimes(2);
    });

    it('should skip duplicate favorites during sync', async () => {
      const guestFavorites = [{ productId: '507f1f77bcf86cd799439020' }];

      mockFavoriteModel.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue(guestFavorites),
      });

      // Already exists
      mockFavoriteModel.findOne.mockResolvedValue(mockFavorite);
      mockFavoriteModel.updateMany.mockResolvedValue({ modifiedCount: 1 });

      const result = await service.syncGuestToUser('device-123', '507f1f77bcf86cd799439015');

      expect(result.skipped).toBe(1);
      expect(mockFavoriteModel.create).not.toHaveBeenCalled();
    });

    it('should handle empty guest favorites', async () => {
      mockFavoriteModel.find.mockReturnValue({
        lean: jest.fn().mockResolvedValue([]),
      });

      mockFavoriteModel.updateMany.mockResolvedValue({ modifiedCount: 0 });

      const result = await service.syncGuestToUser('device-123', '507f1f77bcf86cd799439015');

      expect(result.synced).toBe(0);
      expect(mockFavoriteModel.create).not.toHaveBeenCalled();
    });
  });

  describe('clearUserFavorites', () => {
    it('should clear all user favorites', async () => {
      mockFavoriteModel.updateMany.mockResolvedValue({ modifiedCount: 5 });

      const result = await service.clearUserFavorites('507f1f77bcf86cd799439015');

      expect(result.cleared).toBe(5);
      expect(mockFavoriteModel.updateMany).toHaveBeenCalled();
    });
  });

  describe('getUserFavoritesCount', () => {
    it('should return user favorite count', async () => {
      mockFavoriteModel.countDocuments.mockResolvedValue(10);

      const result = await service.getUserFavoritesCount('507f1f77bcf86cd799439015');

      expect(result).toBe(10);
      expect(mockFavoriteModel.countDocuments).toHaveBeenCalled();
    });

    it('should return zero when user has no favorites', async () => {
      mockFavoriteModel.countDocuments.mockResolvedValue(0);

      const result = await service.getUserFavoritesCount('507f1f77bcf86cd799439015');

      expect(result).toBe(0);
    });
  });
});
