import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Variant, VariantAttribute } from '../schemas/variant.schema';
import { Product } from '../schemas/product.schema';
import { 
  ProductNotFoundException,
  VariantNotFoundException,
  ProductException,
  ErrorCode 
} from '../../../shared/exceptions';
import { AttributesService } from '../../attributes/attributes.service';
import { ProductPricingCalculatorService } from './product-pricing-calculator.service';
import { ExchangeRate } from '../../exchange-rates/schemas/exchange-rate.schema';

// Local, explicit types to eliminate 'any' usage and align with real data
type AttributeValueInput = {
  attributeId: string;
  valueId: string;
};

type EnrichedAttributeValue = {
  attributeId: string;
  valueId: string;
  name: string;
  nameEn: string;
  value: string;
  valueEn: string;
};

type MonetaryInputFields = {
  price?: number;
  compareAtPrice?: number;
  costPrice?: number;
};

type CreateVariantDto = {
  productId: string;
  attributeValues?: AttributeValueInput[];
} & MonetaryInputFields & Partial<Variant>;

type UpdateVariantDto = MonetaryInputFields & Partial<Variant>;

type HasToObject<T> = {
  toObject: () => T;
};

function hasToObject<T>(value: unknown): value is HasToObject<T> {
  return typeof (value as HasToObject<T>).toObject === 'function';
}

@Injectable()
export class VariantService {
  private readonly logger = new Logger(VariantService.name);

  constructor(
    @InjectModel(Variant.name) private variantModel: Model<Variant>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    private attributesService: AttributesService,
    private productPricingCalculator: ProductPricingCalculatorService,
  ) {}

  // ==================== CRUD Operations ====================

