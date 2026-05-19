import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../../checkout/schemas/order.schema';
import { Product, ProductDocument } from '../../products/schemas/product.schema';
import {
  AnalyticsSalesByCategoryFailedException,
} from '../../../shared/exceptions';

export type AnalyticsCurrency = 'YER' | 'USD' | 'SAR';

export interface SalesByCategoryItem {
  categoryId?: string | null;
  categoryName: string;
  revenue: number;
  sales: number;
  ordersCount?: number;
  percentage: number;
  unresolved?: boolean;
}

export interface SalesByCategoryParams {
  startDate: Date;
  endDate: Date;
  currency?: AnalyticsCurrency;
}

const COMPLETED_STATUSES = ['completed'] as const;

/**
 * Sales Category Analytics Service
 *
 * Responsible for calculating sales by category using a safe aggregation
 * that falls back through multiple category resolution strategies.
 *
 * Category resolution order:
 * 1. items.snapshot.categoryName if present and valid.
 * 2. category from snapshot.categoryId (if valid ObjectId).
 * 3. category from product.categoryId.
 * 4. fallback: "غير مصنف" / "Uncategorized".
 */
@Injectable()
export class SalesCategoryAnalyticsService {
  private readonly logger = new Logger(SalesCategoryAnalyticsService.name);

  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async getSalesByCategory(params: SalesByCategoryParams): Promise<SalesByCategoryItem[]> {
    const { startDate, endDate } = params;

    try {
      const pipeline = this.buildPipeline(startDate, endDate);
      const results = await this.orderModel.aggregate(pipeline);

      const totalRevenue = results.reduce((sum, item) => sum + (item.revenue || 0), 0);

      this.logger.debug(
        `SalesCategoryAnalytics: found ${results.length} categories with total revenue ${totalRevenue}`,
      );

      return results.map((item) => ({
        categoryId: item.categoryId ?? null,
        categoryName: item.categoryName || 'غير مصنف',
        revenue: item.revenue || 0,
        sales: item.sales || 0,
        ordersCount: item.ordersCount || 0,
        percentage: totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0,
        unresolved: !!item.unresolved,
      }));
    } catch (error) {
      this.logger.error('Sales by category aggregation failed', {
        startDate,
        endDate,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      throw new AnalyticsSalesByCategoryFailedException({
        startDate,
        endDate,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private buildPipeline(startDate: Date, endDate: Date): any[] {
    return [
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
          status: { $in: COMPLETED_STATUSES },
          paymentStatus: 'paid',
        },
      },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      {
        $unwind: {
          path: '$product',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'product.categoryId',
          foreignField: '_id',
          as: 'categoryFromProduct',
        },
      },
      {
        $lookup: {
          from: 'categories',
          let: {
            snapshotCategoryId: {
              $convert: {
                input: '$items.snapshot.categoryId',
                to: 'objectId',
                onError: null,
                onNull: null,
              },
            },
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $ne: ['$$snapshotCategoryId', null] },
                    { $eq: ['$_id', '$$snapshotCategoryId'] },
                  ],
                },
              },
            },
          ],
          as: 'categoryFromSnapshot',
        },
      },
      {
        $addFields: {
          resolvedCategoryName: {
            $cond: {
              if: {
                $and: [
                  { $ne: ['$items.snapshot.categoryName', null] },
                  { $ne: ['$items.snapshot.categoryName', ''] },
                  { $ne: ['$items.snapshot.categoryName', 'undefined'] },
                ],
              },
              then: '$items.snapshot.categoryName',
              else: {
                $cond: {
                  if: { $gt: [{ $size: '$categoryFromSnapshot' }, 0] },
                  then: { $arrayElemAt: ['$categoryFromSnapshot.name', 0] },
                  else: {
                    $cond: {
                      if: { $gt: [{ $size: '$categoryFromProduct' }, 0] },
                      then: { $arrayElemAt: ['$categoryFromProduct.name', 0] },
                      else: null,
                    },
                  },
                },
              },
            },
          },
          resolvedCategoryId: {
            $cond: {
              if: {
                $and: [
                  { $ne: ['$items.snapshot.categoryName', null] },
                  { $ne: ['$items.snapshot.categoryName', ''] },
                  { $ne: ['$items.snapshot.categoryName', 'undefined'] },
                ],
              },
              then: {
                $convert: {
                  input: '$items.snapshot.categoryId',
                  to: 'objectId',
                  onError: null,
                  onNull: null,
                },
              },
              else: {
                $cond: {
                  if: { $gt: [{ $size: '$categoryFromSnapshot' }, 0] },
                  then: { $arrayElemAt: ['$categoryFromSnapshot._id', 0] },
                  else: {
                    $cond: {
                      if: { $gt: [{ $size: '$categoryFromProduct' }, 0] },
                      then: { $arrayElemAt: ['$categoryFromProduct._id', 0] },
                      else: null,
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $addFields: {
          categoryName: {
            $ifNull: ['$resolvedCategoryName', 'غير مصنف'],
          },
          unresolved: {
            $eq: ['$resolvedCategoryName', null],
          },
        },
      },
      {
        $group: {
          _id: '$categoryName',
          categoryId: { $first: '$resolvedCategoryId' },
          categoryName: { $first: '$categoryName' },
          revenue: { $sum: '$items.lineTotal' },
          sales: { $sum: '$items.qty' },
          ordersCount: { $addToSet: '$_id' },
          unresolved: { $max: '$unresolved' },
        },
      },
      {
        $addFields: {
          ordersCount: { $size: '$ordersCount' },
        },
      },
      { $sort: { revenue: -1 } },
    ];
  }
}
