import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PricingService, CartItem } from './pricing.service';

@ApiTags('pricing')
@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Get('variant/:variantId')
  @ApiOperation({ summary: 'Get price for a variant with applicable promotions' })
  async getVariantPrice(
    @Param('variantId') variantId: string,
    @Query('currency') currency: string = 'YER',
    @Query('quantity') quantity?: string,
    @Query('accountType') accountType?: string,
    @Query('couponCode') couponCode?: string,
  ) {
    const result = await this.pricingService.calculateVariantPrice({
      variantId,
      currency,
      quantity: quantity ? parseInt(quantity) : 1,
      accountType,
      couponCode,
    });

    return {
      success: true,
      data: result,
    };
  }

  @Post('cart')
  @ApiOperation({ summary: 'Calculate total for cart with promotions' })
  async calculateCart(
    @Body()
    body: {
      items: CartItem[];
      currency: string;
      accountType?: string;
      couponCode?: string;
    },
  ) {
    const result = await this.pricingService.calculateCartPricing(
      body.items,
      body.currency,
      undefined, // userId - can be added from auth
      body.accountType,
      body.couponCode,
    );

    return {
      success: true,
      data: result,
    };
  }

  @Get('coupon/:code')
  @ApiOperation({ summary: 'Validate a coupon code' })
  async validateCoupon(@Param('code') code: string) {
    const result = await this.pricingService.validateCoupon(code);

    return {
      success: result.valid,
      data: result.valid ? result.promotion : null,
      message: result.message,
    };
  }
}