  async create(dto: CreateVariantDto): Promise<Variant> {
    this.logger.log(`Creating variant for product ${dto.productId}`, {
      productId: dto.productId,
      price: dto.price,
      stock: dto.stock,
      sku: dto.sku,
      attributeValuesCount: dto.attributeValues?.length || 0,
    });

    try {
      const product = await this.productModel.findById(dto.productId);

      if (!product) {
        throw new ProductNotFoundException({ productId: dto.productId });
      }

      // حفظ name و value للعرض السريع
      const enrichedAttributes: EnrichedAttributeValue[] = await Promise.all(
        (dto.attributeValues || []).map(async (av: AttributeValueInput) => {
          try {
            const attr = await this.attributesService.getAttribute(av.attributeId);
            const value = attr.values?.find(
              (v: { _id: Types.ObjectId }) => String(v._id) === String(av.valueId),
            );

            return {
              attributeId: av.attributeId,
              valueId: av.valueId,
              name: attr.name,
              nameEn: attr.nameEn,
              value: value?.value || '',
              valueEn: value?.valueEn || value?.value || '',
            };
          } catch (error) {
            const err = error instanceof Error ? error : new Error(String(error));
            this.logger.error(`Error enriching attribute ${av.attributeId}: ${err.message}`);
            throw err;
          }
        }),
      );

      // إضافة retry logic للـ exchange rates
      let rates: ExchangeRate | undefined;
      let retries = 3;
      while (retries > 0) {
        try {
          rates = await this.productPricingCalculator.getLatestRates();
          this.logger.log(`Exchange rates fetched successfully`);
          break;
        } catch (error) {
          retries--;
          const err = error instanceof Error ? error : new Error(String(error));
          if (retries === 0) {
            this.logger.error('Failed to fetch exchange rates after 3 attempts', {
              error: err.message,
              productId: dto.productId,
            });
            throw new Error('فشل في جلب أسعار الصرف. يرجى المحاولة مرة أخرى');
          }
          this.logger.warn(`Retrying exchange rates fetch, ${retries} attempts remaining`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (!rates) {
        throw new Error('فشل في جلب أسعار الصرف');
      }

      const pricingFields = await this.productPricingCalculator.calculateVariantPricing(
        {
          basePriceUSD: dto.price ?? dto.basePriceUSD ?? 0,
          compareAtPriceUSD: dto.compareAtPrice ?? dto.compareAtPriceUSD,
          costPriceUSD: dto.costPrice ?? dto.costPriceUSD,
        },
        rates,
      );

      // التحقق من SKU المكرر قبل الإنشاء
      if (dto.sku && dto.sku.trim()) {
        const existingVariant = await this.variantModel.findOne({
          sku: dto.sku.trim(),
          deletedAt: null,
        });
        
        if (existingVariant) {
          this.logger.warn(`Duplicate SKU detected: ${dto.sku}`, {
            existingVariantId: existingVariant._id,
            productId: dto.productId,
          });
          throw new Error(`SKU ${dto.sku} موجود مسبقاً`);
        }
      }

      const variant = await this.variantModel.create({
        ...dto,
        attributeValues: enrichedAttributes,
        productId: new Types.ObjectId(dto.productId as string),
        basePriceUSD: dto.price ?? 0,
        compareAtPriceUSD: dto.compareAtPrice,
        costPriceUSD: dto.costPrice,
        ...pricingFields,
      });

      this.logger.log(`Variant created successfully: ${variant._id}`);

      // تحديث عدد الـ variants
      try {
        await this.updateProductVariantCount(dto.productId as string);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        this.logger.warn(`Failed to update variant count, but variant was created: ${err.message}`);
      }

      // تحديث usage count للسمات
      for (const av of enrichedAttributes) {
        try {
          await this.attributesService.incrementUsage(av.attributeId, av.valueId);
        } catch (error) {
          const err = error instanceof Error ? error : new Error(String(error));
          this.logger.warn(`Failed to increment usage for attribute ${av.attributeId}: ${err.message}`);
        }
      }

      return variant;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      this.logger.error(`Error creating variant: ${err.message}`, {
        error: err.message,
        stack: err.stack,
        dto: {
          productId: dto.productId,
          price: dto.price,
          stock: dto.stock,
          sku: dto.sku,
          attributeValuesCount: dto.attributeValues?.length || 0,
        },
      });

      // إعادة رمي الخطأ مع معلومات أفضل
      if (error instanceof ProductNotFoundException) {
        throw error;
      }

      // معالجة أخطاء MongoDB
      if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
        const mongoError = error as { keyPattern?: Record<string, unknown> };
        const field = Object.keys(mongoError.keyPattern || {})[0] || 'field';
        throw new Error(`${field === 'sku' ? 'SKU' : field} موجود مسبقاً`);
      }

      throw err;
    }
  }

  async findById(id: string): Promise<Variant> {
    const variant = await this.variantModel.findById(id).populate('imageId');

    if (!variant) {
      throw new VariantNotFoundException({ variantId: id });
    }

    return variant.toObject();
  }

  async findByProductId(productId: string, includeDeleted = false): Promise<Variant[]> {
    const filter: FilterQuery<Variant> = {
      productId: new Types.ObjectId(productId),
    } as FilterQuery<Variant>;

    if (!includeDeleted) {
      filter.deletedAt = null;
    }

    const documents = await this.variantModel
      .find(filter)
      .sort({ basePriceUSD: 1 })
      .lean();

    return this.transformVariantDocuments(documents);
  }

  async findByProductIds(
    productIds: string[],
    includeDeleted = false,
  ): Promise<Record<string, Variant[]>> {
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return {};
    }

    const objectIds = productIds
      .filter((id): id is string => typeof id === 'string' && Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id));

    if (objectIds.length === 0) {
      return {};
    }

    const filter: FilterQuery<Variant> = {
      productId: { $in: objectIds },
    } as FilterQuery<Variant>;

    if (!includeDeleted) {
      filter.deletedAt = null;
    }

    const documents = await this.variantModel
      .find(filter)
      .sort({ productId: 1, basePriceUSD: 1 })
      .lean();

    const transformed = this.transformVariantDocuments(documents);
    const grouped: Record<string, Variant[]> = {};

    transformed.forEach((variant) => {
      const productId = this.normalizeReferenceId((variant as unknown as { productId?: unknown }).productId);

      if (!productId) {
        return;
      }

      if (!grouped[productId]) {
        grouped[productId] = [];
      }

      grouped[productId].push(variant);
    });

    return grouped;
  }

