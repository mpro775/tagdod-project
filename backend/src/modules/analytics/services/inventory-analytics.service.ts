import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Product, ProductDocument } from '../../products/schemas/product.schema';
import { Variant, VariantDocument } from '../../products/schemas/variant.schema';
import {
  AnalyticsInventoryCalculationFailedException,
} from '../../../shared/exceptions';
import { getPriceByCurrency } from '../utils/currency-helpers';
import { AnalyticsCurrency } from '../base-analytics.controller';

const DEFAULT_LOW_STOCK_THRESHOLD = 5;

export interface InventoryReportParams {
  startDate?: Date;
  endDate?: Date;
  currency?: AnalyticsCurrency;
}

export interface InventoryCategoryItem {
  categoryId: string;
  categoryName: string;
  productCount: number;
  variantCount: number;
  totalStock: number;
  lowStockVariants: number;
  outOfStockVariants: number;
  value: number;
}

export interface InventoryReportResult {
  currency: AnalyticsCurrency;
  totalValue: number;
  productSummary: {
    totalProducts: number;
    activeProducts: number;
    simpleProducts: number;
    productsWithVariants: number;
    lowStockProducts: number;
    outOfStockProducts: number;
  };
  variantSummary: {
    totalVariants: number;
    activeVariants: number;
    lowStockVariants: number;
    outOfStockVariants: number;
    affectedProducts: number;
  };
  totals: {
    lowStockItems: number;
    outOfStockItems: number;
    affectedProducts: number;
  };
  byCategory: InventoryCategoryItem[];
  lowStockItems: Array<{
    id: string;
    name: string;
    type: 'product' | 'variant';
    stock: number;
    minStock: number;
    productId?: string;
  }>;
  outOfStockItems: Array<{
    id: string;
    name: string;
    type: 'product' | 'variant';
    stock: number;
    productId?: string;
  }>;
}

