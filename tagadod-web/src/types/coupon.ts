export interface Coupon {
  id: string
  code: string
  discount: number
  discountType: 'percentage' | 'fixed'
  minOrderAmount?: number
  maxDiscount?: number
  expiresAt?: string
  isActive: boolean
}

export interface CouponValidation {
  valid: boolean
  coupon?: Coupon
  discount?: number
  message?: string
}