  async update(id: string, dto: UpdateVariantDto): Promise<Variant> {
    const variant = await this.variantModel.findById(id);

    if (!variant) {
      throw new VariantNotFoundException({ variantId: id });
    }

    // تحويل price إلى basePriceUSD إذا كان موجوداً
    const updateData: Record<string, unknown> = { ...dto };
    
    if (Object.prototype.hasOwnProperty.call(dto, 'price') && dto.price !== undefined) {
      updateData.basePriceUSD = dto.price;
      delete (updateData as UpdateVariantDto).price;
    }
    if (Object.prototype.hasOwnProperty.call(dto, 'compareAtPrice') && dto.compareAtPrice !== undefined) {
      updateData.compareAtPriceUSD = dto.compareAtPrice;
      delete (updateData as UpdateVariantDto).compareAtPrice;
    }
    if (Object.prototype.hasOwnProperty.call(dto, 'costPrice') && dto.costPrice !== undefined) {
      updateData.costPriceUSD = dto.costPrice;
      delete (updateData as UpdateVariantDto).costPrice;
    }

    const priceFieldsTouched =
      Object.prototype.hasOwnProperty.call(updateData, 'basePriceUSD') ||
      Object.prototype.hasOwnProperty.call(updateData, 'compareAtPriceUSD') ||
      Object.prototype.hasOwnProperty.call(updateData, 'costPriceUSD');

    if (priceFieldsTouched) {
      const rates = await this.productPricingCalculator.getLatestRates();
      const pricingFields = await this.productPricingCalculator.calculateVariantPricing(
        {
          basePriceUSD: Object.prototype.hasOwnProperty.call(updateData, 'basePriceUSD')
            ? (updateData.basePriceUSD as number | undefined)
            : variant.basePriceUSD,
          compareAtPriceUSD: Object.prototype.hasOwnProperty.call(updateData, 'compareAtPriceUSD')
            ? (updateData.compareAtPriceUSD as number | undefined)
            : variant.compareAtPriceUSD,
          costPriceUSD: Object.prototype.hasOwnProperty.call(updateData, 'costPriceUSD')
            ? (updateData.costPriceUSD as number | undefined)
            : variant.costPriceUSD,
        },
        rates,
      );

      Object.assign(updateData, pricingFields);
    }

    await this.variantModel.updateOne({ _id: id }, { $set: updateData });
    return this.findById(id);
  }

  async delete(id: string, userId: string): Promise<Variant> {
    const variant = await this.variantModel.findById(id);

    if (!variant) {
      throw new VariantNotFoundException({ variantId: id });
    }

    // Soft delete
    variant.deletedAt = new Date();
    variant.deletedBy = userId;
    await variant.save();

    // تحديث عدد الـ variants
    await this.updateProductVariantCount(variant.productId);

    // تقليل usage count
    for (const av of variant.attributeValues) {
      await this.attributesService.decrementUsage(av.attributeId, av.valueId);
    }

    return variant;
  }

  // ==================== Variant Generation ====================

