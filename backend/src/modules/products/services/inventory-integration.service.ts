// src/inventory/services/inventory-integration.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ExternalStock } from '../schemas/external-stock.schema';
import { Product } from '../schemas/product.schema';
import { Variant } from '../schemas/variant.schema';
import { InventoryService } from './inventory.service'; // السيرفس القديم الخاص بك

@Injectable()
export class InventoryIntegrationService {
    private readonly logger = new Logger(InventoryIntegrationService.name);

    constructor(
        @InjectModel(ExternalStock.name) private externalStockModel: Model<ExternalStock>,
        @InjectModel(Product.name) private productModel: Model<Product>,
        @InjectModel(Variant.name) private variantModel: Model<Variant>,
        private inventoryService: InventoryService, // حقن السيرفس القديم لاستخدامه
    ) { }

    /**
     * 1. استقبال البيانات من السكربت المحلي
     * هذه الدالة تقوم بتحديث "مخزون الظل" وتزامن المنتجات المربوطة
     */
async processBatchPayload(items: Array<{ sku: string; stock: number; name?: string }>) {
    this.logger.log(`Processing batch of ${items.length} items from Onyx...`);

    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: { sku: item.sku },
        update: {
          $set: {
            quantity: item.stock,
            itemNameAr: item.name, // ✅ حفظ الاسم العربي
            lastSyncedAt: new Date(),
          },
        },
        upsert: true,
      },
    }));

    if (bulkOps.length > 0) {
      await this.externalStockModel.bulkWrite(bulkOps);
    }

    await this.syncLinkedProducts(items);
    return { success: true, count: items.length };
  }

    /**
     * تحديث المخزون الفعلي في التطبيق بناءً على البيانات القادمة
     */
    private async syncLinkedProducts(items: Array<{ sku: string; stock: number }>) {
        // نستخدم bulkWrite للأداء العالي كما فعلنا سابقاً
        const productWrites = [];
        const variantWrites = [];

        for (const item of items) {
            // تحديث المنتجات البسيطة
            productWrites.push({
                updateOne: {
                    filter: { sku: item.sku },
                    update: { $set: { stock: item.stock } },
                },
            });

            // تحديث المتغيرات
            variantWrites.push({
                updateOne: {
                    filter: { sku: item.sku },
                    update: { $set: { stock: item.stock } },
                },
            });
        }

        await Promise.all([
            this.productModel.bulkWrite(productWrites, { ordered: false }),
            this.variantModel.bulkWrite(variantWrites, { ordered: false }),
        ]);
    }

    /**
     * 2. تقرير لوحة التحكم (الذكاء)
     * يعطيك إحصائيات الربط والمشاكل
     */
    async getIntegrationDashboardStats() {
        // عدد الأصناف في أونكس
        const totalExternalItems = await this.externalStockModel.countDocuments();

        // 1. المنتجات المربوطة (موجودة في أونكس وفي التطبيق)
        // نحتاج لعمل Aggregation للمقارنة
        const linkedStats = await this.externalStockModel.aggregate([
            {
                $lookup: {
                    from: 'products', // اسم الكولكشن في مونجو
                    localField: 'sku',
                    foreignField: 'sku',
                    as: 'matchedProduct',
                },
            },
            {
                $lookup: {
                    from: 'variants',
                    localField: 'sku',
                    foreignField: 'sku',
                    as: 'matchedVariant',
                },
            },
            {
                $project: {
                    sku: 1,
                    isLinked: {
                        $or: [
                            { $gt: [{ $size: '$matchedProduct' }, 0] },
                            { $gt: [{ $size: '$matchedVariant' }, 0] },
                        ],
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    linkedCount: {
                        $sum: { $cond: ['$isLinked', 1, 0] },
                    },
                    unlinkedCount: {
                        $sum: { $cond: ['$isLinked', 0, 1] },
                    },
                },
            },
        ]);

        const stats = linkedStats[0] || { linkedCount: 0, unlinkedCount: 0 };

        return {
            onyxTotalItems: totalExternalItems,
            fullySynced: stats.linkedCount,
            notLinkedOpportunities: stats.unlinkedCount, // منتجات في أونكس ليست في التطبيق
            lastUpdate: await this.externalStockModel
                .findOne()
                .sort({ lastSyncedAt: -1 })
                .select('lastSyncedAt'),
        };
    }

    async getLinkedProducts(limit = 50, page = 1) {
    const skip = (page - 1) * limit;

    const pipeline = [
      // دمج مع المنتجات
      {
        $lookup: { from: 'products', localField: 'sku', foreignField: 'sku', as: 'p' },
      },
      // دمج مع المتغيرات
      {
        $lookup: { from: 'variants', localField: 'sku', foreignField: 'sku', as: 'v' },
      },
      // شرط: يجب أن يكون موجوداً في Products أو Variants
      {
        $match: {
          $or: [{ 'p.0': { $exists: true } }, { 'v.0': { $exists: true } }],
        },
      },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          sku: 1,
          onyxStock: '$quantity',
          itemNameAr: 1, // اسم أونكس
          lastSyncedAt: 1,
          // بيانات من تطبيقنا
          appProduct: { $arrayElemAt: ['$p', 0] },
          appVariant: { $arrayElemAt: ['$v', 0] },
        },
      },
    ];

    const items = await this.externalStockModel.aggregate(pipeline);

    // تنسيق النتيجة
    return items.map((item) => {
        const appItem = item.appProduct || item.appVariant;
        return {
            sku: item.sku,
            onyxName: item.itemNameAr,
            appName: appItem?.name || appItem?.nameEn || 'N/A', // اسم المنتج في تطبيقنا
            onyxStock: item.onyxStock,
            appStock: appItem?.stock, // للمقارنة
            lastSynced: item.lastSyncedAt,
            isVariant: !!item.appVariant
        };
    });
  }
    /**
     * 3. جلب الفرص (منتجات في أونكس وغير موجودة عندنا)
     * يساعد المدير في إضافة المنتجات الناقصة
     */
    async getUnlinkedOpportunities(limit = 50) {
        // هذا الاستعلام معقد قليلاً، يجلب الـ SKU الموجود في External وغير موجود في Product/Variant
        return this.externalStockModel.aggregate([
            {
                $lookup: {
                    from: 'products',
                    localField: 'sku',
                    foreignField: 'sku',
                    as: 'p',
                },
            },
            {
                $lookup: {
                    from: 'variants',
                    localField: 'sku',
                    foreignField: 'sku',
                    as: 'v',
                },
            },
            // تصفية: نريد فقط من ليس لديه تطابق
            {
                $match: {
                    p: { $size: 0 },
                    v: { $size: 0 },
                },
            },
            { $limit: limit },
            {
                $project: {
                    sku: 1,
                    quantity: 1,
                    suggestion: 'موجود في أونكس ولكن لم يتم إضافته للتطبيق',
                },
            },
        ]);
    }

    /**
     * 4. فحص الـ SKU الفوري (عند إنشاء منتج)
     * يستخدمه الفرونت اند لإظهار تلميح للمدير
     */
    async checkSkuStatus(sku: string) {
        const external = await this.externalStockModel.findOne({ sku });

        if (!external) {
            return {
                existsInOnyx: false,
                message: 'هذا الرمز غير موجود في أونكس (تأكد من صحة الرمز)',
            };
        }

        return {
            existsInOnyx: true,
            onyxStock: external.quantity,
            lastSynced: external.lastSyncedAt,
            message: `✅ الرمز صحيح ومطابق! الكمية في أونكس: ${external.quantity}`,
        };
    }
}