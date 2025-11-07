import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiNotFoundResponse
} from '@nestjs/swagger';
import { CartService } from './cart.service';
import { GuestAddItemDto, GuestPreviewDto, GuestUpdateItemDto, DeviceDto } from './dto/cart.dto';

@ApiTags('سلة-الزوار')
@Controller('cart/guest')
export class GuestCartController {
  constructor(private svc: CartService) {}

  @Get()
  @ApiOperation({
    summary: 'الحصول على سلة الزائر',
    description: 'الحصول على سلة التسوق للزائر غير المسجل باستخدام معرف الجهاز. لا يتطلب مصادقة.',
    tags: ['سلة الزوار']
  })
  @ApiQuery({
    name: 'deviceId',
    description: 'معرف الجهاز الفريد للزائر',
    example: 'device_123456789',
    required: true
  })
  @ApiOkResponse({
    description: 'تم الحصول على سلة الزائر بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            deviceId: { type: 'string', example: 'device_123456789' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', example: '507f1f77bcf86cd799439013' },
                  variantId: { type: 'string', example: '507f1f77bcf86cd799439014' },
                  quantity: { type: 'number', example: 2 },
                  product: { type: 'object' },
                  variant: { type: 'object' }
                }
              }
            },
            totalItems: { type: 'number', example: 3 },
            totalPrice: { type: 'number', example: 599.98 },
            currency: { type: 'string', example: 'SAR' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'معرف الجهاز مطلوب' })
  async get(@Query('deviceId') deviceId: string) {
    const data = await this.svc.getGuestCart(deviceId);
    return { data };
  }

  @Post('items')
  @ApiOperation({
    summary: 'إضافة عنصر إلى سلة الزائر',
    description: 'إضافة منتج إلى سلة التسوق للزائر غير المسجل. لا يتطلب مصادقة.',
    tags: ['سلة الزوار']
  })
  @ApiBody({ type: GuestAddItemDto })
  @ApiOkResponse({
    description: 'تم إضافة العنصر إلى السلة بنجاح',
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
            variant: { type: 'object' }
          }
        }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'معرف المنتج أو الكمية غير صحيحة' })
  async add(@Body() dto: GuestAddItemDto) {
    const data = await this.svc.addGuestItem(dto);
    return { data };
  }

  @Patch('items/:itemId')
  @ApiOperation({
    summary: 'تحديث كمية عنصر في سلة الزائر',
    description: 'تحديث كمية عنصر محدد في سلة التسوق للزائر غير المسجل.',
    tags: ['سلة الزوار']
  })
  @ApiParam({
    name: 'itemId',
    description: 'معرف العنصر في السلة',
    example: '507f1f77bcf86cd799439013'
  })
  @ApiBody({ type: GuestUpdateItemDto })
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
  @ApiBadRequestResponse({ description: 'كمية غير صحيحة أو معرف الجهاز مطلوب' })
  async update(@Param('itemId') itemId: string, @Body() dto: GuestUpdateItemDto) {
    const data = await this.svc.updateGuestItem(dto.deviceId, itemId, dto.qty);
    return { data };
  }

  @Delete('items/:itemId')
  @ApiOperation({
    summary: 'إزالة عنصر من سلة الزائر',
    description: 'إزالة عنصر محدد من سلة التسوق للزائر غير المسجل.',
    tags: ['سلة الزوار']
  })
  @ApiParam({
    name: 'itemId',
    description: 'معرف العنصر في السلة',
    example: '507f1f77bcf86cd799439013'
  })
  @ApiBody({ type: DeviceDto })
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
  @ApiBadRequestResponse({ description: 'معرف الجهاز مطلوب' })
  async remove(@Param('itemId') itemId: string, @Body() dto: DeviceDto) {
    const data = await this.svc.removeGuestItem(dto.deviceId, itemId);
    return { data };
  }

  @Post('clear')
  @ApiOperation({
    summary: 'مسح سلة الزائر',
    description: 'مسح جميع العناصر من سلة التسوق للزائر غير المسجل.',
    tags: ['سلة الزوار']
  })
  @ApiBody({ type: DeviceDto })
  @ApiOkResponse({
    description: 'تم مسح السلة بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'تم مسح السلة بنجاح' },
            itemsRemoved: { type: 'number', example: 5 }
          }
        }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'معرف الجهاز مطلوب' })
  async clear(@Body() dto: DeviceDto) {
    const data = await this.svc.clearGuestCart(dto.deviceId);
    return { data };
  }

  @Post('preview')
  @ApiOperation({
    summary: 'معاينة سلة الزائر',
    description: 'معاينة سلة التسوق للزائر مع حساب التكاليف والضرائب لعملة محددة.',
    tags: ['سلة الزوار']
  })
  @ApiBody({ type: GuestPreviewDto })
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
            currency: { type: 'string', example: 'SAR' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string', example: 'منتج تجريبي' },
                  quantity: { type: 'number', example: 2 },
                  price: { type: 'number', example: 250.00 }
                }
              }
            }
          }
        }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'معرف الجهاز أو العملة غير صحيحة' })
  async preview(@Body() dto: GuestPreviewDto) {
    const data = await this.svc.previewGuest(dto.deviceId, dto.currency, 'any');
    return { data };
  }
}
