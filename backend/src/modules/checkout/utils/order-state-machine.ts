import { OrderStatus } from '../schemas/order.schema';

/**
 * Order State Machine - نظام إدارة حالات الطلبات
 * يضمن الانتقالات الصحيحة بين حالات الطلب
 */

export interface StateTransition {
  from: OrderStatus;
  to: OrderStatus;
  allowed: boolean;
  description: string;
  requiresAdmin?: boolean;
  requiresPayment?: boolean;
}

export interface StateValidation {
  isValid: boolean;
  reason?: string;
  nextStates: OrderStatus[];
  canCancel: boolean;
  canRefund: boolean;
}

/**
 * State Machine للطلبات - نظام مبسط
 */
export class OrderStateMachine {
  private static readonly TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.PENDING_PAYMENT]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED, OrderStatus.OUT_OF_STOCK],
    [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.ON_HOLD, OrderStatus.CANCELLED],
    [OrderStatus.PROCESSING]: [OrderStatus.COMPLETED, OrderStatus.RETURNED, OrderStatus.ON_HOLD, OrderStatus.CANCELLED],
    [OrderStatus.COMPLETED]: [],
    [OrderStatus.ON_HOLD]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
    [OrderStatus.CANCELLED]: [],
    [OrderStatus.RETURNED]: [OrderStatus.REFUNDED],
    [OrderStatus.REFUNDED]: [],
    [OrderStatus.OUT_OF_STOCK]: [OrderStatus.PENDING_PAYMENT, OrderStatus.CANCELLED],
  };

  private static readonly TERMINAL_STATES: OrderStatus[] = [
    OrderStatus.COMPLETED,
    OrderStatus.CANCELLED,
    OrderStatus.REFUNDED,
    OrderStatus.RETURNED,
  ];

  private static readonly ADMIN_ONLY_STATES: OrderStatus[] = [
    OrderStatus.PROCESSING,
    OrderStatus.COMPLETED,
    OrderStatus.ON_HOLD,
    OrderStatus.REFUNDED,
    OrderStatus.RETURNED,
  ];

  private static readonly PAYMENT_REQUIRED_STATES: OrderStatus[] = [
    OrderStatus.CONFIRMED,
    OrderStatus.PROCESSING,
    OrderStatus.COMPLETED,
  ];

  /**
   * التحقق من إمكانية الانتقال بين الحالات
   */
  static canTransition(from: OrderStatus, to: OrderStatus): boolean {
    return this.TRANSITIONS[from]?.includes(to) || false;
  }

  /**
   * الحصول على الحالات التالية المسموحة
   */
  static getNextStates(current: OrderStatus): OrderStatus[] {
    return this.TRANSITIONS[current] || [];
  }

  /**
   * التحقق من كون الحالة نهائية
   */
  static isTerminalState(status: OrderStatus): boolean {
    return this.TERMINAL_STATES.includes(status);
  }

  /**
   * التحقق من كون الحالة نشطة
   */
  static isActiveState(status: OrderStatus): boolean {
    return !this.isTerminalState(status);
  }

  /**
   * التحقق من كون الحالة تتطلب صلاحيات إدارية
   */
  static requiresAdmin(status: OrderStatus): boolean {
    return this.ADMIN_ONLY_STATES.includes(status);
  }

  /**
   * التحقق من كون الحالة تتطلب دفع
   */
  static requiresPayment(status: OrderStatus): boolean {
    return this.PAYMENT_REQUIRED_STATES.includes(status);
  }

  /**
   * التحقق من إمكانية الإلغاء
   */
  static canCancel(status: OrderStatus): boolean {
    return [
      OrderStatus.PENDING_PAYMENT,
      OrderStatus.CONFIRMED,
      OrderStatus.PROCESSING,
      OrderStatus.ON_HOLD,
      OrderStatus.OUT_OF_STOCK,
    ].includes(status);
  }

  /**
   * التحقق من إمكانية الاسترداد
   */
  static canRefund(status: OrderStatus): boolean {
    return [
      OrderStatus.COMPLETED,
      OrderStatus.RETURNED,
    ].includes(status);
  }

  /**
   * التحقق من إمكانية التقييم
   */
  static canRate(status: OrderStatus): boolean {
    return [
      OrderStatus.COMPLETED,
    ].includes(status);
  }

  /**
   * التحقق من صحة الانتقال مع التفاصيل
   */
  static validateTransition(
    from: OrderStatus, 
    to: OrderStatus, 
    isAdmin: boolean = false
  ): StateValidation {
    const isValid = this.canTransition(from, to);
    const nextStates = this.getNextStates(from);
    const canCancel = this.canCancel(from);
    const canRefund = this.canRefund(from);

    let reason: string | undefined;

    if (!isValid) {
      reason = `لا يمكن الانتقال من ${from} إلى ${to}`;
    } else if (this.requiresAdmin(to) && !isAdmin) {
      reason = `الحالة ${to} تتطلب صلاحيات إدارية`;
    }

    return {
      isValid,
      reason,
      nextStates,
      canCancel,
      canRefund,
    };
  }

  /**
   * الحصول على مسار الانتقال الموصى به
   */
  static getRecommendedPath(current: OrderStatus): OrderStatus[] {
    const paths: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING_PAYMENT]: [OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.COMPLETED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.COMPLETED],
      [OrderStatus.PROCESSING]: [OrderStatus.COMPLETED],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.ON_HOLD]: [OrderStatus.PROCESSING, OrderStatus.COMPLETED],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.RETURNED]: [OrderStatus.REFUNDED],
      [OrderStatus.REFUNDED]: [],
      [OrderStatus.OUT_OF_STOCK]: [OrderStatus.PENDING_PAYMENT, OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.COMPLETED],
    };

    return paths[current] || [];
  }

  /**
   * الحصول على معلومات الحالة
   */
  static getStateInfo(status: OrderStatus) {
    const stateInfo: Record<OrderStatus, { title: string; description: string; icon: string; color: string }> = {
      [OrderStatus.PENDING_PAYMENT]: { title: 'في انتظار الدفع', description: 'انتظار تأكيد الدفع', icon: '⏳', color: 'yellow' },
      [OrderStatus.CONFIRMED]: { title: 'مؤكد', description: 'تم تأكيد الطلب والدفع', icon: '✅', color: 'green' },
      [OrderStatus.PROCESSING]: { title: 'قيد التجهيز', description: 'الطلب قيد التحضير', icon: '📦', color: 'blue' },
      [OrderStatus.COMPLETED]: { title: 'مكتمل', description: 'الطلب مكتمل بنجاح', icon: '✨', color: 'emerald' },
      [OrderStatus.ON_HOLD]: { title: 'معلق', description: 'الطلب معلق مؤقتاً', icon: '⏸️', color: 'orange' },
      [OrderStatus.CANCELLED]: { title: 'ملغي', description: 'تم إلغاء الطلب', icon: '❌', color: 'red' },
      [OrderStatus.RETURNED]: { title: 'مرتجع', description: 'تم إرجاع الطلب', icon: '↩️', color: 'orange' },
      [OrderStatus.REFUNDED]: { title: 'مسترد', description: 'تم استرداد المبلغ', icon: '💰', color: 'yellow' },
      [OrderStatus.OUT_OF_STOCK]: { title: 'غير متوفر', description: 'المخزون غير متوفر', icon: '📭', color: 'red' },
    };

    return stateInfo[status];
  }

  /**
   * الحصول على جميع الانتقالات الممكنة
   */
  static getAllTransitions(): StateTransition[] {
    const transitions: StateTransition[] = [];

    for (const [from, toStates] of Object.entries(this.TRANSITIONS)) {
      for (const to of toStates) {
        transitions.push({
          from: from as OrderStatus,
          to: to as OrderStatus,
          allowed: true,
          description: `الانتقال من ${from} إلى ${to}`,
          requiresAdmin: this.requiresAdmin(to as OrderStatus),
          requiresPayment: this.requiresPayment(to as OrderStatus),
        });
      }
    }

    return transitions;
  }
}
