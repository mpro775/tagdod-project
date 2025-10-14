import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CouponsService } from './coupons.service';
import { ValidateCouponDto } from './dto/coupon.dto';

@ApiTags('coupons')
@Controller('coupons')
export class CouponsPublicController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post('validate')
  @ApiOperation({ summary: 'Validate a coupon code (Public - no auth required)' })
  async validateCoupon(@Body() dto: ValidateCouponDto) {
    const result = await this.couponsService.validateCoupon(dto);

    if (!result.valid) {
      // Track failed attempt
      await this.couponsService.incrementFailedAttempts(dto.code);
    }

    return {
      success: result.valid,
      data: result.valid
        ? {
            coupon: {
              code: result.coupon!.code,
              title: result.coupon!.title,
              description: result.coupon!.description,
              type: result.coupon!.type,
              discountPercentage: result.coupon!.discountPercentage,
              discountAmount: result.coupon!.discountAmount,
            },
            calculatedDiscount: result.calculatedDiscount,
            finalAmount: result.finalAmount,
          }
        : null,
      message: result.message,
    };
  }

  @Get('public')
  @ApiOperation({ summary: 'Get all public coupons (no auth required)' })
  async getPublicCoupons() {
    const coupons = await this.couponsService.getPublicCoupons();
    return {
      success: true,
      data: coupons,
    };
  }

  @Get('auto-apply')
  @ApiOperation({ summary: 'Get auto-apply coupons for user (no auth required)' })
  async getAutoApplyCoupons(
    @Query('userId') userId?: string,
    @Query('accountType') accountType?: string,
  ) {
    const coupons = await this.couponsService.getAutoApplyCoupons(userId, accountType);
    return {
      success: true,
      data: coupons,
    };
  }

  @Get('code/:code')
  @ApiOperation({ summary: 'Get coupon details by code (no auth required)' })
  async getCouponByCode(@Param('code') code: string) {
    const coupon = await this.couponsService.getCouponByCode(code);

    if (!coupon) {
      return {
        success: false,
        message: 'Coupon not found',
      };
    }

    return {
      success: true,
      data: {
        code: coupon.code,
        title: coupon.title,
        description: coupon.description,
        type: coupon.type,
        discountPercentage: coupon.discountPercentage,
        discountAmount: coupon.discountAmount,
        minOrderAmount: coupon.minOrderAmount,
        startDate: coupon.startDate,
        endDate: coupon.endDate,
      },
    };
  }
}

