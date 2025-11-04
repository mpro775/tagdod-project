import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Policy, PolicyDocument, PolicyType } from './schemas/policy.schema';
import { CreatePolicyDto, UpdatePolicyDto, PolicyResponseDto } from './dto/policy.dto';

@Injectable()
export class PoliciesService {
  constructor(
    @InjectModel(Policy.name)
    private policyModel: Model<PolicyDocument>,
  ) {}

  /**
   * إنشاء سياسة جديدة
   */
  async createPolicy(dto: CreatePolicyDto, userId: string): Promise<PolicyResponseDto> {
    // التحقق من عدم وجود سياسة من نفس النوع
    const existingPolicy = await this.policyModel.findOne({ type: dto.type });
    if (existingPolicy) {
      throw new NotFoundException(`سياسة من نوع ${dto.type} موجودة بالفعل. استخدم التحديث بدلاً من الإنشاء.`);
    }

    const policy = new this.policyModel({
      ...dto,
      lastUpdatedBy: userId,
      isActive: dto.isActive ?? true,
    });

    const savedPolicy = await policy.save();
    return this.mapToDto(savedPolicy.toObject());
  }

  /**
   * جلب جميع السياسات
   */
  async getAllPolicies(): Promise<PolicyResponseDto[]> {
    const policies = await this.policyModel.find().sort({ type: 1 }).lean().exec();
    return policies.map((p) => this.mapToDto(p));
  }

  /**
   * تحويل Policy إلى DTO
   */
  private mapToDto(policy: Policy & { _id: unknown; createdAt?: Date; updatedAt?: Date }): PolicyResponseDto {
    return {
      _id: String(policy._id),
      type: policy.type,
      titleAr: policy.titleAr,
      titleEn: policy.titleEn,
      contentAr: policy.contentAr,
      contentEn: policy.contentEn,
      isActive: policy.isActive,
      lastUpdatedBy: policy.lastUpdatedBy,
      createdAt: policy.createdAt || new Date(),
      updatedAt: policy.updatedAt || new Date(),
    };
  }

  /**
   * جلب سياسة حسب النوع
   */
  async getPolicyByType(type: PolicyType): Promise<PolicyResponseDto> {
    const policy = await this.policyModel.findOne({ type, isActive: true }).lean().exec();
    if (!policy) {
      throw new NotFoundException(`لا توجد سياسة نشطة من نوع ${type}`);
    }
    return this.mapToDto(policy);
  }

  /**
   * جلب سياسة حسب النوع (للأدمن - بدون فحص isActive)
   */
  async getPolicyByTypeForAdmin(type: PolicyType): Promise<PolicyResponseDto> {
    const policy = await this.policyModel.findOne({ type }).lean().exec();
    if (!policy) {
      throw new NotFoundException(`لا توجد سياسة من نوع ${type}`);
    }
    return this.mapToDto(policy);
  }

  /**
   * تحديث سياسة
   */
  async updatePolicy(type: PolicyType, dto: UpdatePolicyDto, userId: string): Promise<PolicyResponseDto> {
    const policy = await this.policyModel.findOne({ type }).exec();
    if (!policy) {
      throw new NotFoundException(`لا توجد سياسة من نوع ${type}`);
    }

    // تحديث الحقول المحددة فقط
    Object.assign(policy, {
      ...dto,
      lastUpdatedBy: userId,
    });

    const savedPolicy = await policy.save();
    return this.mapToDto(savedPolicy.toObject());
  }

  /**
   * تفعيل/تعطيل سياسة
   */
  async togglePolicy(type: PolicyType, isActive: boolean, userId: string): Promise<PolicyResponseDto> {
    const policy = await this.policyModel.findOne({ type }).exec();
    if (!policy) {
      throw new NotFoundException(`لا توجد سياسة من نوع ${type}`);
    }

    policy.isActive = isActive;
    policy.lastUpdatedBy = userId;

    const savedPolicy = await policy.save();
    return this.mapToDto(savedPolicy.toObject());
  }

  /**
   * حذف سياسة (Soft Delete - اختياري)
   */
  async deletePolicy(type: PolicyType): Promise<void> {
    const result = await this.policyModel.deleteOne({ type }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`لا توجد سياسة من نوع ${type}`);
    }
  }
}
