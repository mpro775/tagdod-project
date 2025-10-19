import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { AddItemDto, UpdateItemDto, DeviceDto, PreviewDto, UpdateCartSettingsDto, ApplyCouponDto } from './dto/cart.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('cart')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('cart')
export class CartController {
  constructor(private svc: CartService) {}

  @Get()
  @ApiOperation({
    summary: 'Get user cart',
    description: 'Retrieves the current user shopping cart with all items',
  })
  @ApiOkResponse({
    description: 'Cart retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            userId: { type: 'string', example: '507f1f77bcf86cd799439012' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: '507f1f77bcf86cd799439013' },
                  variantId: { type: 'string', example: '507f1f77bcf86cd799439014' },
                  quantity: { type: 'number', example: 2 },
                  product: { type: 'object' },
                  variant: { type: 'object' },
                },
              },
            },
            totalItems: { type: 'number', example: 3 },
            totalPrice: { type: 'number', example: 599.98 },
            currency: { type: 'string', example: 'USD' },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT token' })
  async get(@Req() req: { user: { sub: string } }) {
    return { data: await this.svc.getUserCart(req.user.sub) };
  }

  @Post('items')
  @ApiOperation({
    summary: 'Add item to cart',
    description: 'Adds a product variant to the user shopping cart',
  })
  @ApiBody({ type: AddItemDto })
  @ApiOkResponse({
    description: 'Item added to cart successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439013' },
            variantId: { type: 'string', example: '507f1f77bcf86cd799439014' },
            quantity: { type: 'number', example: 2 },
            product: { type: 'object' },
            variant: { type: 'object' },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Invalid variant ID or quantity' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT token' })
  async add(@Req() req: { user: { sub: string } }, @Body() dto: AddItemDto) {
    const data = await this.svc.addUserItem(req.user.sub, dto.variantId, dto.qty);
    return { data };
  }

  @Patch('items/:itemId')
  @ApiOperation({
    summary: 'تحديث كمية عنصر في السلة',
    description: 'تحديث كمية عنصر محدد في سلة التسوق للمستخدم.',
    tags: ['السلة']
  })
  @ApiParam({
    name: 'itemId',
    description: 'معرف العنصر في السلة',
    example: '507f1f77bcf86cd799439013'
  })
  @ApiBody({ type: UpdateItemDto })
  @ApiOkResponse({
    description: 'تم تحديث العنصر بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439013' },
            variantId: { type: 'string', example: '507f1f77bcf86cd799439014' },
            quantity: { type: 'number', example: 3 },
            product: { type: 'object' },
            variant: { type: 'object' }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'العنصر غير موجود في السلة' })
  @ApiBadRequestResponse({ description: 'كمية غير صحيحة' })
  async update(
    @Req() req: { user: { sub: string } },
    @Param('itemId') itemId: string,
    @Body() dto: UpdateItemDto,
  ) {
    const data = await this.svc.updateUserItem(req.user.sub, itemId, dto.qty);
    return { data };
  }

  @Delete('items/:itemId')
  @ApiOperation({
    summary: 'إزالة عنصر من السلة',
    description: 'إزالة عنصر محدد من سلة التسوق للمستخدم.',
    tags: ['السلة']
  })
  @ApiParam({
    name: 'itemId',
    description: 'معرف العنصر في السلة',
    example: '507f1f77bcf86cd799439013'
  })
  @ApiOkResponse({
    description: 'تم إزالة العنصر بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'تم إزالة العنصر من السلة' }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'العنصر غير موجود في السلة' })
  async remove(@Req() req: { user: { sub: string } }, @Param('itemId') itemId: string) {
    const data = await this.svc.removeUserItem(req.user.sub, itemId);
    return { data };
  }

  @Post('merge')
  @ApiOperation({
    summary: 'دمج سلة الأجهزة مع سلة المستخدم',
    description: 'دمج سلة التسوق المحفوظة على الجهاز مع سلة المستخدم المسجل دخوله.',
    tags: ['السلة']
  })
  @ApiBody({ type: DeviceDto })
  @ApiOkResponse({
    description: 'تم دمج السلات بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            merged: { type: 'boolean', example: true },
            itemsAdded: { type: 'number', example: 2 },
            totalItems: { type: 'number', example: 5 }
          }
        }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'معرف الجهاز غير صحيح' })
  async merge(@Req() req: { user: { sub: string } }, @Body() body: DeviceDto) {
    const data = await this.svc.merge(body.deviceId, req.user.sub);
    return { data };
  }

  @Post('preview')
  @ApiOperation({
    summary: 'معاينة السلة',
    description: 'معاينة السلة مع حساب التكاليف والضرائب لعملة محددة.',
    tags: ['السلة']
  })
  @ApiBody({ type: PreviewDto })
  @ApiOkResponse({
    description: 'تم حساب معاينة السلة بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            subtotal: { type: 'number', example: 500.00 },
            tax: { type: 'number', example: 75.00 },
            shipping: { type: 'number', example: 25.00 },
            total: { type: 'number', example: 600.00 },
            currency: { type: 'string', example: 'SAR' }
          }
        }
      }
    }
  })
  async preview(@Req() req: { user: { sub: string } }, @Body() dto: PreviewDto) {
    const data = await this.svc.previewUser(req.user.sub, dto.currency, 'any');
    return { data };
  }

  @Patch('settings')
  @ApiOperation({
    summary: 'تحديث إعدادات السلة',
    description: 'تحديث إعدادات السلة مثل العملة المفضلة وغيرها.',
    tags: ['السلة']
  })
  @ApiBody({ type: UpdateCartSettingsDto })
  @ApiOkResponse({
    description: 'تم تحديث إعدادات السلة بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'تم تحديث إعدادات السلة' }
          }
        }
      }
    }
  })
  async updateSettings(@Req() req: { user: { sub: string } }, @Body() dto: UpdateCartSettingsDto) {
    const data = await this.svc.updateCartSettings(req.user.sub, dto);
    return { data };
  }

  @Post('coupon')
  @ApiOperation({
    summary: 'تطبيق كوبون خصم',
    description: 'تطبيق كوبون خصم على السلة.',
    tags: ['السلة']
  })
  @ApiBody({ type: ApplyCouponDto })
  @ApiOkResponse({
    description: 'تم تطبيق الكوبون بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'تم تطبيق الكوبون بنجاح' },
            discount: { type: 'number', example: 50.00 },
            newTotal: { type: 'number', example: 550.00 }
          }
        }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'كود الكوبون غير صحيح أو منتهي الصلاحية' })
  async applyCoupon(@Req() req: { user: { sub: string } }, @Body() dto: ApplyCouponDto) {
    const data = await this.svc.applyCoupon(req.user.sub, dto.couponCode);
    return { data };
  }

  @Delete('coupon')
  @ApiOperation({
    summary: 'إزالة كوبون الخصم',
    description: 'إزالة الكوبون المطبق من السلة.',
    tags: ['السلة']
  })
  @ApiOkResponse({
    description: 'تم إزالة الكوبون بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'تم إزالة الكوبون من السلة' }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'لا يوجد كوبون مطبق على السلة' })
  async removeCoupon(@Req() req: { user: { sub: string } }) {
    const data = await this.svc.removeCoupon(req.user.sub);
    return { data };
  }
}
