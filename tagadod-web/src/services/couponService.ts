import { api } from './api'
import type { CouponValidation } from '../types/coupon'
import type { ApiResponse } from '../types/common'

export async function validateCoupon(code: string): Promise<CouponValidation> {
  const { data } = await api.get<ApiResponse<CouponValidation>>('/marketing/coupons/validate', {
    params: { code },
  })
  return data.data
}
