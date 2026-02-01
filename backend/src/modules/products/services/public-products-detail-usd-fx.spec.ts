import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { PublicProductsPresenter } from './public-products.presenter';
import { ProductService } from './product.service';
import { VariantService } from './variant.service';
import { PricingService } from './pricing.service';
import { AttributesService } from '../../attributes/attributes.service';
import { ExchangeRatesService } from '../../exchange-rates/exchange-rates.service';
import { User } from '../../users/schemas/user.schema';
import { Capabilities } from '../../capabilities/schemas/capabilities.schema';
import { Types } from 'mongoose';

describe('PublicProductsPresenter (USD FX product detail)', () => {
  let presenter: PublicProductsPresenter;
  let exchangeRatesService: ExchangeRatesService;

  const productId = '507f1f77bcf86cd799439011';

  const mockProductService = {
    findById: jest.fn(),
    findByIds: jest.fn(),
  };

  const mockVariantService = {
    findByProductId: jest.fn(),
    findByProductIds: jest.fn(),
  };

  const mockPricingService = {
    getSimpleProductPricingByCurrencies: jest.fn(),
    getProductPricesWithDiscountByCurrencies: jest.fn(),
  };

  const mockAttributesService = {
    getAttributesWithValues: jest.fn().mockResolvedValue([]),
  };

  const mockUserModel = { findById: jest.fn().mockResolvedValue(null) };
  const mockCapabilitiesModel = { findOne: jest.fn().mockResolvedValue(null) };

  const mockExchangeRatesService = {
    getCurrentRates: jest.fn().mockResolvedValue({
      usdToYer: 250,
      usdToSar: 3.75,
      lastUpdatedAt: new Date('2025-01-15T12:00:00.000Z'),
    }),
  };

  const emptyVariantsPricingByCurrency = {
    USD: [],
    YER: [],
    SAR: [],
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    mockExchangeRatesService.getCurrentRates.mockResolvedValue({
      usdToYer: 250,
      usdToSar: 3.75,
      lastUpdatedAt: new Date('2025-01-15T12:00:00.000Z'),
    });
    mockVariantService.findByProductIds.mockResolvedValue({});
    mockPricingService.getProductPricesWithDiscountByCurrencies.mockResolvedValue(
      emptyVariantsPricingByCurrency,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublicProductsPresenter,
        { provide: ProductService, useValue: mockProductService },
        { provide: VariantService, useValue: mockVariantService },
        { provide: PricingService, useValue: mockPricingService },
        { provide: AttributesService, useValue: mockAttributesService },
        { provide: getModelToken(User.name), useValue: mockUserModel },
        { provide: getModelToken(Capabilities.name), useValue: mockCapabilitiesModel },
        { provide: ExchangeRatesService, useValue: mockExchangeRatesService },
      ],
    }).compile();

    presenter = module.get<PublicProductsPresenter>(PublicProductsPresenter);
    exchangeRatesService = module.get<ExchangeRatesService>(ExchangeRatesService);
  });

  describe('buildProductDetailResponseUsdFx', () => {
    it('returns data with fx, rounding, userDiscount, product, variants, relatedProducts', async () => {
      const product = {
        _id: new Types.ObjectId(productId),
        name: 'Product',
        nameEn: 'Product En',
        status: 'active',
        isActive: true,
        basePriceUSD: 100,
        relatedProducts: [],
        attributes: [],
      } as any;

      mockVariantService.findByProductId.mockResolvedValue([]);
      mockPricingService.getSimpleProductPricingByCurrencies.mockResolvedValue({
        USD: {
          basePrice: 100,
          discountPercent: 0,
          discountAmount: 0,
          finalPrice: 100,
          currency: 'USD',
        },
      });

      const result = await presenter.buildProductDetailResponseUsdFx(
        productId,
        product,
        [],
        0,
      );

      expect(result.data).toBeDefined();
      expect(result.data.fx).toBeDefined();
      expect(result.data.fx.base).toBe('USD');
      expect(result.data.fx.rates).toEqual({ YER: 250, SAR: 3.75 });
      expect(result.data.fx.version).toBeDefined();
      expect(typeof result.data.fx.version).toBe('string');

      expect(result.data.rounding).toEqual({
        USD: { decimals: 2 },
        SAR: { decimals: 2 },
        YER: { decimals: 0 },
      });

      expect(result.data.userDiscount).toEqual({
        isMerchant: false,
        discountPercent: 0,
      });

      expect(result.data.product).toBeDefined();
      expect(result.data.product.pricing).toBeDefined();
      expect(result.data.product.pricing.basePriceUSD).toBe(100);
      expect(result.data.product.pricing.finalPriceUSD).toBe(100);
      expect(result.data.product.pricingByCurrency).toBeUndefined();

      expect(Array.isArray(result.data.variants)).toBe(true);
      expect(Array.isArray(result.data.relatedProducts)).toBe(true);
    });

    it('fetches FX once per request', async () => {
      const product = {
        _id: new Types.ObjectId(productId),
        name: 'P',
        nameEn: 'P',
        status: 'active',
        isActive: true,
        basePriceUSD: 50,
        relatedProducts: [],
        attributes: [],
      } as any;

      mockVariantService.findByProductId.mockResolvedValue([]);
      mockPricingService.getSimpleProductPricingByCurrencies.mockResolvedValue({
        USD: { basePrice: 50, discountPercent: 0, discountAmount: 0, finalPrice: 50, currency: 'USD' },
      });

      await presenter.buildProductDetailResponseUsdFx(productId, product, [], 0);

      expect(mockExchangeRatesService.getCurrentRates).toHaveBeenCalledTimes(1);
    });

    it('product with variants: variants have pricing (USD) and no pricingByCurrency', async () => {
      const variantId = new Types.ObjectId();
      const product = {
        _id: new Types.ObjectId(productId),
        name: 'P',
        nameEn: 'P',
        status: 'active',
        isActive: true,
        relatedProducts: [],
        attributes: [],
      } as any;

      const variants = [
        {
          _id: variantId,
          productId,
          basePriceUSD: 80,
          stock: 5,
          isActive: true,
          attributeValues: [],
          minOrderQuantity: 1,
          maxOrderQuantity: 0,
        },
      ];

      mockPricingService.getProductPricesWithDiscountByCurrencies.mockResolvedValue({
        USD: [
          {
            variantId: variantId.toString(),
            basePrice: 80,
            discountPercent: 10,
            discountAmount: 8,
            finalPrice: 72,
            currency: 'USD',
          },
        ],
        YER: [
          {
            variantId: variantId.toString(),
            basePrice: 20000,
            discountPercent: 10,
            discountAmount: 2000,
            finalPrice: 18000,
            currency: 'YER',
          },
        ],
        SAR: [
          {
            variantId: variantId.toString(),
            basePrice: 300,
            discountPercent: 10,
            discountAmount: 30,
            finalPrice: 270,
            currency: 'SAR',
          },
        ],
      });

      const result = await presenter.buildProductDetailResponseUsdFx(
        productId,
        product,
        variants as any,
        10,
      );

      expect(result.data.variants.length).toBe(1);
      const v = result.data.variants[0];
      expect(v.pricing).toBeDefined();
      expect(v.pricing.basePriceUSD).toBe(80);
      expect(v.pricing.finalPriceUSD).toBe(72);
      expect(v.pricing.discountPercent).toBe(10);
      expect(v.pricingByCurrency).toBeUndefined();
      expect(v.stock).toBe(5);
    });

    it('relatedProducts have minPriceUSD, maxPriceUSD, priceStatus', async () => {
      const relatedId = '507f1f77bcf86cd799439022';
      const product = {
        _id: new Types.ObjectId(productId),
        name: 'P',
        nameEn: 'P',
        status: 'active',
        isActive: true,
        basePriceUSD: 100,
        relatedProducts: [new Types.ObjectId(relatedId)],
        attributes: [],
      } as any;

      mockVariantService.findByProductId.mockResolvedValue([]);
      mockVariantService.findByProductIds.mockResolvedValue({ [relatedId]: [] });
      mockProductService.findByIds.mockResolvedValue([
        {
          _id: new Types.ObjectId(relatedId),
          name: 'Related',
          nameEn: 'Related En',
          status: 'active',
          isActive: true,
          basePriceUSD: 30,
          stock: 2,
          attributes: [],
        },
      ]);

      mockPricingService.getSimpleProductPricingByCurrencies
        .mockResolvedValueOnce({
          USD: { basePrice: 100, discountPercent: 0, discountAmount: 0, finalPrice: 100, currency: 'USD' },
        })
        .mockResolvedValueOnce({
          USD: { basePrice: 30, discountPercent: 0, discountAmount: 0, finalPrice: 30, currency: 'USD' },
        });

      const result = await presenter.buildProductDetailResponseUsdFx(
        productId,
        product,
        [],
        0,
      );

      expect(result.data.relatedProducts.length).toBe(1);
      const r = result.data.relatedProducts[0];
      expect(r._id).toBe(relatedId);
      expect(r.name).toBe('Related');
      expect(r.pricing).toEqual({ minPriceUSD: 30, maxPriceUSD: 30 });
      expect(r.priceStatus).toBeDefined();
      expect(['ok', 'partial']).toContain(r.priceStatus);
    });

    it('priceStatus is partial when any price is 0 or missing', async () => {
      const relatedId = '507f1f77bcf86cd799439023';
      const product = {
        _id: new Types.ObjectId(productId),
        name: 'P',
        nameEn: 'P',
        status: 'active',
        isActive: true,
        basePriceUSD: 0,
        relatedProducts: [new Types.ObjectId(relatedId)],
        attributes: [],
      } as any;

      mockVariantService.findByProductId.mockResolvedValue([]);
      mockVariantService.findByProductIds.mockResolvedValue({ [relatedId]: [] });
      mockProductService.findByIds.mockResolvedValue([
        {
          _id: new Types.ObjectId(relatedId),
          name: 'Related',
          nameEn: 'Related En',
          status: 'active',
          isActive: true,
          basePriceUSD: 0,
          stock: 0,
          attributes: [],
        },
      ]);

      mockPricingService.getSimpleProductPricingByCurrencies.mockResolvedValue({
        USD: { basePrice: 0, discountPercent: 0, discountAmount: 0, finalPrice: 0, currency: 'USD' },
      });

      const result = await presenter.buildProductDetailResponseUsdFx(
        productId,
        product,
        [],
        0,
      );

      expect(result.data.relatedProducts.length).toBe(1);
      expect(result.data.relatedProducts[0].priceStatus).toBe('partial');
    });
  });
});
