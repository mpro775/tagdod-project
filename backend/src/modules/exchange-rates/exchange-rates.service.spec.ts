import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ExchangeRatesService } from './exchange-rates.service';
import { ExchangeRate } from './schemas/exchange-rate.schema';

describe('ExchangeRatesService', () => {
  let service: ExchangeRatesService;

  const mockExchangeRate = {
    _id: '507f1f77bcf86cd799439011',
    usdToYer: 250,
    usdToSar: 3.75,
    lastUpdatedBy: 'admin',
    lastUpdatedAt: new Date(),
    notes: 'تحديث يدوي',
  };

  let mockExchangeRateModel: {
    findOne: jest.Mock;
    deleteMany: jest.Mock;
    countDocuments: jest.Mock;
    new: jest.Mock;
  };

  beforeEach(async () => {
    mockExchangeRateModel = {
      findOne: jest.fn(),
      deleteMany: jest.fn(),
      countDocuments: jest.fn(),
      new: jest.fn(),
    };

    const ExchangeRateModelMock = jest.fn().mockImplementation((data) => ({
      ...data,
      save: jest.fn().mockResolvedValue({ ...mockExchangeRate, ...data }),
    }));

    Object.assign(ExchangeRateModelMock, mockExchangeRateModel);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeRatesService,
        {
          provide: getModelToken(ExchangeRate.name),
          useValue: ExchangeRateModelMock,
        },
      ],
    }).compile();

    service = module.get<ExchangeRatesService>(ExchangeRatesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCurrentRates', () => {
    it('should return current exchange rates', async () => {
      mockExchangeRateModel.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockExchangeRate),
      });

      const result = await service.getCurrentRates();

      expect(result).toEqual(mockExchangeRate);
      expect(mockExchangeRateModel.findOne).toHaveBeenCalled();
    });

    it('should create default rates when none exist', async () => {
      mockExchangeRateModel.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue(null),
      });

      const result = await service.getCurrentRates();

      expect(result).toBeDefined();
      expect(result.usdToYer).toBeDefined();
      expect(result.usdToSar).toBeDefined();
    });
  });

  describe('updateRates', () => {
    it('should update exchange rates successfully', async () => {
      const updateDto = {
        usdToYer: 260,
        usdToSar: 3.80,
        notes: 'تحديث جديد',
      };

      mockExchangeRateModel.deleteMany.mockResolvedValue({ deletedCount: 1 });

      const result = await service.updateRates(updateDto, 'admin123');

      expect(result).toBeDefined();
      expect(mockExchangeRateModel.deleteMany).toHaveBeenCalled();
    });
  });

  describe('convertCurrency', () => {
    it('should convert USD to YER', async () => {
      mockExchangeRateModel.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockExchangeRate),
      });

      const result = await service.convertCurrency({
        amount: 100,
        fromCurrency: 'USD',
        toCurrency: 'YER',
      });

      expect(result.result).toBe(25000); // 100 * 250
      expect(result.rate).toBe(250);
      expect(result.fromCurrency).toBe('USD');
      expect(result.toCurrency).toBe('YER');
    });

    it('should convert USD to SAR', async () => {
      mockExchangeRateModel.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockExchangeRate),
      });

      const result = await service.convertCurrency({
        amount: 100,
        fromCurrency: 'USD',
        toCurrency: 'SAR',
      });

      expect(result.result).toBe(375); // 100 * 3.75
      expect(result.rate).toBe(3.75);
    });

    it('should throw error for unsupported currency conversion', async () => {
      mockExchangeRateModel.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockExchangeRate),
      });

      await expect(
        service.convertCurrency({
          amount: 100,
          fromCurrency: 'EUR',
          toCurrency: 'YER',
        }),
      ).rejects.toThrow();
    });

    it('should handle zero amount', async () => {
      mockExchangeRateModel.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockExchangeRate),
      });

      const result = await service.convertCurrency({
        amount: 0,
        fromCurrency: 'USD',
        toCurrency: 'YER',
      });

      expect(result.result).toBe(0);
    });

    it('should handle decimal amounts', async () => {
      mockExchangeRateModel.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockExchangeRate),
      });

      const result = await service.convertCurrency({
        amount: 99.99,
        fromCurrency: 'USD',
        toCurrency: 'SAR',
      });

      expect(result.result).toBeCloseTo(374.96, 2);
    });
  });

  describe('convertFromUSDToYER', () => {
    it('should convert USD to YER', async () => {
      mockExchangeRateModel.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockExchangeRate),
      });

      const result = await service.convertFromUSDToYER(100);

      expect(result.result).toBe(25000);
      expect(result.fromCurrency).toBe('USD');
      expect(result.toCurrency).toBe('YER');
    });
  });

  describe('convertFromUSDToSAR', () => {
    it('should convert USD to SAR', async () => {
      mockExchangeRateModel.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockExchangeRate),
      });

      const result = await service.convertFromUSDToSAR(100);

      expect(result.result).toBe(375);
      expect(result.fromCurrency).toBe('USD');
      expect(result.toCurrency).toBe('SAR');
    });
  });

  describe('getUSDToYERRate', () => {
    it('should return USD to YER rate', async () => {
      mockExchangeRateModel.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockExchangeRate),
      });

      const result = await service.getUSDToYERRate();

      expect(result).toBe(250);
    });
  });

  describe('getUSDToSARRate', () => {
    it('should return USD to SAR rate', async () => {
      mockExchangeRateModel.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockExchangeRate),
      });

      const result = await service.getUSDToSARRate();

      expect(result).toBe(3.75);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      mockExchangeRateModel.findOne.mockReturnValue({
        sort: jest.fn().mockRejectedValue(new Error('Database error')),
      });

      await expect(service.getCurrentRates()).rejects.toThrow();
    });
  });
});
