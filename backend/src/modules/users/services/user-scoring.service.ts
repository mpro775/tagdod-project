import { Injectable } from '@nestjs/common';

export interface ScoringConfig {
  loyalty: {
    orderWeight: number;
    completedOrderWeight: number;
    maxScore: number;
  };
  value: {
    spendingThreshold: number;
    scorePerThreshold: number;
    maxScore: number;
  };
  activity: {
    orderWeight: number;
    noSupportBonus: number;
    maxScore: number;
  };
  support: {
    ticketPenalty: number;
    maxScore: number;
  };
}

export interface UserStats {
  totalOrders: number;
  completedOrders: number;
  totalSpent: number;
  supportTickets: number;
  openSupportTickets: number;
}

export interface UserScore {
  loyaltyScore: number;
  valueScore: number;
  activityScore: number;
  supportScore: number;
  overallScore: number;
  rank: number;
}

@Injectable()
export class UserScoringService {
  private config: ScoringConfig = {
    loyalty: {
      orderWeight: 10,
      completedOrderWeight: 15,
      maxScore: 100,
    },
    value: {
      spendingThreshold: 1000,
      scorePerThreshold: 10,
      maxScore: 100,
    },
    activity: {
      orderWeight: 5,
      noSupportBonus: 20,
      maxScore: 100,
    },
    support: {
      ticketPenalty: 20,
      maxScore: 100,
    },
  };

  /**
   * حساب نقاط الولاء
   */
  calculateLoyaltyScore(stats: UserStats): number {
    const { totalOrders, completedOrders } = stats;
    const { orderWeight, completedOrderWeight, maxScore } = this.config.loyalty;
    
    const score = (totalOrders * orderWeight) + (completedOrders * completedOrderWeight);
    return Math.min(score, maxScore);
  }

  /**
   * حساب نقاط القيمة المالية
   */
  calculateValueScore(stats: UserStats): number {
    const { totalSpent } = stats;
    const { spendingThreshold, scorePerThreshold, maxScore } = this.config.value;
    
    const score = (totalSpent / spendingThreshold) * scorePerThreshold;
    return Math.min(score, maxScore);
  }

  /**
   * حساب نقاط النشاط
   */
  calculateActivityScore(stats: UserStats): number {
    const { totalOrders, supportTickets } = stats;
    const { orderWeight, noSupportBonus, maxScore } = this.config.activity;
    
    let score = totalOrders * orderWeight;
    
    // مكافأة عدم وجود تذاكر دعم
    if (supportTickets === 0) {
      score += noSupportBonus;
    }
    
    return Math.min(score, maxScore);
  }

  /**
   * حساب نقاط خدمة العملاء
   */
  calculateSupportScore(stats: UserStats): number {
    const { supportTickets, openSupportTickets } = stats;
    const { ticketPenalty, maxScore } = this.config.support;
    
    if (supportTickets === 0) {
      return maxScore;
    }
    
    const score = maxScore - (openSupportTickets * ticketPenalty);
    return Math.max(score, 0);
  }

  /**
   * حساب النقاط الإجمالية
   */
  calculateOverallScore(stats: UserStats): number {
    const loyaltyScore = this.calculateLoyaltyScore(stats);
    const valueScore = this.calculateValueScore(stats);
    const activityScore = this.calculateActivityScore(stats);
    const supportScore = this.calculateSupportScore(stats);
    
    return (loyaltyScore + valueScore + activityScore + supportScore) / 4;
  }

  /**
   * حساب النقاط الكاملة للمستخدم
   */
  calculateUserScore(stats: UserStats, rank: number = 0): UserScore {
    return {
      loyaltyScore: this.calculateLoyaltyScore(stats),
      valueScore: this.calculateValueScore(stats),
      activityScore: this.calculateActivityScore(stats),
      supportScore: this.calculateSupportScore(stats),
      overallScore: this.calculateOverallScore(stats),
      rank,
    };
  }

  /**
   * حساب نقاط العميل (للتقييم السريع)
   */
  calculateCustomerScore(totalSpent: number, totalOrders: number): number {
    const valueScore = Math.min(50, (totalSpent / 1000) * 25);
    const loyaltyScore = Math.min(50, totalOrders * 5);
    return Math.round(valueScore + loyaltyScore);
  }

  /**
   * تحديث إعدادات التقييم
   */
  updateConfig(newConfig: Partial<ScoringConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * الحصول على إعدادات التقييم الحالية
   */
  getConfig(): ScoringConfig {
    return { ...this.config };
  }
}
