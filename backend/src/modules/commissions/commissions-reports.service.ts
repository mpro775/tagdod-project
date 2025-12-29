import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { EngineerProfile, EngineerProfileDocument } from '../users/schemas/engineer-profile.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Coupon, CouponDocument } from '../marketing/schemas/coupon.schema';
import { Order, OrderDocument } from '../checkout/schemas/order.schema';
import {
  CommissionsReportParams,
  CommissionsReportResponse,
  AccountStatementParams,
  AccountStatementResponse,
} from './dto/commissions-reports.dto';

@Injectable()
export class CommissionsReportsService {
  constructor(
    @InjectModel(EngineerProfile.name)
    private readonly engineerProfileModel: Model<EngineerProfileDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Coupon.name)
    private readonly couponModel: Model<CouponDocument>,
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
  ) {}

  /**
   * حساب الفترة الزمنية حسب نوع الفترة
   */
  private calculateDateRange(
    period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom',
    dateFrom?: Date,
    dateTo?: Date,
  ): { startDate: Date; endDate: Date } {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now);

    switch (period) {
      case 'daily':
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        break;

      case 'weekly':
        const dayOfWeek = now.getDay();
        startDate = new Date(now);
        startDate.setDate(now.getDate() - dayOfWeek);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        break;

      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
        break;

      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(now.getFullYear(), 11, 31);
        endDate.setHours(23, 59, 59, 999);
        break;

      case 'custom':
        if (!dateFrom || !dateTo) {
          throw new BadRequestException('يجب تحديد تاريخ البداية والنهاية للفترة المخصصة');
        }
        startDate = new Date(dateFrom);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        break;

      default:
        throw new BadRequestException('نوع الفترة غير صحيح');
    }

    return { startDate, endDate };
  }

  /**
   * تنسيق الفترة للعرض
   */
  private formatPeriod(
    period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom',
    date: Date,
  ): string {
    switch (period) {
      case 'daily':
        return date.toISOString().split('T')[0]; // YYYY-MM-DD
      case 'weekly':
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        const year = weekStart.getFullYear();
        const week = Math.ceil(
          (weekStart.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000),
        );
        return `${year}-W${week.toString().padStart(2, '0')}`;
      case 'monthly':
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      case 'yearly':
        return date.getFullYear().toString();
      default:
        return date.toISOString().split('T')[0];
    }
  }

  /**
   * جلب تقرير العمولات الشامل
   */
  async getCommissionsReport(
    params: CommissionsReportParams,
  ): Promise<CommissionsReportResponse> {
    const { period, dateFrom, dateTo, engineerId } = params;
    const { startDate, endDate } = this.calculateDateRange(period, dateFrom, dateTo);

    // بناء استعلام المهندسين
    const engineerMatch: any = {};
    if (engineerId) {
      engineerMatch.userId = new Types.ObjectId(engineerId);
    }

    // جلب جميع المهندسين الذين لديهم عمولات في الفترة المحددة
    const profiles = await this.engineerProfileModel
      .find(engineerMatch)
      .populate('userId', 'firstName lastName phone')
      .lean();

    const engineersData: CommissionsReportResponse['engineers'] = [];
    let totalCommissions = 0;
    let totalSales = 0;
    let totalRevenue = 0;

    // جمع جميع الكوبونات والطلبات لاستخدام batch queries
    const couponCodesSet = new Set<string>();
    const orderIdsSet = new Set<string>();

    // المرور الأول: جمع جميع الكوبونات والطلبات
    for (const profile of profiles) {
      const transactions = (profile.commissionTransactions || []).filter((tx) => {
        if (tx.type !== 'commission') return false;
        const txDate = new Date(tx.createdAt);
        return txDate >= startDate && txDate <= endDate;
      });

      for (const tx of transactions) {
        if (tx.couponCode) {
          couponCodesSet.add(tx.couponCode);
        }
        if (tx.orderId) {
          orderIdsSet.add(tx.orderId.toString());
        }
      }
    }

    // جلب جميع الكوبونات دفعة واحدة
    const coupons = await this.couponModel
      .find({ code: { $in: Array.from(couponCodesSet) }, deletedAt: null })
      .select('code name commissionRate')
      .lean();
    const couponsMap = new Map<string, any>();
    coupons.forEach((coupon) => {
      couponsMap.set(coupon.code, {
        code: coupon.code,
        name: coupon.name,
        commissionRate: coupon.commissionRate || 0,
      });
    });

    // جلب جميع الطلبات دفعة واحدة
    const orderIds = Array.from(orderIdsSet).map((id) => new Types.ObjectId(id));
    const orders = await this.orderModel
      .find({ _id: { $in: orderIds } })
      .select('_id subtotal')
      .lean();
    const ordersMap = new Map<string, number>();
    orders.forEach((order) => {
      ordersMap.set(order._id.toString(), order.subtotal || 0);
    });

    // معالجة كل مهندس
    for (const profile of profiles) {
      // فلترة المعاملات حسب الفترة
      const transactions = (profile.commissionTransactions || []).filter((tx) => {
        if (tx.type !== 'commission') return false;
        const txDate = new Date(tx.createdAt);
        return txDate >= startDate && txDate <= endDate;
      });

      if (transactions.length === 0 && !engineerId) continue;

      // تجميع البيانات حسب الكوبون
      const couponMap = new Map<string, any>();
      let engineerTotalCommission = 0;
      let engineerTotalSales = 0;
      let engineerTotalRevenue = 0;

      for (const tx of transactions) {
        if (!tx.couponCode) continue;

        const couponCode = tx.couponCode;
        const couponInfo = couponsMap.get(couponCode);
        if (!couponInfo) continue;

        if (!couponMap.has(couponCode)) {
          couponMap.set(couponCode, {
            couponCode: couponInfo.code,
            couponName: couponInfo.name,
            commissionRate: couponInfo.commissionRate,
            totalCommission: 0,
            totalSales: 0,
            totalRevenue: 0,
            transactions: [],
          });
        }

        const couponData = couponMap.get(couponCode);
        couponData.totalCommission += tx.amount;
        couponData.transactions.push({
          transactionId: tx.transactionId,
          orderId: tx.orderId?.toString() || '',
          amount: tx.amount,
          createdAt: tx.createdAt,
        });

        engineerTotalCommission += tx.amount;
        engineerTotalSales += 1;

        // حساب الإيرادات من ordersMap
        if (tx.orderId) {
          const orderRevenue = ordersMap.get(tx.orderId.toString()) || 0;
          couponData.totalRevenue += orderRevenue;
          engineerTotalRevenue += orderRevenue;
        }
      }

      if (couponMap.size === 0 && !engineerId) continue;

      const user = profile.userId as any;
      const userIdString = user?._id?.toString() || profile.userId?.toString() || String(profile.userId);
      engineersData.push({
        engineerId: userIdString,
        engineerName: user
          ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'بدون اسم'
          : 'بدون اسم',
        engineerPhone: user?.phone || '',
        coupons: Array.from(couponMap.values()),
        totals: {
          totalCommission: Math.round(engineerTotalCommission * 100) / 100,
          totalSales: engineerTotalSales,
          totalRevenue: Math.round(engineerTotalRevenue * 100) / 100,
        },
      });

      totalCommissions += engineerTotalCommission;
      totalSales += engineerTotalSales;
      totalRevenue += engineerTotalRevenue;
    }

    // حساب periodBreakdown
    const periodBreakdown = await this.calculatePeriodBreakdown(period, startDate, endDate);

    return {
      period,
      dateFrom: startDate,
      dateTo: endDate,
      summary: {
        totalEngineers: engineersData.length,
        totalCommissions: Math.round(totalCommissions * 100) / 100,
        totalSales,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
      },
      engineers: engineersData,
      periodBreakdown,
    };
  }

  /**
   * حساب periodBreakdown
   */
  private async calculatePeriodBreakdown(
    period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom',
    startDate: Date,
    endDate: Date,
  ): Promise<CommissionsReportResponse['periodBreakdown']> {
    const breakdown: CommissionsReportResponse['periodBreakdown'] = [];
    const periodMap = new Map<string, { totalCommission: number; totalSales: number; totalRevenue: number }>();

    // جلب جميع المعاملات في الفترة
    const profiles = await this.engineerProfileModel.find({}).lean();

    // جمع جميع orderIds لاستخدام batch query
    const orderIds: Types.ObjectId[] = [];
    const transactionOrderMap = new Map<string, Types.ObjectId>();

    for (const profile of profiles) {
      const transactions = (profile.commissionTransactions || []).filter((tx) => {
        if (tx.type !== 'commission') return false;
        const txDate = new Date(tx.createdAt);
        return txDate >= startDate && txDate <= endDate;
      });

      for (const tx of transactions) {
        const txDate = new Date(tx.createdAt);
        const periodKey = this.formatPeriod(period, txDate);

        if (!periodMap.has(periodKey)) {
          periodMap.set(periodKey, {
            totalCommission: 0,
            totalSales: 0,
            totalRevenue: 0,
          });
        }

        const periodData = periodMap.get(periodKey)!;
        periodData.totalCommission += tx.amount;
        periodData.totalSales += 1;

        if (tx.orderId) {
          const orderId = tx.orderId instanceof Types.ObjectId ? tx.orderId : new Types.ObjectId(tx.orderId);
          if (!orderIds.some((id) => id.toString() === orderId.toString())) {
            orderIds.push(orderId);
          }
          transactionOrderMap.set(`${periodKey}-${tx.transactionId}`, orderId);
        }
      }
    }

    // جلب جميع الطلبات دفعة واحدة
    const orders = await this.orderModel
      .find({ _id: { $in: orderIds } })
      .select('_id subtotal')
      .lean();
    const ordersMap = new Map<string, number>();
    orders.forEach((order) => {
      ordersMap.set(order._id.toString(), order.subtotal || 0);
    });

    // تحديث الإيرادات
    for (const [key, orderId] of transactionOrderMap.entries()) {
      const [periodKey] = key.split('-');
      const periodData = periodMap.get(periodKey);
      if (periodData) {
        const revenue = ordersMap.get(orderId.toString()) || 0;
        periodData.totalRevenue += revenue;
      }
    }

    // تحويل إلى array وترتيب
    for (const [periodKey, data] of periodMap.entries()) {
      breakdown.push({
        period: periodKey,
        totalCommission: Math.round(data.totalCommission * 100) / 100,
        totalSales: data.totalSales,
        totalRevenue: Math.round(data.totalRevenue * 100) / 100,
      });
    }

    breakdown.sort((a, b) => a.period.localeCompare(b.period));

    return breakdown;
  }

  /**
   * جلب تقرير عمولات مهندس محدد
   */
  async getEngineerCommissionsReport(
    engineerId: string,
    params: CommissionsReportParams,
  ): Promise<CommissionsReportResponse> {
    return this.getCommissionsReport({ ...params, engineerId });
  }

  /**
   * جلب كشف حساب مهندس
   */
  async getAccountStatement(
    engineerId: string,
    params: AccountStatementParams,
  ): Promise<AccountStatementResponse> {
    const { dateFrom, dateTo } = params;

    if (!dateFrom || !dateTo) {
      throw new BadRequestException('يجب تحديد تاريخ البداية والنهاية');
    }

    const startDate = new Date(dateFrom);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(dateTo);
    endDate.setHours(23, 59, 59, 999);

    // جلب بروفايل المهندس
    const profile = await this.engineerProfileModel
      .findOne({ userId: new Types.ObjectId(engineerId) })
      .populate('userId', 'firstName lastName phone')
      .lean();

    if (!profile) {
      throw new NotFoundException('المهندس غير موجود');
    }

    const user = profile.userId as any;

    // حساب الرصيد الافتتاحي (جميع المعاملات قبل تاريخ البداية)
    const openingTransactions = (profile.commissionTransactions || []).filter((tx) => {
      const txDate = new Date(tx.createdAt);
      return txDate < startDate;
    });

    const openingBalance = openingTransactions.reduce((balance, tx) => {
      if (tx.type === 'commission') return balance + tx.amount;
      if (tx.type === 'withdrawal' || tx.type === 'refund') return balance - Math.abs(tx.amount);
      return balance;
    }, 0);

    // فلترة المعاملات في الفترة المحددة
    const transactions = (profile.commissionTransactions || [])
      .filter((tx) => {
        const txDate = new Date(tx.createdAt);
        return txDate >= startDate && txDate <= endDate;
      })
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    // حساب الملخص
    const summary = {
      totalCommissions: 0,
      totalWithdrawals: 0,
      totalRefunds: 0,
      netAmount: 0,
    };

    for (const tx of transactions) {
      if (tx.type === 'commission') {
        summary.totalCommissions += tx.amount;
      } else if (tx.type === 'withdrawal') {
        summary.totalWithdrawals += Math.abs(tx.amount);
      } else if (tx.type === 'refund') {
        summary.totalRefunds += Math.abs(tx.amount);
      }
    }

    summary.netAmount = summary.totalCommissions - summary.totalWithdrawals - summary.totalRefunds;
    const closingBalance = openingBalance + summary.netAmount;

    // تجميع حسب الكوبون
    const couponMap = new Map<string, any>();

    for (const tx of transactions) {
      if (tx.type === 'commission' && tx.couponCode) {
        const couponCode = tx.couponCode;
        if (!couponMap.has(couponCode)) {
          const coupon = await this.couponModel
            .findOne({ code: couponCode, deletedAt: null })
            .lean();

          if (!coupon) continue;

          couponMap.set(couponCode, {
            couponCode: coupon.code,
            couponName: coupon.name,
            commissionRate: coupon.commissionRate || 0,
            totalCommission: 0,
            transactionCount: 0,
          });
        }

        const couponData = couponMap.get(couponCode)!;
        couponData.totalCommission += tx.amount;
        couponData.transactionCount += 1;
      }
    }

    return {
      engineerId: engineerId,
      engineerName: user
        ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'بدون اسم'
        : 'بدون اسم',
      engineerPhone: user?.phone || '',
      dateFrom: startDate,
      dateTo: endDate,
      openingBalance: Math.round(openingBalance * 100) / 100,
      closingBalance: Math.round(closingBalance * 100) / 100,
      summary: {
        totalCommissions: Math.round(summary.totalCommissions * 100) / 100,
        totalWithdrawals: Math.round(summary.totalWithdrawals * 100) / 100,
        totalRefunds: Math.round(summary.totalRefunds * 100) / 100,
        netAmount: Math.round(summary.netAmount * 100) / 100,
      },
      transactions: transactions.map((tx) => ({
        transactionId: tx.transactionId,
        type: tx.type,
        amount: Math.round(tx.amount * 100) / 100,
        orderId: tx.orderId?.toString(),
        couponCode: tx.couponCode,
        description: tx.description,
        createdAt: tx.createdAt,
      })),
      couponBreakdown: Array.from(couponMap.values()).map((c) => ({
        ...c,
        totalCommission: Math.round(c.totalCommission * 100) / 100,
      })),
    };
  }
}