  async generateVariants(
    productId: string,
    defaultPrice: number,
    defaultStock: number,
    overwrite = false,
  ): Promise<{ generated: number; total: number; variants: Variant[] }> {
    const product = await this.productModel.findById(productId).lean();

    if (!product) {
      throw new ProductNotFoundException({ productId });
    }

    if (!product.attributes || product.attributes.length === 0) {
      throw new ProductException(ErrorCode.PRODUCT_INVALID_DATA, { productId, reason: 'no_attributes' });
    }

    // جلب جميع قيم السمات
    const attributesWithValues = await Promise.all(
      product.attributes.map(async (attrId: string) => {
        const attr = await this.attributesService.getAttribute(String(attrId));
        return {
          attributeId: String(attrId),
          name: attr.name,
          nameEn: attr.nameEn,
          values: attr.values || [],
        };
      }),
    );

    // توليد جميع التركيبات الممكنة
    const combinations = this.generateCombinations(attributesWithValues);

    // حذف الموجودة إذا overwrite
    if (overwrite) {
      await this.variantModel.deleteMany({ productId: new Types.ObjectId(productId) } as FilterQuery<Variant>);
    }

    const rates = await this.productPricingCalculator.getLatestRates();
    const defaultPricingFields =
      await this.productPricingCalculator.calculateVariantPricing(
        {
          basePriceUSD: defaultPrice,
        },
        rates,
      );

    // إنشاء الـ variants
    const variants: Variant[] = [];
    for (const combo of combinations) {
      // التحقق من عدم وجود variant بنفس التركيبة
      const existing = await this.variantModel.findOne({
        productId: new Types.ObjectId(productId),
        deletedAt: null,
        attributeValues: {
          $all: combo.map((c: { attributeId: string; valueId: string }) => ({
            $elemMatch: {
              attributeId: c.attributeId,
              valueId: c.valueId,
            },
          })),
        },
      });

      if (!existing || overwrite) {
        const variant = await this.variantModel.create({
          productId: new Types.ObjectId(productId),
          attributeValues: combo,
          basePriceUSD: defaultPrice,
          ...defaultPricingFields,
          stock: defaultStock,
          trackInventory: true,
          isActive: true,
          isAvailable: true,
        });
        variants.push(variant);

        // تحديث usage count
        for (const av of combo) {
          await this.attributesService.incrementUsage(av.attributeId, av.valueId);
        }
      }
    }

    // تحديث عدد الـ variants
    const totalVariants = await this.variantModel.countDocuments({
      productId: new Types.ObjectId(productId),
      deletedAt: null,
    } as FilterQuery<Variant>);

    await this.productModel.updateOne(
      { _id: productId },
      { $set: { variantsCount: totalVariants } },
    );

    return {
      generated: variants.length,
      total: totalVariants,
      variants: variants.map(v => (hasToObject<Variant>(v) ? v.toObject() : v)),
    };
  }

  // ==================== Inventory Management ====================

  async updateStock(
    variantId: string,
    quantity: number,
    operation: 'add' | 'subtract' = 'subtract',
  ): Promise<void> {
    const update =
      operation === 'add' ? { $inc: { stock: quantity } } : { $inc: { stock: -quantity } };

    await this.variantModel.updateOne({ _id: variantId }, update);
  }

  async checkAvailability(
    variantId: string,
    requestedQuantity: number,
  ): Promise<{
    available: boolean;
    reason?: string;
    availableStock?: number;
  }> {
    const variant = await this.variantModel.findById(variantId).lean();

    if (!variant) {
      return { available: false, reason: 'VARIANT_NOT_FOUND' };
    }

    if (!variant.isActive || !variant.isAvailable) {
      return { available: false, reason: 'VARIANT_NOT_AVAILABLE' };
    }

    if (variant.trackInventory && variant.stock < requestedQuantity) {
      if (!variant.allowBackorder) {
        return {
          available: false,
          reason: 'INSUFFICIENT_STOCK',
          availableStock: variant.stock,
        };
      }
    }

    return { available: true, availableStock: variant.stock };
  }

  // ==================== Helper Methods ====================

  private async updateProductVariantCount(productId: string): Promise<void> {
    const count = await this.variantModel.countDocuments({
      productId: new Types.ObjectId(productId),
      deletedAt: null,
    } as FilterQuery<Variant>);

    await this.productModel.updateOne({ _id: productId }, { $set: { variantsCount: count } });
  }

