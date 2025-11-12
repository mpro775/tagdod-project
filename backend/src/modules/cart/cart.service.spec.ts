import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { CartService } from './cart.service';
import { Cart } from './schemas/cart.schema';
import { Variant } from '../products/schemas/variant.schema';
import { Product } from '../products/schemas/product.schema';
import { Capabilities } from '../capabilities/schemas/capabilities.schema';

describe('CartService', () => {
  let service: CartService;

  const mockCartItem = {
    _id: '507f1f77bcf86cd799439030',
    variantId: '507f1f77bcf86cd799439011',
    qty: 2,
    unitPrice: 1000,
    lineTotal: 2000,
  };

  const mockCart = {
    _id: '507f1f77bcf86cd799439020',
    userId: '507f1f77bcf86cd799439015',
    items: [mockCartItem],
    currency: 'YER',
    accountType: 'retail',
    status: 'active',
    lastActivityAt: new Date(),
    createdAt: new Date(),
    save: jest.fn(),
  };

  const mockGuestCart = {
    _id: '507f1f77bcf86cd799439021',
    deviceId: 'device-123',
    items: [mockCartItem],
    currency: 'YER',
    accountType: 'retail',
    status: 'active',
    lastActivityAt: new Date(),
    createdAt: new Date(),
    save: jest.fn(),
  };

  const mockCartModel = {
    findOne: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    updateOne: jest.fn(),
    deleteOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
    aggregate: jest.fn(),
    countDocuments: jest.fn(),
  };

  const mockVariantModel = {
    findById: jest.fn(),
  };

  const mockProductModel = {
    findById: jest.fn(),
  };

  const mockCapsModel = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: getModelToken(Cart.name),
          useValue: mockCartModel,
        },
        {
          provide: getModelToken(Variant.name),
          useValue: mockVariantModel,
        },
        {
          provide: getModelToken(Product.name),
          useValue: mockProductModel,
        },
        {
          provide: getModelToken(Capabilities.name),
          useValue: mockCapsModel,
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserCart', () => {
    it('should return user cart when exists', async () => {
      mockCartModel.findOne.mockResolvedValue(mockCart);

      const result = await service.getUserCart('507f1f77bcf86cd799439015');

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(mockCartModel.findOne).toHaveBeenCalledWith({
        userId: '507f1f77bcf86cd799439015',
      });
    });

    it('should create new cart if user cart does not exist', async () => {
      mockCartModel.findOne.mockResolvedValue(null);
      mockCartModel.create.mockResolvedValue(mockCart);

      const result = await service.getUserCart('507f1f77bcf86cd799439015');

      expect(result).toBeDefined();
      expect(mockCartModel.create).toHaveBeenCalled();
    });
  });

  describe('getGuestCart', () => {
    it('should return guest cart when exists', async () => {
      mockCartModel.findOne.mockResolvedValue(mockGuestCart);

      const result = await service.getGuestCart('device-123');

      expect(result).toBeDefined();
      expect(result.items).toBeDefined();
      expect(mockCartModel.findOne).toHaveBeenCalledWith({
        deviceId: 'device-123',
      });
    });

    it('should create new guest cart if does not exist', async () => {
      mockCartModel.findOne.mockResolvedValue(null);
      mockCartModel.create.mockResolvedValue(mockGuestCart);

      const result = await service.getGuestCart('device-123');

      expect(result).toBeDefined();
      expect(mockCartModel.create).toHaveBeenCalled();
    });
  });

  describe('addUserItem', () => {
    it('should add new item to user cart', async () => {
      const cart = {
        ...mockCart,
        items: [],
        save: jest.fn().mockResolvedValue(mockCart),
      };

      mockCartModel.findOne.mockResolvedValue(cart);
      mockVariantModel.findById.mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        productId: '507f1f77bcf86cd799439099',
        basePriceUSD: 100,
        stock: 50,
        isActive: true,
      });
      mockProductModel.findById.mockResolvedValue({
        _id: '507f1f77bcf86cd799439099',
        basePriceUSD: 100,
        name: 'Product',
        slug: 'product',
      });

      await service.addUserItem('507f1f77bcf86cd799439015', {
        variantId: '507f1f77bcf86cd799439011',
        qty: 2,
      });

      expect(cart.save).toHaveBeenCalled();
    });

    it('should throw error when adding with invalid quantity', async () => {
      mockCartModel.findOne.mockResolvedValue(mockCart);

      await expect(
        service.addUserItem('507f1f77bcf86cd799439015', {
          variantId: '507f1f77bcf86cd799439011',
          qty: 0,
        }),
      ).rejects.toThrow();
    });
  });

  describe('addGuestItem', () => {
    it('should add new item to guest cart', async () => {
      const cart = {
        ...mockGuestCart,
        items: [],
        save: jest.fn().mockResolvedValue(mockGuestCart),
      };

      mockCartModel.findOne.mockResolvedValue(cart);
      mockVariantModel.findById.mockResolvedValue({
        _id: '507f1f77bcf86cd799439011',
        productId: '507f1f77bcf86cd799439099',
        basePriceUSD: 100,
        stock: 50,
        isActive: true,
      });
      mockProductModel.findById.mockResolvedValue({
        _id: '507f1f77bcf86cd799439099',
        basePriceUSD: 100,
        name: 'Product',
        slug: 'product',
      });

      await service.addGuestItem({
        deviceId: 'device-123',
        variantId: '507f1f77bcf86cd799439011',
        qty: 2,
      });

      expect(cart.save).toHaveBeenCalled();
    });
  });

  describe('syncUserCart', () => {
    it('should replace items and update metadata from payload', async () => {
      const cart = {
        ...mockCart,
        items: [{ ...mockCartItem }],
        save: jest.fn().mockResolvedValue(mockCart),
      };

      const getCartSpy = jest
        .spyOn(service, 'getUserCart')
        .mockResolvedValue({ items: [], currency: 'SAR' } as any);
      const addOrUpdateSpy = jest
        .spyOn<any, any>(service as any, 'addOrUpdateCartItem')
        .mockImplementation(async () => undefined);

      mockCartModel.findOne.mockResolvedValue(cart);

      const result = await service.syncUserCart('507f1f77bcf86cd799439015', {
        items: [{ variantId: '507f1f77bcf86cd799439011', qty: 3 }],
        currency: 'sar',
        accountType: 'merchant',
      });

      expect(cart.currency).toBe('SAR');
      expect(cart.accountType).toBe('merchant');
      expect(addOrUpdateSpy).toHaveBeenCalledTimes(1);
      expect(addOrUpdateSpy).toHaveBeenCalledWith(cart, {
        variantId: '507f1f77bcf86cd799439011',
        qty: 3,
      });
      expect(cart.save).toHaveBeenCalled();
      expect(getCartSpy).toHaveBeenCalledWith('507f1f77bcf86cd799439015');
      expect(result).toEqual({ items: [], currency: 'SAR' });

      getCartSpy.mockRestore();
      addOrUpdateSpy.mockRestore();
    });
  });

  describe('updateUserItem', () => {
    it('should update item quantity in user cart', async () => {
      const cart = {
        ...mockCart,
        items: [{ ...mockCartItem }],
        save: jest.fn().mockResolvedValue(mockCart),
      };

      mockCartModel.findOne.mockResolvedValue(cart);

      await service.updateUserItem(
        '507f1f77bcf86cd799439015',
        '507f1f77bcf86cd799439030',
        5,
      );

      expect(cart.save).toHaveBeenCalled();
    });

    it('should remove item when quantity is zero', async () => {
      const cart = {
        ...mockCart,
        items: [{ ...mockCartItem }],
        save: jest.fn().mockResolvedValue(mockCart),
      };

      mockCartModel.findOne.mockResolvedValue(cart);

      await service.updateUserItem('507f1f77bcf86cd799439015', '507f1f77bcf86cd799439030', 0);

      expect(cart.save).toHaveBeenCalled();
    });
  });

  describe('removeUserItem', () => {
    it('should remove item from user cart', async () => {
      const cart = {
        ...mockCart,
        items: [mockCartItem],
        save: jest.fn().mockResolvedValue(mockCart),
      };

      mockCartModel.findOne.mockResolvedValue(cart);

      await service.removeUserItem('507f1f77bcf86cd799439015', '507f1f77bcf86cd799439030');

      expect(cart.save).toHaveBeenCalled();
    });

    it('should throw error when removing non-existent item', async () => {
      mockCartModel.findOne.mockResolvedValue(mockCart);

      await expect(
        service.removeUserItem('507f1f77bcf86cd799439015', 'non-existent-id'),
      ).rejects.toThrow();
    });
  });

  describe('removeGuestItem', () => {
    it('should remove item from guest cart', async () => {
      const cart = {
        ...mockGuestCart,
        items: [mockCartItem],
        save: jest.fn().mockResolvedValue(mockGuestCart),
      };

      mockCartModel.findOne.mockResolvedValue(cart);

      await service.removeGuestItem('device-123', '507f1f77bcf86cd799439030');

      expect(cart.save).toHaveBeenCalled();
    });
  });

  describe('clearUserCart', () => {
    it('should clear all items from user cart', async () => {
      const cart = {
        ...mockCart,
        items: [mockCartItem, { ...mockCartItem, _id: '507f1f77bcf86cd799439031' }],
        save: jest.fn().mockResolvedValue({ ...mockCart, items: [] }),
      };

      mockCartModel.findOne.mockResolvedValue(cart);

      await service.clearUserCart('507f1f77bcf86cd799439015');

      expect(cart.save).toHaveBeenCalled();
    });
  });

  describe('clearGuestCart', () => {
    it('should clear all items from guest cart', async () => {
      const cart = {
        ...mockGuestCart,
        items: [mockCartItem],
        save: jest.fn().mockResolvedValue({ ...mockGuestCart, items: [] }),
      };

      mockCartModel.findOne.mockResolvedValue(cart);

      await service.clearGuestCart('device-123');

      expect(cart.save).toHaveBeenCalled();
    });
  });

  describe('merge', () => {
    it('should merge guest cart items to user cart', async () => {
      const guestCart = {
        ...mockGuestCart,
        items: [mockCartItem],
        save: jest.fn(),
      };

      const userCart = {
        ...mockCart,
        items: [],
        save: jest.fn().mockResolvedValue(mockCart),
      };

      mockCartModel.findOne
        .mockResolvedValueOnce(guestCart)
        .mockResolvedValueOnce(userCart);

      mockCartModel.deleteOne.mockResolvedValue({ deletedCount: 1 });

      await service.merge('device-123', '507f1f77bcf86cd799439015');

      expect(userCart.save).toHaveBeenCalled();
      expect(mockCartModel.deleteOne).toHaveBeenCalledWith({ deviceId: 'device-123' });
    });

    it('should handle merging when no guest cart exists', async () => {
      mockCartModel.findOne.mockResolvedValue(null);

      await expect(
        service.merge('device-123', '507f1f77bcf86cd799439015'),
      ).resolves.not.toThrow();
    });
  });

  describe('Cart Analytics', () => {
    it('should get cart statistics', async () => {
      mockCartModel.countDocuments.mockResolvedValue(100);
      mockCartModel.aggregate.mockResolvedValue([
        { _id: null, totalItems: 250, avgItems: 2.5 },
      ]);

      const result = await service.getCartStatistics();

      expect(result).toBeDefined();
      expect(mockCartModel.countDocuments).toHaveBeenCalled();
      expect(mockCartModel.aggregate).toHaveBeenCalled();
    });

    it('should get cart analytics for period', async () => {
      mockCartModel.aggregate.mockResolvedValue([]);

      const result = await service.getCartAnalytics(30);

      expect(result).toBeDefined();
      expect(mockCartModel.aggregate).toHaveBeenCalled();
    });
  });
});
