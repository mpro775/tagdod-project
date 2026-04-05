import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';

import { AppModule } from '../src/app.module';
import { normalizeYemeniPhone } from '../src/shared/utils/phone.util';
import {
  CapabilityStatus,
  User,
  UserRole,
  UserStatus,
} from '../src/modules/users/schemas/user.schema';
import {
  Coupon,
  CouponStatus,
  CouponType,
  CouponVisibility,
  DiscountAppliesTo,
} from '../src/modules/marketing/schemas/coupon.schema';

const DEFAULT_ENGINEER_COUPON_TAG = 'AUTO_ENGINEER_DEFAULT_COUPON';
const DEFAULT_ENGINEER_COUPON_NAME = 'الكوبون الافتراضي للمهندس';
const DEFAULT_ENGINEER_COUPON_MARKETING_DESCRIPTION =
  'قم بمشاركة الكوبون مع عملائك واحصل على خصم لهم وعمولة  لك على كل طلب مكتمل.';
const DEFAULT_ENGINEER_COUPON_DISCOUNT_PERCENT = 5;
const DEFAULT_ENGINEER_COUPON_COMMISSION_PERCENT = 5;

type LeanEngineerUser = {
  _id: Types.ObjectId;
  phone?: string;
  firstName?: string;
  lastName?: string;
};

interface GenerationStats {
  totalEngineers: number;
  created: number;
  updated: number;
  skippedInvalidPhone: number;
  conflicts: number;
  errors: number;
}

function buildDefaultEngineerCouponCodeFromPhone(phone?: string): string | null {
  if (!phone) {
    return null;
  }

  try {
    return normalizeYemeniPhone(phone).replace(/^\+967/, '');
  } catch {
    return null;
  }
}

async function generateEngineerCoupons() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const stats: GenerationStats = {
    totalEngineers: 0,
    created: 0,
    updated: 0,
    skippedInvalidPhone: 0,
    conflicts: 0,
    errors: 0,
  };

  try {
    const userModel = app.get<Model<User>>(getModelToken(User.name));
    const couponModel = app.get<Model<Coupon>>(getModelToken(Coupon.name));

    const engineerQuery: FilterQuery<User> = {
      engineer_capable: true,
      engineer_status: CapabilityStatus.APPROVED,
      roles: { $in: [UserRole.ENGINEER] },
      deletedAt: null,
      status: { $ne: UserStatus.DELETED },
    };

    const engineers = await userModel
      .find(engineerQuery)
      .select('_id phone firstName lastName')
      .lean<LeanEngineerUser[]>();

    stats.totalEngineers = engineers.length;

    console.log('🎟️ بدء توليد الكوبونات الافتراضية للمهندسين الموثقين...');
    console.log(`📌 عدد المهندسين المطابقين للشروط: ${stats.totalEngineers}`);

    if (engineers.length === 0) {
      console.log('✅ لا يوجد مهندسون مطابقون للشروط.');
      return;
    }

    for (const engineer of engineers) {
      const engineerId = engineer._id.toString();
      const couponCode = buildDefaultEngineerCouponCodeFromPhone(engineer.phone);

      if (!couponCode) {
        stats.skippedInvalidPhone += 1;
        console.log(`⏭️ تم التخطي: ${engineerId} رقم الهاتف غير صالح`);
        continue;
      }

      try {
        const existingDefaultCoupon = await couponModel
          .findOne({
            engineerId: new Types.ObjectId(engineerId),
            deletedAt: null,
            $or: [
              { description: { $regex: `^${DEFAULT_ENGINEER_COUPON_TAG}` } },
              { name: DEFAULT_ENGINEER_COUPON_NAME },
            ],
          })
          .select('_id code validFrom')
          .lean<{ _id: Types.ObjectId; code: string; validFrom?: Date } | null>();

        const couponWithTargetCode = await couponModel
          .findOne({
            code: couponCode,
            deletedAt: null,
          })
          .select('_id engineerId')
          .lean<{ _id: Types.ObjectId; engineerId?: Types.ObjectId | null } | null>();

        if (
          couponWithTargetCode &&
          couponWithTargetCode.engineerId &&
          String(couponWithTargetCode.engineerId) !== engineerId
        ) {
          stats.conflicts += 1;
          console.log(
            `⚠️ تعارض: ${engineerId} لا يمكن تحديثه لأن الكود ${couponCode} مستخدم لمهندس آخر`,
          );
          continue;
        }

        const targetCouponId =
          existingDefaultCoupon?._id ||
          (couponWithTargetCode && String(couponWithTargetCode.engineerId) === engineerId
            ? couponWithTargetCode._id
            : null);

        const now = new Date();

        const upsertPayload = {
          code: couponCode,
          name: DEFAULT_ENGINEER_COUPON_NAME,
          description: DEFAULT_ENGINEER_COUPON_MARKETING_DESCRIPTION,
          type: CouponType.PERCENTAGE,
          status: CouponStatus.ACTIVE,
          visibility: CouponVisibility.PUBLIC,
          discountValue: DEFAULT_ENGINEER_COUPON_DISCOUNT_PERCENT,
          commissionRate: DEFAULT_ENGINEER_COUPON_COMMISSION_PERCENT,
          engineerId: new Types.ObjectId(engineerId),
          usageLimit: null,
          usageLimitPerUser: null,
          validUntil: null,
          appliesTo: DiscountAppliesTo.ALL_PRODUCTS,
        };

        if (targetCouponId) {
          await couponModel.updateOne(
            { _id: targetCouponId },
            {
              $set: {
                ...upsertPayload,
                validFrom: existingDefaultCoupon?.validFrom || now,
              },
            },
          );
          stats.updated += 1;
          console.log(`♻️ تم التحديث: ${engineerId} -> ${couponCode}`);
          continue;
        }

        await couponModel.create({
          ...upsertPayload,
          validFrom: now,
          usedCount: 0,
          totalRedemptions: 0,
          totalDiscountGiven: 0,
          totalRevenue: 0,
          totalCommissionEarned: 0,
          usageHistory: [],
        });

        stats.created += 1;
        console.log(`✅ تم الإنشاء: ${engineerId} -> ${couponCode}`);
      } catch (error) {
        stats.errors += 1;
        console.error(`❌ فشل إنشاء كوبون للمهندس ${engineerId}:`, error);
      }
    }

    console.log('\n📊 التقرير النهائي');
    console.log(`- إجمالي المهندسين الموثقين: ${stats.totalEngineers}`);
    console.log(`- تم إنشاء كوبونات: ${stats.created}`);
    console.log(`- تم تحديث كوبونات: ${stats.updated}`);
    console.log(`- تم التخطي (هاتف غير صالح): ${stats.skippedInvalidPhone}`);
    console.log(`- تعارضات كود الكوبون: ${stats.conflicts}`);
    console.log(`- أخطاء: ${stats.errors}`);
  } catch (error) {
    console.error('❌ حدث خطأ أثناء تشغيل السكربت:', error);
    process.exitCode = 1;
  } finally {
    await app.close();
  }
}

if (require.main === module) {
  generateEngineerCoupons();
}

export { generateEngineerCoupons };
