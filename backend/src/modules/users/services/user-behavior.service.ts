import { Injectable } from '@nestjs/common';
import { Order, OrderItem, OrderStatus } from '../../checkout/schemas/order.schema';

export interface UserBehavior {
  preferredPaymentMethod: string;
  averageOrderFrequency: number; // أيام بين الطلبات
  seasonalPatterns: Array<{ month: string; orders: number; amount: number }>;
  productPreferences: Array<{ category: string; percentage: number }>;
}

@Injectable()
export class UserBehaviorService {
  /**
   * تحليل سلوك المستخدم
   */
  analyzeUserBehavior(orders: Order[]): UserBehavior {
    const completedOrders = orders.filter(o => o.status === OrderStatus.COMPLETED);
    
    // طريقة الدفع المفضلة
    const preferredPaymentMethod = this.analyzePaymentMethod(completedOrders);
    
    // تكرار الطلبات
    const averageOrderFrequency = this.calculateOrderFrequency(completedOrders);
    
    // الأنماط الموسمية
    const seasonalPatterns = this.analyzeSeasonalPatterns(completedOrders);
    
    // تفضيلات المنتجات
    const productPreferences = this.analyzeProductPreferences(completedOrders);

    return {
      preferredPaymentMethod,
      averageOrderFrequency,
      seasonalPatterns,
      productPreferences,
    };
  }

  /**
   * تحليل طريقة الدفع المفضلة
   */
  private analyzePaymentMethod(orders: Order[]): string {
    const paymentMethods = new Map<string, number>();
    
    orders.forEach(order => {
      const method = order.paymentMethod || 'COD';
      paymentMethods.set(method, (paymentMethods.get(method) || 0) + 1);
    });
    
    const mostUsed = Array.from(paymentMethods.entries())
      .sort((a, b) => b[1] - a[1])[0];
    
    return mostUsed?.[0] || 'COD';
  }

  /**
   * حساب تكرار الطلبات
   */
  private calculateOrderFrequency(orders: Order[]): number {
    if (orders.length <= 1) {
      return 0;
    }
    
    const firstOrder = orders[orders.length - 1];
    const lastOrder = orders[0];
    const daysDiff = ((lastOrder as Order & { createdAt?: Date }).createdAt?.getTime() || 0) - 
                     ((firstOrder as Order & { createdAt?: Date }).createdAt?.getTime() || 0);
    const daysDiffInDays = daysDiff / (1000 * 60 * 60 * 24);
    
    return daysDiffInDays / (orders.length - 1);
  }

  /**
   * تحليل الأنماط الموسمية
   */
  private analyzeSeasonalPatterns(orders: Order[]): Array<{ month: string; orders: number; amount: number }> {
    const monthlyStats = new Map<string, { orders: number; amount: number }>();
    
    orders.forEach(order => {
      const month = (order as Order & { createdAt?: Date }).createdAt?.toISOString().substring(0, 7) || 
                    new Date().toISOString().substring(0, 7); // YYYY-MM
      const current = monthlyStats.get(month) || { orders: 0, amount: 0 };
      monthlyStats.set(month, {
        orders: current.orders + 1,
        amount: current.amount + order.total,
      });
    });
    
    return Array.from(monthlyStats.entries())
      .map(([month, stats]) => ({ month, ...stats }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }

  /**
   * تحليل تفضيلات المنتجات
   */
  private analyzeProductPreferences(orders: Order[]): Array<{ category: string; percentage: number }> {
    const categoryStats = new Map<string, number>();
    let totalItems = 0;
    
    orders.forEach(order => {
      order.items.forEach((item: OrderItem) => {
        const category = item.snapshot?.categoryName || 'غير محدد';
        categoryStats.set(category, (categoryStats.get(category) || 0) + 1);
        totalItems++;
      });
    });
    
    if (totalItems === 0) {
      return [];
    }
    
    return Array.from(categoryStats.entries())
      .map(([category, count]) => ({
        category,
        percentage: Math.round((count / totalItems) * 100),
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5); // أفضل 5 فئات
  }

  /**
   * تحليل مخاطر فقدان العميل
   */
  analyzeChurnRisk(orders: Order[]): 'low' | 'medium' | 'high' {
    const completedOrders = orders.filter(o => o.status === OrderStatus.COMPLETED);
    
    if (completedOrders.length === 0) {
      return 'high';
    }
    
    const lastOrder = completedOrders[0];
    const daysSinceLastOrder = (Date.now() - ((lastOrder as Order & { createdAt?: Date }).createdAt?.getTime() || Date.now())) / (1000 * 60 * 60 * 24);
    
    if (daysSinceLastOrder > 90) return 'high';
    if (daysSinceLastOrder > 30) return 'medium';
    return 'low';
  }

  /**
   * حساب احتمالية الشراء القادم
   */
  calculateNextPurchaseProbability(orders: Order[], churnRisk: 'low' | 'medium' | 'high'): number {
    const completedOrders = orders.filter(o => o.status === OrderStatus.COMPLETED);
    
    let probability = 1;
    
    // تقليل الاحتمالية حسب عدد الطلبات
    if (completedOrders.length === 0) {
      probability -= 0.5;
    } else {
      probability -= 0.1;
    }
    
    // تقليل الاحتمالية حسب مخاطر الفقدان
    if (churnRisk === 'high') {
      probability -= 0.3;
    } else if (churnRisk === 'medium') {
      probability -= 0.1;
    }
    
    return Math.max(0, Math.min(1, probability));
  }

  /**
   * حساب القيمة المتوقعة للعميل
   */
  calculateEstimatedLifetimeValue(orders: Order[]): number {
    const completedOrders = orders.filter(o => o.status === OrderStatus.COMPLETED);
    const totalSpent = completedOrders.reduce((sum, order) => sum + order.total, 0);
    
    // تقدير بسيط: القيمة الحالية × 1.5
    return totalSpent * 1.5;
  }

  /**
   * توليد التوصيات
   */
  generateRecommendations(orders: Order[], behavior: UserBehavior, churnRisk: 'low' | 'medium' | 'high'): string[] {
    const recommendations: string[] = [];
    
    if (churnRisk === 'high') {
      recommendations.push('تواصل مع العميل لاستعادة الثقة');
    }
    
    if (orders.length === 0) {
      recommendations.push('ارسل عروض ترحيبية');
    }
    
    if (behavior.averageOrderFrequency > 60) {
      recommendations.push('ارسل تذكيرات منتظمة');
    }
    
    if (behavior.preferredPaymentMethod === 'COD') {
      recommendations.push('شجع العميل على استخدام طرق دفع أخرى');
    }
    
    return recommendations;
  }
}
