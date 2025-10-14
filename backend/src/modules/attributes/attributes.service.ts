import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Attribute } from './schemas/attribute.schema';
import { AttributeValue } from './schemas/attribute-value.schema';
import { AttributeGroup } from './schemas/attribute-group.schema';
import { slugify } from '../../shared/utils/slug.util';
import { AppException } from '../../shared/exceptions/app.exception';

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
      throw new AppException('ATTRIBUTE_EXISTS', 'السمة موجودة بالفعل', null, 400);
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
      throw new AppException('ATTRIBUTE_NOT_FOUND', 'السمة غير موجودة', null, 404);
    }

    if (attribute.deletedAt) {
      throw new AppException('ATTRIBUTE_DELETED', 'السمة محذوفة', null, 400);
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
      throw new AppException('ATTRIBUTE_NOT_FOUND', 'السمة غير موجودة', null, 404);
    }

    // جلب القيم
    const values = await this.valueModel
      .find({ attributeId: id, deletedAt: null })
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

    const q: any = {};

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
      throw new AppException('ATTRIBUTE_NOT_FOUND', 'السمة غير موجودة', null, 404);
    }

    // فحص الاستخدام
    if (attribute.usageCount > 0) {
      throw new AppException(
        'ATTRIBUTE_IN_USE',
        'لا يمكن حذف سمة مستخدمة في منتجات',
        { usageCount: attribute.usageCount },
        400
      );
    }

    attribute.deletedAt = new Date();
    attribute.deletedBy = userId;
    await attribute.save();

    return attribute;
  }

  async restoreAttribute(id: string) {
    const attribute = await this.attributeModel.findById(id);

    if (!attribute || !attribute.deletedAt) {
      throw new AppException('ATTRIBUTE_NOT_DELETED', 'السمة غير محذوفة', null, 400);
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
      throw new AppException('ATTRIBUTE_NOT_FOUND', 'السمة غير موجودة', null, 404);
    }

    const slug = slugify(dto.value!);

    // التحقق من عدم التكرار
    const existing = await this.valueModel.findOne({ 
      attributeId, 
      slug, 
      deletedAt: null 
    });

    if (existing) {
      throw new AppException('VALUE_EXISTS', 'القيمة موجودة بالفعل', null, 400);
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
      throw new AppException('VALUE_NOT_FOUND', 'القيمة غير موجودة', null, 404);
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
      throw new AppException('VALUE_NOT_FOUND', 'القيمة غير موجودة', null, 404);
    }

    if (value.usageCount > 0) {
      throw new AppException(
        'VALUE_IN_USE',
        'لا يمكن حذف قيمة مستخدمة في variants',
        { usageCount: value.usageCount },
        400
      );
    }

    value.deletedAt = new Date();
    value.deletedBy = userId;
    await value.save();

    return value;
  }

  async listValues(attributeId: string) {
    return this.valueModel
      .find({ attributeId, deletedAt: null })
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

    const typeStats: any = {};
    byType.forEach((item: any) => {
      typeStats[item._id] = item.count;
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

