import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';
import { Variant } from '../schemas/variant.schema';
import { Product } from '../schemas/product.schema';
import { AppException } from '../../../shared/exceptions/app.exception';
import { AttributesService } from '../../attributes/attributes.service';

@Injectable()
export class VariantService {
  private readonly logger = new Logger(VariantService.name);

  constructor(
    @InjectModel(Variant.name) private variantModel: Model<Variant>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    private attributesService: AttributesService,
  ) {}

  // ==================== CRUD Operations ====================

  async create(dto: Partial<Variant>): Promise<Variant> {
    const product = await this.productModel.findById(dto.productId);

    if (!product) {
      throw new AppException('PRODUCT_NOT_FOUND', 'المنتج غير موجود', null, 404);
    }

    // حفظ name و value للعرض السريع
    const enrichedAttributes = await Promise.all(
      (dto.attributeValues || []).map(async (av: { attributeId: string; valueId: string }) => {
        const attr = await this.attributesService.getAttribute(av.attributeId);
        const value = attr.values?.find(
          (v: { _id: Types.ObjectId }) => String(v._id) === String(av.valueId),
        );

        return {
          attributeId: av.attributeId,
          valueId: av.valueId,
          name: attr.name,
          value: value?.value || '',
        };
      }),
    );

    const variant = await this.variantModel.create({
      ...dto,
      attributeValues: enrichedAttributes,
      productId: new Types.ObjectId(dto.productId as string),
    });

    // تحديث عدد الـ variants
    await this.updateProductVariantCount(dto.productId as string);

    // تحديث usage count للسمات
    for (const av of enrichedAttributes) {
      await this.attributesService.incrementUsage(av.attributeId, av.valueId);
    }

    return variant;
  }

  async findById(id: string): Promise<Variant> {
    const variant = await this.variantModel.findById(id).populate('imageId').lean();

    if (!variant) {
      throw new AppException('VARIANT_NOT_FOUND', 'المتغير غير موجود', null, 404);
    }

    return variant;
  }

  async findByProductId(productId: string, includeDeleted = false): Promise<Variant[]> {
    const filter: FilterQuery<Variant> = { productId };

    if (!includeDeleted) {
      filter.deletedAt = null;
    }

    return this.variantModel.find(filter).populate('imageId').sort({ basePriceUSD: 1 }).lean();
  }

  async update(id: string, dto: Partial<Variant>): Promise<Variant> {
    const variant = await this.variantModel.findById(id);

    if (!variant) {
      throw new AppException('VARIANT_NOT_FOUND', 'المتغير غير موجود', null, 404);
    }

    await this.variantModel.updateOne({ _id: id }, { $set: dto });
    return this.findById(id);
  }

  async delete(id: string, userId: string): Promise<Variant> {
    const variant = await this.variantModel.findById(id);

    if (!variant) {
      throw new AppException('VARIANT_NOT_FOUND', 'المتغير غير موجود', null, 404);
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
      throw new AppException('PRODUCT_NOT_FOUND', 'المنتج غير موجود', null, 404);
    }

    if (!product.attributes || product.attributes.length === 0) {
      throw new AppException('NO_ATTRIBUTES', 'المنتج ليس لديه سمات', null, 400);
    }

    // جلب جميع قيم السمات
    const attributesWithValues = await Promise.all(
      product.attributes.map(async (attrId: string) => {
        const attr = await this.attributesService.getAttribute(String(attrId));
        return {
          attributeId: String(attrId),
          name: attr.name,
          values: attr.values || [],
        };
      }),
    );

    // توليد جميع التركيبات الممكنة
    const combinations = this.generateCombinations(attributesWithValues);

    // حذف الموجودة إذا overwrite
    if (overwrite) {
      await this.variantModel.deleteMany({ productId });
    }

    // إنشاء الـ variants
    const variants = [];
    for (const combo of combinations) {
      // التحقق من عدم وجود variant بنفس التركيبة
      const existing = await this.variantModel.findOne({
        productId,
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
      productId,
      deletedAt: null,
    });

    await this.productModel.updateOne(
      { _id: productId },
      { $set: { variantsCount: totalVariants } },
    );

    return {
      generated: variants.length,
      total: totalVariants,
      variants,
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
      productId,
      deletedAt: null,
    });

    await this.productModel.updateOne({ _id: productId }, { $set: { variantsCount: count } });
  }

  private generateCombinations(
    attributesWithValues: Array<{
      attributeId: string;
      name: string;
      values: Array<{ _id: Types.ObjectId; value: string }>;
    }>,
  ): Array<
    Array<{
      attributeId: string;
      valueId: string;
      name: string;
      value: string;
    }>
  > {
    if (attributesWithValues.length === 0) return [];

    if (attributesWithValues.length === 1) {
      return attributesWithValues[0].values.map((v: { _id: Types.ObjectId; value: string }) => [
        {
          attributeId: attributesWithValues[0].attributeId,
          valueId: String(v._id),
          name: attributesWithValues[0].name,
          value: v.value,
        },
      ]);
    }

    const [first, ...rest] = attributesWithValues;
    const restCombinations = this.generateCombinations(rest);

    const result: Array<
      Array<{ attributeId: string; valueId: string; name: string; value: string }>
    > = [];

    for (const value of first.values) {
      for (const combo of restCombinations) {
        result.push([
          {
            attributeId: first.attributeId,
            valueId: String(value._id),
            name: first.name,
            value: value.value,
          },
          ...combo,
        ]);
      }
    }

    return result;
  }
}
