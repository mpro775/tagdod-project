import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import { 
  ApiBearerAuth, 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiParam,
  ApiBody,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiNotFoundResponse,
  ApiCreatedResponse
} from '@nestjs/swagger';
import { CheckoutService } from './checkout.service';
import { CheckoutConfirmDto, CheckoutPreviewDto, WebhookDto } from './dto/checkout.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../../shared/guards/admin.guard';

@ApiTags('checkout')
@Controller()
export class CheckoutController {
  constructor(private svc: CheckoutService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('checkout/preview')
  @ApiOperation({ 
    summary: 'Preview checkout',
    description: 'Preview order details, pricing, and delivery options before confirmation'
  })
  @ApiBody({ type: CheckoutPreviewDto })
  @ApiOkResponse({ 
    description: 'Checkout preview generated successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            items: { type: 'array', items: { type: 'object' } },
            subtotal: { type: 'number', example: 599.98 },
            shipping: { type: 'number', example: 25.00 },
            tax: { type: 'number', example: 62.50 },
            total: { type: 'number', example: 687.48 },
            currency: { type: 'string', example: 'USD' },
            deliveryOptions: { type: 'array', items: { type: 'object' } }
          }
        }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid cart or currency' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT token' })
  async preview(@Req() req: { user: { sub: string } }, @Body() dto: CheckoutPreviewDto) {
    const data = await this.svc.preview(req.user.sub, dto.currency);
    return { data };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('checkout/confirm')
  @ApiOperation({ 
    summary: 'Confirm checkout',
    description: 'Confirm and process the checkout with payment and delivery details'
  })
  @ApiBody({ type: CheckoutConfirmDto })
  @ApiCreatedResponse({ 
    description: 'Order created successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            orderId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            orderNumber: { type: 'string', example: 'ORD-2024-001' },
            status: { type: 'string', example: 'PENDING' },
            totalAmount: { type: 'number', example: 687.48 },
            currency: { type: 'string', example: 'USD' },
            paymentUrl: { type: 'string', example: 'https://payment.example.com/checkout/...' },
            estimatedDelivery: { type: 'string', example: '2024-01-20T00:00:00Z' }
          }
        }
      }
    }
  })
  @ApiBadRequestResponse({ description: 'Invalid payment method or delivery address' })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT token' })
  async confirm(@Req() req: { user: { sub: string } }, @Body() dto: CheckoutConfirmDto) {
    const data = await this.svc.confirm(
      req.user.sub,
      dto.currency,
      dto.paymentMethod,
      dto.paymentProvider,
      dto.deliveryAddressId,
    );
    return { data };
  }

  // Public webhook
  @Post('payments/webhook')
  async webhook(@Body() dto: WebhookDto) {
    const res = await this.svc.handleWebhook(dto.intentId, dto.status, dto.amount, dto.signature);
    return res;
  }

  // Orders (user)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('orders')
  async myOrders(@Req() req: { user: { sub: string } }) {
    const items = await this.svc.listMy(req.user.sub);
    return { data: items };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('orders/:id')
  async myOrder(@Req() req: { user: { sub: string } }, @Param('id') id: string) {
    const item = await this.svc.getMy(req.user.sub, id);
    return { data: item };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('orders/:id/cancel')
  async cancel(@Req() req: { user: { sub: string } }, @Param('id') id: string) {
    const res = await this.svc.userCancel(req.user.sub, id);
    return { data: res };
  }

  // Admin
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/orders')
  async adminList() {
    const items = await this.svc.adminList();
    return { data: items };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('admin/orders/:id/status')
  async adminSet(
    @Param('id') id: string,
    @Body() body: { status: 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'COMPLETED' },
  ) {
    const res = await this.svc.adminSetStatus(id, body.status);
    return { data: res };
  }
}
