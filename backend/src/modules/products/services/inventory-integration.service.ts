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
  ) {}

  private escapeRegExp(value: string) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * 1. استقبال البيانات من السكربت المحلي (مع السعر)
   * هذه الدالة تقوم بتحديث "مخزون الظل" وتزامن المنتجات المربوطة
   */
  async processBatchPayload(
    items: Array<{ sku: string; stock: number; name?: string; price?: number }>,
  ) {
    this.logger.log(`Processing batch of ${items.length} items from Onyx...`);

    const bulkOps = items.map((item) => ({
      updateOne: {
        filter: { sku: item.sku },
        update: {
          $set: {
            quantity: item.stock,
            itemNameAr: item.name, // ✅ حفظ الاسم العربي
            price: item.price, // ✅ حفظ السعر في جدول الظل
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
   * 2. عكس التحديثات على المنتجات والمتغيرات (مخزون + أسعار)
   */
  private async syncLinkedProducts(items: Array<{ sku: string; stock: number; price?: number }>) {
    const productWrites = [];
    const variantWrites = [];

    for (const item of items) {
      // تحديث المنتج (Product)
      const productUpdate: Record<string, number> = { stock: item.stock };
      if (item.price !== undefined && item.price >= 0) {
        productUpdate.basePriceUSD = item.price; // ✅ صحيح
      }

      productWrites.push({
        updateOne: {
          filter: { sku: item.sku },
          update: { $set: productUpdate },
        },
      });

      // تحديث المتغير (Variant)
      const variantUpdate: Record<string, number> = { stock: item.stock };
      if (item.price !== undefined && item.price >= 0) {
        // ⚠️ نحدث basePriceUSD فقط لأن price هو virtual
        variantUpdate.basePriceUSD = item.price;
      }

      variantWrites.push({
        updateOne: {
          filter: { sku: item.sku },
          update: { $set: variantUpdate },
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

  async getLinkedProducts(
    limit = 50,
    page = 1,
    search = '',
    status: 'all' | 'matched' | 'mismatched' = 'all',
    sort = 'sku',
    sortOrder: 'asc' | 'desc' = 'asc',
  ) {
    const skip = (page - 1) * limit;
    const normalizedSearch = search?.trim() || '';

    const searchMatch = normalizedSearch
      ? {
          $match: {
            $or: [
              { sku: { $regex: this.escapeRegExp(normalizedSearch), $options: 'i' } },
              { itemNameAr: { $regex: this.escapeRegExp(normalizedSearch), $options: 'i' } },
            ],
          },
        }
      : null;

    const statusMatch =
      status === 'matched'
        ? { $match: { isStockMatch: true } }
        : status === 'mismatched'
          ? { $match: { isStockMatch: false } }
          : null;

    const sortFieldMap: Record<string, string> = {
      sku: 'sku',
      onyxStock: 'quantity',
      appStock: 'appStockComparable',
      lastSynced: 'lastSyncedAt',
    };
    const effectiveSortField = sortFieldMap[sort] || 'sku';
    const sortDirection = sortOrder === 'desc' ? -1 : 1;

    const pipeline: any[] = [
      { $lookup: { from: 'products', localField: 'sku', foreignField: 'sku', as: 'p' } },
      { $lookup: { from: 'variants', localField: 'sku', foreignField: 'sku', as: 'v' } },
      {
        $lookup: {
          from: 'products',
          localField: 'v.productId',
          foreignField: '_id',
          as: 'vParent',
        },
      },
      {
        $match: {
          $or: [{ 'p.0': { $exists: true } }, { 'v.0': { $exists: true } }],
        },
      },
      {
        $addFields: {
          appStockComparable: {
            $cond: [
              { $gt: [{ $size: '$p' }, 0] },
              { $ifNull: [{ $arrayElemAt: ['$p.stock', 0] }, 0] },
              { $ifNull: [{ $arrayElemAt: ['$v.stock', 0] }, 0] },
            ],
          },
          linkType: {
            $cond: [
              { $gt: [{ $size: '$p' }, 0] },
              'product',
              'variant',
            ],
          },
          productId: {
            $ifNull: [{ $arrayElemAt: ['$p._id', 0] }, null],
          },
          variantId: {
            $cond: [
              { $gt: [{ $size: '$v' }, 0] },
              { $arrayElemAt: ['$v._id', 0] },
              null,
            ],
          },
        },
      },
      {
        $addFields: {
          isStockMatch: { $eq: ['$quantity', '$appStockComparable'] },
          stockDifference: { $abs: { $subtract: ['$quantity', '$appStockComparable'] } },
        },
      },
    ];

    if (searchMatch) pipeline.push(searchMatch);
    if (statusMatch) pipeline.push(statusMatch);

    pipeline.push({
      $facet: {
        metadata: [
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              matchedTotal: { $sum: { $cond: ['$isStockMatch', 1, 0] } },
              mismatchedTotal: { $sum: { $cond: ['$isStockMatch', 0, 1] } },
            },
          },
        ],
        data: [
          { $sort: { [effectiveSortField]: sortDirection } },
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              sku: 1,
              onyxStock: '$quantity',
              itemNameAr: 1,
              lastSyncedAt: 1,
              isStockMatch: 1,
              stockDifference: 1,
              linkType: 1,
              productId: 1,
              variantId: 1,
              productDoc: { $arrayElemAt: ['$p', 0] },
              variantDoc: { $arrayElemAt: ['$v', 0] },
              variantParentDoc: { $arrayElemAt: ['$vParent', 0] },
            },
          },
        ],
      },
    });

    const result = await this.externalStockModel.aggregate(pipeline);

    const total = result[0].metadata[0]?.total || 0;
    const matchedTotal = result[0].metadata[0]?.matchedTotal || 0;
    const mismatchedTotal = result[0].metadata[0]?.mismatchedTotal || 0;
    const items = result[0].data;

    const formattedItems = items.map(
      (item: {
        sku: string;
        onyxStock: number;
        itemNameAr?: string;
        lastSyncedAt?: Date;
        isStockMatch?: boolean;
        stockDifference?: number;
        linkType?: string;
        productId?: string;
        variantId?: string;
        productDoc?: { name?: string; nameEn?: string; stock: number };
        variantDoc?: { stock: number };
        variantParentDoc?: { name?: string; nameEn?: string };
      }) => {
        let appName = 'N/A';
        let appStock = 0;
        let isVariant = false;

        if (item.productDoc) {
          appName = item.productDoc.name || item.productDoc.nameEn || 'N/A';
          appStock = item.productDoc.stock;
        } else if (item.variantDoc) {
          isVariant = true;
          appStock = item.variantDoc.stock;
          if (item.variantParentDoc) {
            const parentName = item.variantParentDoc.name || item.variantParentDoc.nameEn;
            appName = `${parentName} (Variant)`;
          } else {
            appName = 'Variant (Orphan)';
          }
        }

        return {
          sku: item.sku,
          onyxName: item.itemNameAr,
          appName: appName,
          onyxStock: item.onyxStock,
          appStock: appStock,
          lastSynced: item.lastSyncedAt,
          isVariant: isVariant,
          isStockMatch: item.isStockMatch ?? (item.onyxStock === appStock),
          stockDifference: item.stockDifference ?? Math.abs(item.onyxStock - appStock),
          linkType: item.linkType || (isVariant ? 'variant' : 'product'),
          productId: item.productId ?? undefined,
          variantId: item.variantId ?? undefined,
        };
      },
    );

    return {
      data: formattedItems,
      total: total,
      matchedTotal,
      mismatchedTotal,
      page: page,
      limit: limit,
    };
  }
  /**
   * 3. جلب الفرص (منتجات في أونكس وغير موجودة عندنا)
   * يساعد المدير في إضافة المنتجات الناقصة
   */
  async getUnlinkedOpportunities(limit = 50, page = 1, search = '', sort = 'quantity', sortOrder: 'asc' | 'desc' = 'desc') {
    const skip = (page - 1) * limit;
    const normalizedSearch = search.trim();
    const searchMatch = normalizedSearch
      ? {
          $match: {
            $or: [
              { sku: { $regex: this.escapeRegExp(normalizedSearch), $options: 'i' } },
              { itemNameAr: { $regex: this.escapeRegExp(normalizedSearch), $options: 'i' } },
            ],
          },
        }
      : null;

    const sortFieldMap: Record<string, string> = {
      sku: 'sku',
      quantity: 'quantity',
      itemNameAr: 'itemNameAr',
      price: 'price',
      lastSyncedAt: 'lastSyncedAt',
    };
    const effectiveSortField = sortFieldMap[sort] || 'quantity';
    const sortDirection = sortOrder === 'desc' ? -1 : 1;

    const result = await this.externalStockModel.aggregate([
      { $lookup: { from: 'products', localField: 'sku', foreignField: 'sku', as: 'p' } },
      { $lookup: { from: 'variants', localField: 'sku', foreignField: 'sku', as: 'v' } },
      { $match: { p: { $size: 0 }, v: { $size: 0 } } },
      ...(searchMatch ? [searchMatch] : []),
      {
        $facet: {
          metadata: [{ $count: 'total' }],
          data: [
            { $sort: { [effectiveSortField]: sortDirection } },
            { $skip: skip },
            { $limit: limit },
            {
              $project: {
                sku: 1,
                quantity: 1,
                itemNameAr: 1,
                price: 1,
                lastSyncedAt: 1,
                suggestion: { $literal: 'موجود في أونكس وغير مضاف للتطبيق' },
              },
            },
          ],
        },
      },
    ]);

    const total = result[0].metadata[0]?.total || 0;
    const items = result[0].data;

    return {
      data: items,
      total: total,
    };
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