  private generateCombinations(
    attributesWithValues: Array<{
      attributeId: string;
      name: string;
      nameEn?: string;
      values: Array<{ _id: Types.ObjectId; value: string; valueEn?: string }>;
    }>,
  ): Array<
    Array<{
      attributeId: string;
      valueId: string;
      name: string;
      nameEn?: string;
      value: string;
      valueEn?: string;
    }>
  > {
    if (attributesWithValues.length === 0) return [];

    if (attributesWithValues.length === 1) {
      return attributesWithValues[0].values.map((v: { _id: Types.ObjectId; value: string; valueEn?: string }) => [
        {
          attributeId: attributesWithValues[0].attributeId,
          valueId: String(v._id),
          name: attributesWithValues[0].name,
          nameEn: attributesWithValues[0].nameEn ?? attributesWithValues[0].name,
          value: v.value,
          valueEn: v.valueEn ?? v.value,
        },
      ]);
    }

    const [first, ...rest] = attributesWithValues;
    const restCombinations = this.generateCombinations(rest);

    const result: Array<
      Array<{
        attributeId: string;
        valueId: string;
        name: string;
        nameEn?: string;
        value: string;
        valueEn?: string;
      }>
    > = [];

    for (const value of first.values) {
      for (const combo of restCombinations) {
        result.push([
          {
            attributeId: first.attributeId,
            valueId: String(value._id),
            name: first.name,
            nameEn: first.nameEn ?? first.name,
            value: value.value,
            valueEn: value.valueEn ?? value.value,
          },
          ...combo,
        ]);
      }
    }

    return result;
  }

  private transformVariantDocuments(
    documents: Array<Record<string, unknown>>,
  ): Variant[] {
    if (!documents || documents.length === 0) {
      return [];
    }

    return documents.map((document) => {
      const variantRecord = { ...document } as Record<string, unknown>;

      if (Array.isArray(variantRecord.attributeValues)) {
        const attributeValues = variantRecord.attributeValues as Array<Record<string, unknown>>;

        variantRecord.attributeValues = attributeValues.map((attributeValueRecord) => {
          const attributeRaw = attributeValueRecord['attributeId'];
          const valueRaw = attributeValueRecord['valueId'];

          const attributeId = this.normalizeReferenceId(attributeRaw);
          const valueId = this.normalizeReferenceId(valueRaw);

          const name =
            typeof attributeValueRecord['name'] === 'string' ? (attributeValueRecord['name'] as string) : '';
          const nameEn =
            typeof attributeValueRecord['nameEn'] === 'string'
              ? (attributeValueRecord['nameEn'] as string)
              : name;
          const value =
            typeof attributeValueRecord['value'] === 'string' ? (attributeValueRecord['value'] as string) : '';
          const valueEn =
            typeof attributeValueRecord['valueEn'] === 'string'
              ? (attributeValueRecord['valueEn'] as string)
              : value;

          return {
            attributeId,
            valueId,
            name,
            nameEn,
            value,
            valueEn,
          } as VariantAttribute;
        });
      }

      return variantRecord as unknown as Variant;
    });
  }

  private normalizeReferenceId(ref: unknown): string {
    if (!ref) {
      return '';
    }

    if (typeof ref === 'string') {
      return ref;
    }

    if (typeof ref === 'object') {
      const record = ref as Record<string, unknown>;

      if (record._id) {
        const { _id } = record as { _id: Types.ObjectId | string };
        if (typeof _id === 'string') {
          return _id;
        }
        if (_id && typeof _id.toString === 'function') {
          const converted = _id.toString();
          return converted === '[object Object]' ? '' : converted;
        }
      }

      if (typeof (record as { toString?: () => string }).toString === 'function') {
        const converted = (record as { toString: () => string }).toString();
        return converted === '[object Object]' ? '' : converted;
      }
    }

    return '';
  }
}
