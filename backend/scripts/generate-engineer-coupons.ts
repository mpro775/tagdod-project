import { NestFactory } from '@nestjs/core';
import { getModelToken } from '@nestjs/mongoose';
import { FilterQuery, Model, Types } from 'mongoose';

import { AppModule } from '../src/app.module';
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
const DEFAULT_ENGINEER_COUPON_DISCOUNT_PERCENT = 5;
const DEFAULT_ENGINEER_COUPON_COMMISSION_PERCENT = 5;
const COUPON_PREFIX = 'ENG5';

type LeanEngineerUser = {
  _id: Types.ObjectId;
  phone?: string;
  firstName?: string;
  lastName?: string;
};

interface GenerationStats {
  totalEngineers: number;
  created: number;
  skippedAlreadyHasDefault: number;
  errors: number;
}

async function generateUniqueDefaultEngineerCouponCode(
  couponModel: Model<Coupon>,
): Promise<string> {
  const maxAttempts = 10;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
    const code = `${COUPON_PREFIX}-${randomPart}`;
    const exists = await couponModel.exists({ code, deletedAt: null });
    if (!exists) {
      return code;
    }
  }

  return `${COUPON_PREFIX}-${Date.now().toString().slice(-8)}`.toUpperCase();
}

async function generateEngineerCoupons() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const stats: GenerationStats = {
    totalEngineers: 0,
    created: 0,
    skippedAlreadyHasDefault: 0,
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

      try {
        const existingDefaultCoupon = await couponModel
          .findOne({
            engineerId: new Types.ObjectId(engineerId),
            deletedAt: null,
            description: { $regex: `^${DEFAULT_ENGINEER_COUPON_TAG}` },
          })
          .select('_id code')
          .lean<{ _id: Types.ObjectId; code: string } | null>();

        if (existingDefaultCoupon) {
          stats.skippedAlreadyHasDefault += 1;
          console.log(`⏭️ تم التخطي: ${engineerId} لديه كوبون افتراضي (${existingDefaultCoupon.code})`);
          continue;
        }

        const couponCode = await generateUniqueDefaultEngineerCouponCode(couponModel);
        const now = new Date();

        await couponModel.create({
          code: couponCode,
          name: 'الكوبون الافتراضي للمهندس',
          description: `${DEFAULT_ENGINEER_COUPON_TAG}: تم إنشاؤه عبر سكربت توليد الكوبونات`,
          type: CouponType.PERCENTAGE,
          status: CouponStatus.ACTIVE,
          visibility: CouponVisibility.PUBLIC,
          discountValue: DEFAULT_ENGINEER_COUPON_DISCOUNT_PERCENT,
          commissionRate: DEFAULT_ENGINEER_COUPON_COMMISSION_PERCENT,
          engineerId: new Types.ObjectId(engineerId),
          usageLimit: null,
          usageLimitPerUser: null,
          validFrom: now,
          validUntil: null,
          appliesTo: DiscountAppliesTo.ALL_PRODUCTS,
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
    console.log(`- تم التخطي (لديهم كوبون افتراضي): ${stats.skippedAlreadyHasDefault}`);
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
