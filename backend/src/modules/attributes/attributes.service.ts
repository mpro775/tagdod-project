import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Attribute, AttributeType } from './schemas/attribute.schema';
import { AttributeValue } from './schemas/attribute-value.schema';
import { AttributeGroup } from './schemas/attribute-group.schema';
import { Product, ProductStatus } from '../products/schemas/product.schema';
import { Variant } from '../products/schemas/variant.schema';
import { slugify } from '../../shared/utils/slug.util';
import { 
  AttributeNotFoundException,
  AttributeAlreadyExistsException,
  AttributeInUseException,
  AttributeValueNotFoundException,
  AttributeValueAlreadyExistsException,
  AttributeValueInUseException,
  AttributeValueInvalidHexException,
  AttributeValueHexRequiredException,
  AttributeException,
  ErrorCode 
} from '../../shared/exceptions';

const HEX_COLOR_REGEX = /^#(?:[0-9A-F]{6})$/i;

@Injectable()
export class AttributesService {
  constructor(
    @InjectModel(Attribute.name) private attributeModel: Model<Attribute>,
    @InjectModel(AttributeValue.name) private valueModel: Model<AttributeValue>,
    @InjectModel(AttributeGroup.name) private groupModel: Model<AttributeGroup>,
    @InjectModel(Product.name) private productModel: Model<Product>,
    @InjectModel(Variant.name) private variantModel: Model<Variant>,
  ) {}

  // ==================== Attributes ====================

