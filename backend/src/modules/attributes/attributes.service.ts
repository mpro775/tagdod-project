import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Attribute, AttributeType } from './schemas/attribute.schema';
import { AttributeValue } from './schemas/attribute-value.schema';
import { AttributeGroup } from './schemas/attribute-group.schema';
import { slugify } from '../../shared/utils/slug.util';
import { 
  DomainException,
  ErrorCode 
} from '../../shared/exceptions';

const HEX_COLOR_REGEX = /^#(?:[0-9A-F]{6})$/i;

@Injectable()
export class AttributesService {
  constructor(
    @InjectModel(Attribute.name) private attributeModel: Model<Attribute>,
    @InjectModel(AttributeValue.name) private valueModel: Model<AttributeValue>,
    @InjectModel(AttributeGroup.name) private groupModel: Model<AttributeGroup>,
  ) {}

  // ==================== Attributes ====================

  async createAttribute(dto: Partial<Attribute>) {
    const slug = slugify(dto.nameEn!);

    // التحقق من عدم التكرار
    const existing = await this.attributeModel.findOne({ slug, deletedAt: null });
    if (existing) {
      throw new DomainException(ErrorCode.VALIDATION_ERROR, { field: 'attribute', reason: 'already_exists' });
    }

    const attribute = await this.attributeModel.create({
      ...dto,
      slug,
      usageCount: 0,
    });

    return attribute;
  }

  async updateAttribute(id: string, patch: Partial<Attribute>) {
    const attribute = await this.attributeModel.findById(id);
    
    if (!attribute) {
      throw new DomainException(ErrorCode.VALIDATION_ERROR, { attributeId: id, reason: 'not_found' });
    }

    if (attribute.deletedAt) {
      throw new DomainException(ErrorCode.VALIDATION_ERROR, { attributeId: id, reason: 'deleted' });
    }

    if (patch.nameEn) {
      const slug = slugify(patch.nameEn);
      patch.slug = slug;
    }

    await this.attributeModel.updateOne({ _id: id }, { $set: patch });
    return this.attributeModel.findById(id);
  }

  async getAttribute(id: string) {
    const attribute = await this.attributeModel.findById(id)
      .populate('groupId')
      .lean();

    if (!attribute) {
      throw new DomainException(ErrorCode.VALIDATION_ERROR, { attributeId: id, reason: 'not_found' });
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
    const attribute = await this.attributeModel.findById(id);

    if (!attribute) {
      throw new DomainException(ErrorCode.VALIDATION_ERROR, { attributeId: id, reason: 'not_found' });
    }

    // فحص الاستخدام
    if (attribute.usageCount > 0) {
      throw new DomainException(ErrorCode.VALIDATION_ERROR, { 
        attributeId: id,
        reason: 'in_use', 
        usageCount: attribute.usageCount 
      });
    }

    attribute.deletedAt = new Date();
    attribute.deletedBy = userId;
    await attribute.save();

    return attribute;
  }

  async restoreAttribute(id: string) {
    const attribute = await this.attributeModel.findById(id);

    if (!attribute || !attribute.deletedAt) {
      throw new DomainException(ErrorCode.VALIDATION_ERROR, { attributeId: id, reason: 'not_deleted' });
    }

    attribute.deletedAt = null;
    attribute.deletedBy = undefined;
    await attribute.save();

    return attribute;
  }

  // ==================== Attribute Values ====================

  async createValue(attributeId: string, dto: Partial<AttributeValue>) {
    const attribute = await this.attributeModel.findById(attributeId);

    if (!attribute) {
      throw new DomainException(ErrorCode.VALIDATION_ERROR, { attributeId, reason: 'not_found' });
    }

    if (dto.hexCode !== undefined) {
      const normalizedHex = dto.hexCode.trim();
      dto.hexCode = normalizedHex ? normalizedHex.toUpperCase() : undefined;
    }

    if (attribute.type === AttributeType.COLOR) {
      if (!dto.hexCode) {
        throw new DomainException(ErrorCode.VALIDATION_ERROR, { field: 'hexCode', reason: 'required_for_color' });
      }

      if (!HEX_COLOR_REGEX.test(dto.hexCode)) {
        throw new DomainException(ErrorCode.VALIDATION_ERROR, { field: 'hexCode', reason: 'invalid_hex' });
      }
    } else if (dto.hexCode && !HEX_COLOR_REGEX.test(dto.hexCode)) {
      throw new DomainException(ErrorCode.VALIDATION_ERROR, { field: 'hexCode', reason: 'invalid_hex' });
    }

    const slug = slugify(dto.value!);

    // التحقق من عدم التكرار
    const existing = await this.valueModel.findOne({ 
      attributeId, 
      slug, 
      deletedAt: null 
    });

    if (existing) {
      throw new DomainException(ErrorCode.VALIDATION_ERROR, { value: dto.value, reason: 'already_exists' });
    }

    const value = await this.valueModel.create({
      ...dto,
      attributeId: new Types.ObjectId(attributeId),
      slug,
      usageCount: 0,
    });

    return value;
  }

  async updateValue(id: string, patch: Partial<AttributeValue>) {
    const value = await this.valueModel.findById(id);

    if (!value) {
      throw new DomainException(ErrorCode.VALIDATION_ERROR, { valueId: id, reason: 'not_found' });
    }

    if (patch.hexCode !== undefined) {
      const normalizedHex = patch.hexCode.trim();
      patch.hexCode = normalizedHex ? normalizedHex.toUpperCase() : undefined;
    }

    const attribute = await this.attributeModel.findById(value.attributeId);

    if (!attribute) {
      throw new DomainException(ErrorCode.VALIDATION_ERROR, { attributeId: value.attributeId, reason: 'not_found' });
    }

    if (attribute.type === AttributeType.COLOR) {
      const nextHex = patch.hexCode ?? value.hexCode;

      if (!nextHex) {
        throw new DomainException(ErrorCode.VALIDATION_ERROR, { field: 'hexCode', reason: 'required_for_color' });
      }

      if (!HEX_COLOR_REGEX.test(nextHex)) {
        throw new DomainException(ErrorCode.VALIDATION_ERROR, { field: 'hexCode', reason: 'invalid_hex' });
      }

      if (patch.hexCode) {
        patch.hexCode = patch.hexCode.toUpperCase();
      }
    } else if (patch.hexCode && !HEX_COLOR_REGEX.test(patch.hexCode)) {
      throw new DomainException(ErrorCode.VALIDATION_ERROR, { field: 'hexCode', reason: 'invalid_hex' });
    }

    if (patch.value) {
      patch.slug = slugify(patch.value);
    }

    await this.valueModel.updateOne({ _id: id }, { $set: patch });
    return this.valueModel.findById(id);
  }

  async deleteValue(id: string, userId: string) {
    const value = await this.valueModel.findById(id);

    if (!value) {
      throw new DomainException(ErrorCode.VALIDATION_ERROR, { valueId: id, reason: 'not_found' });
    }

    if (value.usageCount > 0) {
      throw new DomainException(ErrorCode.VALIDATION_ERROR, { 
        valueId: id,
        reason: 'in_use', 
        usageCount: value.usageCount 
      });
    }

    value.deletedAt = new Date();
    value.deletedBy = userId;
    await value.save();

    return value;
  }

  async listValues(attributeId: string) {
    return this.valueModel
      .find({ attributeId: new Types.ObjectId(attributeId), deletedAt: null })
      .sort({ order: 1, value: 1 })
      .lean();
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