@Injectable()
export class InventoryAnalyticsService {
  private readonly logger = new Logger(InventoryAnalyticsService.name);

  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Variant.name) private variantModel: Model<VariantDocument>,
  ) {}

  async getInventoryReport(params: InventoryReportParams): Promise<InventoryReportResult> {
    try {
      const currency = params.currency || 'YER';

      // Fetch all active products and variants
      const [products, variants] = await Promise.all([
        this.productModel
          .find({ deletedAt: null })
          .select('_id name categoryId status isActive stock minStock trackStock variantsCount basePriceYER basePriceUSD basePriceSAR')
          .lean(),
        this.variantModel
          .find({ deletedAt: null })
          .select('_id productId sku stock minStock trackInventory isActive basePriceYER basePriceUSD basePriceSAR')
          .lean(),
      ]);

      const activeProducts = products.filter((p) => p.status === 'active' && p.isActive);
      const activeVariants = variants.filter((v) => v.isActive);

      // Map variants by product
      const variantsByProduct = new Map<string, typeof variants>();
      for (const v of variants) {
        const list = variantsByProduct.get(v.productId) || [];
        list.push(v);
        variantsByProduct.set(v.productId, list);
      }

      let totalValue = 0;
      let simpleProducts = 0;
      let productsWithVariants = 0;
      let lowStockProducts = 0;
      let outOfStockProducts = 0;
      let lowStockVariants = 0;
      let outOfStockVariants = 0;
      const affectedProductIds = new Set<string>();

      const lowStockItems: InventoryReportResult['lowStockItems'] = [];
      const outOfStockItems: InventoryReportResult['outOfStockItems'] = [];

      for (const product of activeProducts) {
        const productVariants = variantsByProduct.get(product._id.toString()) || [];
        const hasActiveVariants = productVariants.length > 0;

        if (hasActiveVariants) {
          productsWithVariants++;
        } else {
          simpleProducts++;
        }

        // Simple product logic (no variants)
        if (!hasActiveVariants) {
          const price = getPriceByCurrency(product, currency);
          totalValue += (product.stock || 0) * price;

          if (product.trackStock && product.stock === 0) {
            outOfStockProducts++;
            outOfStockItems.push({
              id: product._id.toString(),
              name: product.name,
              type: 'product',
              stock: 0,
            });
          } else if (
            product.trackStock &&
            product.stock !== undefined &&
            product.stock > 0 &&
            product.stock <= (product.minStock || DEFAULT_LOW_STOCK_THRESHOLD)
          ) {
            lowStockProducts++;
            lowStockItems.push({
              id: product._id.toString(),
              name: product.name,
              type: 'product',
              stock: product.stock,
              minStock: product.minStock || DEFAULT_LOW_STOCK_THRESHOLD,
            });
          }
        }

        // Variant logic
        for (const variant of productVariants) {
          if (!variant.isActive) continue;

          const price = getPriceByCurrency(variant, currency);
          totalValue += (variant.stock || 0) * price;

          if (variant.trackInventory && variant.stock === 0) {
            outOfStockVariants++;
            affectedProductIds.add(product._id.toString());
            outOfStockItems.push({
              id: variant._id.toString(),
              name: variant.sku || `Variant of ${product.name}`,
              type: 'variant',
              stock: 0,
              productId: product._id.toString(),
            });
          } else if (
            variant.trackInventory &&
            variant.stock !== undefined &&
            variant.stock > 0 &&
            variant.stock <= (variant.minStock || DEFAULT_LOW_STOCK_THRESHOLD)
          ) {
            lowStockVariants++;
            affectedProductIds.add(product._id.toString());
            lowStockItems.push({
              id: variant._id.toString(),
              name: variant.sku || `Variant of ${product.name}`,
              type: 'variant',
              stock: variant.stock,
              minStock: variant.minStock || DEFAULT_LOW_STOCK_THRESHOLD,
              productId: product._id.toString(),
            });
          }
        }
      }

      // Build category breakdown
      const categoryMap = new Map<string, InventoryCategoryItem>();
      for (const product of activeProducts) {
        const cid = product.categoryId?.toString() || 'uncategorized';
        if (!categoryMap.has(cid)) {
          categoryMap.set(cid, {
            categoryId: cid,
            categoryName: '',
            productCount: 0,
            variantCount: 0,
            totalStock: 0,
            lowStockVariants: 0,
            outOfStockVariants: 0,
            value: 0,
          });
        }
        const c = categoryMap.get(cid)!;
        c.productCount++;

        const productVariants = variantsByProduct.get(product._id.toString()) || [];
        const hasActiveVariants = productVariants.filter((v) => v.isActive).length > 0;

        if (hasActiveVariants) {
          for (const v of productVariants) {
            if (!v.isActive) continue;
            c.variantCount++;
            c.totalStock += v.stock || 0;
            const price = getPriceByCurrency(v, currency);
            c.value += (v.stock || 0) * price;
            if (v.trackInventory && v.stock === 0) c.outOfStockVariants++;
            else if (
              v.trackInventory &&
              v.stock > 0 &&
              v.stock <= (v.minStock || DEFAULT_LOW_STOCK_THRESHOLD)
            ) {
              c.lowStockVariants++;
            }
          }
        } else {
          c.totalStock += product.stock || 0;
          const price = getPriceByCurrency(product, currency);
          c.value += (product.stock || 0) * price;
        }
      }

      // Populate category names
      const categoryIds = Array.from(categoryMap.keys()).filter((id) => id !== 'uncategorized');
      if (categoryIds.length > 0) {
        try {
          const cats = await this.productModel.db
            .collection('categories')
            .find({ _id: { $in: categoryIds.map((id) => new Types.ObjectId(id)) } })
            .project({ name: 1 })
            .toArray();
          const nameMap = new Map(cats.map((c) => [c._id.toString(), c.name]));
          for (const [id, item] of categoryMap) {
            item.categoryName = nameMap.get(id) || 'غير مصنف';
          }
        } catch {
          for (const item of categoryMap.values()) {
            item.categoryName = item.categoryName || 'غير مصنف';
          }
        }
      }
      if (categoryMap.has('uncategorized')) {
        categoryMap.get('uncategorized')!.categoryName = 'غير مصنف';
      }

      const byCategory = Array.from(categoryMap.values()).sort((a, b) => b.value - a.value);

      return {
        currency,
        totalValue,
        productSummary: {
          totalProducts: products.length,
          activeProducts: activeProducts.length,
          simpleProducts,
          productsWithVariants,
          lowStockProducts,
          outOfStockProducts,
        },
        variantSummary: {
          totalVariants: variants.length,
          activeVariants: activeVariants.length,
          lowStockVariants,
          outOfStockVariants,
          affectedProducts: affectedProductIds.size,
        },
        totals: {
          lowStockItems: lowStockProducts + lowStockVariants,
          outOfStockItems: outOfStockProducts + outOfStockVariants,
          affectedProducts: affectedProductIds.size,
        },
        byCategory,
        lowStockItems,
        outOfStockItems,
      };
    } catch (error) {
      this.logger.error('Inventory analytics calculation failed', {
        error: error instanceof Error ? error.message : String(error),
      });
      throw new AnalyticsInventoryCalculationFailedException({
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