  async createAttribute(dto: Partial<Attribute>) {
    try {
      const slug = slugify(dto.nameEn!);

      // التحقق من عدم التكرار
      const existing = await this.attributeModel.findOne({ slug, deletedAt: null });
      if (existing) {
        throw new AttributeAlreadyExistsException({ slug, attributeId: existing._id.toString() });
      }

      const attribute = await this.attributeModel.create({
        ...dto,
        slug,
        usageCount: 0,
      });

      return attribute;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      // إعادة رمي الخطأ إذا كان من نوع AttributeException
      if (error instanceof AttributeException) {
        throw error;
      }

      // معالجة أخطاء MongoDB
      if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
        const mongoError = error as { keyPattern?: Record<string, unknown> };
        const field = Object.keys(mongoError.keyPattern || {})[0] || 'field';
        throw new AttributeException(ErrorCode.ATTRIBUTE_INVALID_DATA, {
          reason: 'duplicate_field',
          field,
          message: `${field} موجود مسبقاً`,
        });
      }

      throw new AttributeException(ErrorCode.ATTRIBUTE_CREATE_FAILED, {
        name: dto.name,
        nameEn: dto.nameEn,
        error: err.message,
      });
    }
  }

  async updateAttribute(id: string, patch: Partial<Attribute>) {
    try {
      const attribute = await this.attributeModel.findById(id);
      
      if (!attribute) {
        throw new AttributeNotFoundException({ attributeId: id });
      }

      if (attribute.deletedAt) {
        throw new AttributeNotFoundException({ attributeId: id, reason: 'deleted' });
      }

      if (patch.nameEn) {
        const slug = slugify(patch.nameEn);
        patch.slug = slug;
      }

      await this.attributeModel.updateOne({ _id: id }, { $set: patch });
      return this.attributeModel.findById(id);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      // إعادة رمي الخطأ إذا كان من نوع AttributeException
      if (error instanceof AttributeException || error instanceof AttributeNotFoundException) {
        throw error;
      }

      throw new AttributeException(ErrorCode.ATTRIBUTE_UPDATE_FAILED, {
        attributeId: id,
        error: err.message,
      });
    }
  }

  async getAttribute(id: string) {
    const attribute = await this.attributeModel.findById(id)
      .populate('groupId')
      .lean();

    if (!attribute) {
      throw new AttributeNotFoundException({ attributeId: id });
    }

    // جلب القيم (تأكد من مطابقة ObjectId)
    const values = await this.valueModel
      .find({ attributeId: new Types.ObjectId(id), deletedAt: null })
      .sort({ order: 1, value: 1 })
      .lean();

    return {
      ...attribute,
      values,
    };
  }

  async getAttributesWithValues(attributeIds: string[]): Promise<Array<Attribute & { values: AttributeValue[] }>> {
    if (!Array.isArray(attributeIds) || attributeIds.length === 0) {
      return [];
    }

    const normalizedIds = Array.from(
      new Set(
        attributeIds
          .map((id) => (typeof id === 'string' ? id : String(id)))
          .filter((id): id is string => Boolean(id)),
      ),
    );

    if (normalizedIds.length === 0) {
      return [];
    }

    const objectIds = normalizedIds
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id));

    const attributes = await this.attributeModel
      .find({
        _id: {
          $in: [...normalizedIds, ...objectIds],
        },
      })
      .populate('groupId')
      .lean();

    if (attributes.length === 0) {
      return [];
    }

    const attributeObjectIds = attributes
      .map((attr) => attr._id)
      .filter((id): id is Types.ObjectId => Types.ObjectId.isValid(String(id)))
      .map((id) => new Types.ObjectId(String(id)));

    const values = await this.valueModel
      .find({
        attributeId: { $in: attributeObjectIds },
        deletedAt: null,
      })
      .sort({ order: 1, value: 1 })
      .lean();

    const valuesByAttribute = new Map<string, AttributeValue[]>();
    values.forEach((value) => {
      const key = String(value.attributeId);
      if (!valuesByAttribute.has(key)) {
        valuesByAttribute.set(key, []);
      }
      valuesByAttribute.get(key)!.push(value);
    });

    return attributes.map((attribute) => {
      const key = String(attribute._id);
      return {
        ...(attribute as Attribute),
        values: valuesByAttribute.get(key) ?? [],
      };
    });
  }

  async listAttributes(query: { 
    search?: string; 
    isActive?: boolean; 
    isFilterable?: boolean;
    groupId?: string;
    includeDeleted?: boolean;
  } = {}) {
    const { search, isActive, isFilterable, groupId, includeDeleted = false } = query;

    const q: Record<string, unknown> = {};

    if (!includeDeleted) {
      q.deletedAt = null;
    }

    if (search) {
      q.$or = [
        { name: { $regex: search, $options: 'i' } },
        { nameEn: { $regex: search, $options: 'i' } },
      ];
    }

    if (isActive !== undefined) {
      q.isActive = isActive;
    }

    if (isFilterable !== undefined) {
      q.isFilterable = isFilterable;
    }

    if (groupId) {
      q.groupId = groupId;
    }

    return this.attributeModel
      .find(q)
      .populate('groupId')
      .sort({ order: 1, name: 1 })
      .lean();
  }

  async deleteAttribute(id: string, userId: string) {
    try {
      const attribute = await this.attributeModel.findById(id);

      if (!attribute) {
        throw new AttributeNotFoundException({ attributeId: id });
      }

      // فحص الاستخدام
      if (attribute.usageCount > 0) {
        throw new AttributeInUseException({ 
          attributeId: id,
          usageCount: attribute.usageCount 
        });
      }

      attribute.deletedAt = new Date();
      attribute.deletedBy = userId;
      await attribute.save();

      return attribute;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      // إعادة رمي الخطأ إذا كان من نوع AttributeException
      if (error instanceof AttributeException || error instanceof AttributeNotFoundException || error instanceof AttributeInUseException) {
        throw error;
      }

      throw new AttributeException(ErrorCode.ATTRIBUTE_DELETE_FAILED, {
        attributeId: id,
        error: err.message,
      });
    }
  }

  async restoreAttribute(id: string) {
    const attribute = await this.attributeModel.findById(id);

    if (!attribute || !attribute.deletedAt) {
      throw new AttributeException(ErrorCode.ATTRIBUTE_INVALID_DATA, { attributeId: id, reason: 'not_deleted' });
    }

    attribute.deletedAt = null;
    attribute.deletedBy = undefined;
    await attribute.save();

    return attribute;
  }

  // ==================== Attribute Values ====================

  async createValue(attributeId: string, dto: Partial<AttributeValue>) {
    try {
      const attribute = await this.attributeModel.findById(attributeId);

      if (!attribute) {
        throw new AttributeNotFoundException({ attributeId });
      }

      if (dto.hexCode !== undefined) {
        const normalizedHex = dto.hexCode.trim();
        dto.hexCode = normalizedHex ? normalizedHex.toUpperCase() : undefined;
      }

      if (attribute.type === AttributeType.COLOR) {
        if (!dto.hexCode) {
          throw new AttributeValueHexRequiredException({ attributeId, attributeType: attribute.type });
        }

        if (!HEX_COLOR_REGEX.test(dto.hexCode)) {
          throw new AttributeValueInvalidHexException({ attributeId, hexCode: dto.hexCode });
        }
      } else if (dto.hexCode && !HEX_COLOR_REGEX.test(dto.hexCode)) {
        throw new AttributeValueInvalidHexException({ attributeId, hexCode: dto.hexCode });
      }

      const slug = slugify(dto.value!);

      // التحقق من عدم التكرار
      const existing = await this.valueModel.findOne({ 
        attributeId, 
        slug, 
        deletedAt: null 
      });

      if (existing) {
        throw new AttributeValueAlreadyExistsException({ attributeId, value: dto.value, valueId: existing._id.toString() });
      }

      const value = await this.valueModel.create({
        ...dto,
        attributeId: new Types.ObjectId(attributeId),
        slug,
        usageCount: 0,
      });

      return value;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      // إعادة رمي الخطأ إذا كان من نوع AttributeException
      if (error instanceof AttributeException) {
        throw error;
      }

      // معالجة أخطاء MongoDB
      if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
        const mongoError = error as { keyPattern?: Record<string, unknown> };
        const field = Object.keys(mongoError.keyPattern || {})[0] || 'field';
        throw new AttributeException(ErrorCode.ATTRIBUTE_INVALID_DATA, {
          reason: 'duplicate_field',
          field,
          message: `${field} موجود مسبقاً`,
        });
      }

      throw new AttributeException(ErrorCode.ATTRIBUTE_INVALID_DATA, {
        attributeId,
        value: dto.value,
        error: err.message,
      });
    }
  }

  async updateValue(id: string, patch: Partial<AttributeValue>) {
    try {
      const value = await this.valueModel.findById(id);

      if (!value) {
        throw new AttributeValueNotFoundException({ valueId: id });
      }

      if (patch.hexCode !== undefined) {
        const normalizedHex = patch.hexCode.trim();
        patch.hexCode = normalizedHex ? normalizedHex.toUpperCase() : undefined;
      }

      const attribute = await this.attributeModel.findById(value.attributeId);

      if (!attribute) {
        throw new AttributeNotFoundException({ attributeId: value.attributeId });
      }

      if (attribute.type === AttributeType.COLOR) {
        const nextHex = patch.hexCode ?? value.hexCode;

        if (!nextHex) {
          throw new AttributeValueHexRequiredException({ attributeId: value.attributeId, attributeType: attribute.type });
        }

        if (!HEX_COLOR_REGEX.test(nextHex)) {
          throw new AttributeValueInvalidHexException({ attributeId: value.attributeId, hexCode: nextHex });
        }

        if (patch.hexCode) {
          patch.hexCode = patch.hexCode.toUpperCase();
        }
      } else if (patch.hexCode && !HEX_COLOR_REGEX.test(patch.hexCode)) {
        throw new AttributeValueInvalidHexException({ attributeId: value.attributeId, hexCode: patch.hexCode });
      }

      if (patch.value) {
        patch.slug = slugify(patch.value);
      }

      await this.valueModel.updateOne({ _id: id }, { $set: patch });
      return this.valueModel.findById(id);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      // إعادة رمي الخطأ إذا كان من نوع AttributeException
      if (error instanceof AttributeException) {
        throw error;
      }

      throw new AttributeException(ErrorCode.ATTRIBUTE_INVALID_DATA, {
        valueId: id,
        error: err.message,
      });
    }
  }

  async deleteValue(id: string, userId: string) {
    try {
      const value = await this.valueModel.findById(id);

      if (!value) {
        throw new AttributeValueNotFoundException({ valueId: id });
      }

      if (value.usageCount > 0) {
        throw new AttributeValueInUseException({ 
          valueId: id,
          usageCount: value.usageCount 
        });
      }

      value.deletedAt = new Date();
      value.deletedBy = userId;
      await value.save();

      return value;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      
      // إعادة رمي الخطأ إذا كان من نوع AttributeException
      if (error instanceof AttributeException) {
        throw error;
      }

      throw new AttributeException(ErrorCode.ATTRIBUTE_INVALID_DATA, {
        valueId: id,
        error: err.message,
      });
    }
  }

  async listValues(attributeId: string) {
    return this.valueModel
      .find({ attributeId: new Types.ObjectId(attributeId), deletedAt: null })
      .sort({ order: 1, value: 1 })
      .lean();
  }

  async listProductsByAttribute(
    attributeId: string,
    options: { page?: number; limit?: number; search?: string } = {},
  ): Promise<{
    items: Array<
      Product & {
        matchedVariantsCount: number;
      }
    >;
    meta: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }> {
    if (!Types.ObjectId.isValid(attributeId)) {
      return {
        items: [],
        meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
      };
    }

    const pageRaw = Number(options.page ?? 1);
    const page = Math.max(1, Number.isFinite(pageRaw) ? pageRaw : 1);
    const limitRaw = Number(options.limit ?? 20);
    const limit = Math.min(Math.max(1, limitRaw), 100);
    const skip = (page - 1) * limit;
    const search = options.search?.trim();

    const attributeObjectId = new Types.ObjectId(attributeId);

    const variants = await this.variantModel
      .find({
        $and: [
          {
            $or: [
              { 'attributeValues.attributeId': attributeObjectId },
              { 'attributeValues.attributeId': attributeId }, // in case stored as string
            ],
          },
          {
            $or: [
              { deletedAt: null },
              { deletedAt: { $exists: false } }, // tolerate missing field
            ],
          },
        ],
      })
      .select('productId')
      .lean();

    const productIds = Array.from(new Set(variants.map((v) => String(v.productId)).filter(Boolean)));

    if (productIds.length === 0) {
      return {
        items: [],
        meta: { total: 0, page, limit, totalPages: 0 },
      };
    }

    const productObjectIds = productIds
      .filter((id) => Types.ObjectId.isValid(id))
      .map((id) => new Types.ObjectId(id));

    const productFilter: Record<string, unknown> = {
      _id: { $in: productObjectIds },
      status: ProductStatus.ACTIVE,
      isActive: true,
      $or: [{ deletedAt: null }, { deletedAt: { $exists: false } }],
    };

    if (search) {
      productFilter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { nameEn: { $regex: search, $options: 'i' } },
        { slug: { $regex: search, $options: 'i' } },
      ];
    }

    const total = await this.productModel.countDocuments(productFilter);

    if (total === 0) {
      return {
        items: [],
        meta: { total: 0, page, limit, totalPages: 0 },
      };
    }

    const productVariantsCount = variants.reduce<Record<string, number>>((acc, variant) => {
      const pid = String(variant.productId);
      acc[pid] = (acc[pid] || 0) + 1;
      return acc;
    }, {});

    const products = await this.productModel
      .find(productFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select([
        'name',
        'nameEn',
        'slug',
        'mainImageId',
        'imageIds',
        'status',
        'isActive',
        'variantsCount',
        'basePriceUSD',
        'compareAtPriceUSD',
        'createdAt',
        'updatedAt',
      ])
      .lean();

    const items = products.map((product) => ({
      ...product,
      matchedVariantsCount: productVariantsCount[String(product._id)] || 0,
    })) as Array<Product & { matchedVariantsCount: number }>;

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ==================== Helpers ====================

  async incrementUsage(attributeId: string, valueId: string) {
    await this.attributeModel.updateOne(
      { _id: attributeId },
      { $inc: { usageCount: 1 } }
    );

    await this.valueModel.updateOne(
      { _id: valueId },
      { $inc: { usageCount: 1 } }
    );
  }

  async decrementUsage(attributeId: string, valueId: string) {
    await this.attributeModel.updateOne(
      { _id: attributeId },
      { $inc: { usageCount: -1 } }
    );

    await this.valueModel.updateOne(
      { _id: valueId },
      { $inc: { usageCount: -1 } }
    );
  }

  async getStats() {
    const [total, active, filterable, byType] = await Promise.all([
      this.attributeModel.countDocuments({ deletedAt: null }),
      this.attributeModel.countDocuments({ deletedAt: null, isActive: true }),
      this.attributeModel.countDocuments({ deletedAt: null, isFilterable: true }),
      this.attributeModel.aggregate([
        { $match: { deletedAt: null } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
    ]);

    const typeStats: Record<string, number> = {};
    byType.forEach((item: { _id: string; count: number }) => {
      typeStats[item._id] = item.count;
    });

    Object.values(AttributeType).forEach((type) => {
      if (!typeStats[type]) {
        typeStats[type] = 0;
      }
    });

    return {
      data: {
        total,
        active,
        filterable,
        byType: typeStats,
      },
    };
  }
}

