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
            // 1. البحث عن المنتج الرئيسي (إذا كان الرابط منتجاً)
            {
                $lookup: { from: 'products', localField: 'sku', foreignField: 'sku', as: 'p' },
            },
            // 2. البحث عن المتغير (إذا كان الرابط متغيراً)
            {
                $lookup: { from: 'variants', localField: 'sku', foreignField: 'sku', as: 'v' },
            },
            // 3. (خطوة جديدة) البحث عن "أب" المتغير لجلب الاسم
            {
                $lookup: {
                    from: 'products',
                    localField: 'v.productId', // نأخذ آيدي الأب من المتغير
                    foreignField: '_id',
                    as: 'vParent' // هنا سيتم تخزين بيانات الأب
                }
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
                    itemNameAr: 1,
                    lastSyncedAt: 1,
                    // نجهز البيانات للاستخدام
                    productDoc: { $arrayElemAt: ['$p', 0] },
                    variantDoc: { $arrayElemAt: ['$v', 0] },
                    variantParentDoc: { $arrayElemAt: ['$vParent', 0] } // بيانات الأب
                },
            },
        ];

        const items = await this.externalStockModel.aggregate(pipeline);

        return items.map((item) => {
            // المنطق الذكي لتحديد الاسم
            let appName = 'N/A';
            let appStock = 0;
            let isVariant = false;

            if (item.productDoc) {
                // الحالة الأولى: الربط مع منتج مباشر
                appName = item.productDoc.name || item.productDoc.nameEn;
                appStock = item.productDoc.stock;
            } else if (item.variantDoc) {
                // الحالة الثانية: الربط مع متغير (نأخذ الاسم من الأب)
                isVariant = true;
                appStock = item.variantDoc.stock;

                if (item.variantParentDoc) {
                    // دمج اسم الأب مع سمات المتغير (اختياري)
                    const parentName = item.variantParentDoc.name || item.variantParentDoc.nameEn;
                    // يمكن هنا إضافة تفاصيل المتغير لو أردت، مثلاً: قميص (أحمر)
                    appName = `${parentName} (Variant)`;
                } else {
                    appName = 'Variant (Orphan)'; // متغير بدون أب (حالة نادرة)
                }
            }

            return {
                sku: item.sku,
                onyxName: item.itemNameAr,
                appName: appName,
                onyxStock: item.onyxStock,
                appStock: appStock,
                lastSynced: item.lastSyncedAt,
                isVariant: isVariant
            };
        });
    }
    /**
     * 3. جلب الفرص (منتجات في أونكس وغير موجودة عندنا)
     * يساعد المدير في إضافة المنتجات الناقصة
     */
    async getUnlinkedOpportunities(limit = 50) {
        return this.externalStockModel.aggregate([
            {
                $lookup: { from: 'products', localField: 'sku', foreignField: 'sku', as: 'p' },
            },
            {
                $lookup: { from: 'variants', localField: 'sku', foreignField: 'sku', as: 'v' },
            },
            {
                $match: { p: { $size: 0 }, v: { $size: 0 } },
            },
            { $limit: limit },
            {
                // 👇 هنا المشكلة: يجب إضافة itemNameAr للقائمة
                $project: {
                    sku: 1,
                    quantity: 1,
                    itemNameAr: 1, // ✅ تمت إضافته (تأكد أن هذا هو نفس الاسم في السكيما)
                    suggestion: { $literal: 'موجود في أونكس وغير مضاف للتطبيق' }, // أو استخدام Literal
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