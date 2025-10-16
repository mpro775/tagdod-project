import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { CartService } from './cart.service';

@ApiTags('admin-carts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin/carts')
export class AdminCartController {
  constructor(private readonly cartService: CartService) {}

  @Get('abandoned')
  @ApiOperation({ summary: 'Get abandoned carts' })
  async getAbandonedCarts(
    @Query('hours') hours: string = '24',
    @Query('limit') limit: string = '50',
  ) {
    const hoursInactive = parseInt(hours);
    const carts = await this.cartService.findAbandonedCarts(hoursInactive);

    // Apply limit
    const limitNum = parseInt(limit);
    const limitedCarts = carts.slice(0, limitNum);

    // Calculate total value
    type CartLean = { pricingSummary?: { total?: number } };
    const totalValue = limitedCarts.reduce(
      (sum, cart: CartLean) => sum + (cart.pricingSummary?.total || 0),
      0,
    );

    return {
      success: true,
      data: limitedCarts,
      count: limitedCarts.length,
      totalCarts: carts.length,
      totalValue,
    };
  }

  @Post('send-reminders')
  @ApiOperation({ summary: 'Send abandonment reminders to all abandoned carts' })
  async sendReminders() {
    const result = await this.cartService.processAbandonedCarts();

    return {
      success: true,
      message: `Sent ${result.emailsSent} reminder emails`,
      data: result,
    };
  }

  @Post(':id/send-reminder')
  @ApiOperation({ summary: 'Send abandonment reminder for specific cart' })
  async sendSingleReminder(@Param('id') cartId: string) {
    const result = await this.cartService.sendAbandonmentReminder(cartId);

    return {
      success: true,
      message: 'Reminder sent successfully',
      data: result,
    };
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get comprehensive cart analytics' })
  async getAnalytics(@Query('period') period: string = '30') {
    const analytics = await this.cartService.getCartAnalytics(parseInt(period));
    return {
      success: true,
      data: analytics,
    };
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get cart statistics overview' })
  async getStatistics() {
    const stats = await this.cartService.getCartStatistics();
    return {
      success: true,
      data: stats,
    };
  }

  @Get('conversion-rates')
  @ApiOperation({ summary: 'Get cart conversion rates' })
  async getConversionRates(@Query('period') period: string = '30') {
    const rates = await this.cartService.getConversionRates(parseInt(period));
    return {
      success: true,
      data: rates,
    };
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all carts with pagination and filters' })
  async getAllCarts(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('status') status?: string,
    @Query('userId') userId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const filters = {
      status: status as any,
      userId,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
    };

    const result = await this.cartService.getAllCarts(
      parseInt(page),
      parseInt(limit),
      filters,
    );

    return {
      success: true,
      data: result.carts,
      pagination: result.pagination,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get cart details by ID' })
  async getCartById(@Param('id') cartId: string) {
    const cart = await this.cartService.getCartById(cartId);
    return {
      success: true,
      data: cart,
    };
  }

  @Post(':id/convert-to-order')
  @ApiOperation({ summary: 'Manually convert cart to order' })
  async convertToOrder(@Param('id') cartId: string) {
    const result = await this.cartService.convertToOrder(cartId);
    return {
      success: true,
      message: 'Cart converted to order successfully',
      data: result,
    };
  }

  @Get('recovery-campaigns')
  @ApiOperation({ summary: 'Get cart recovery campaign analytics' })
  async getRecoveryCampaigns(@Query('period') period: string = '30') {
    const analytics = await this.cartService.getRecoveryCampaignAnalytics(parseInt(period));
    return {
      success: true,
      data: analytics,
    };
  }

  @Get('customer-behavior')
  @ApiOperation({ summary: 'Get customer behavior analytics' })
  async getCustomerBehavior(@Query('period') period: string = '30') {
    const analytics = await this.cartService.getCustomerBehaviorAnalytics(parseInt(period));
    return {
      success: true,
      data: analytics,
    };
  }

  @Get('revenue-impact')
  @ApiOperation({ summary: 'Get revenue impact analysis' })
  async getRevenueImpact(@Query('period') period: string = '30') {
    const analytics = await this.cartService.getRevenueImpactAnalytics(parseInt(period));
    return {
      success: true,
      data: analytics,
    };
  }

  @Post('bulk-actions')
  @ApiOperation({ summary: 'Perform bulk actions on carts' })
  async performBulkActions(@Body() body: { action: string; cartIds: string[] }) {
    const result = await this.cartService.performBulkActions(body.action, body.cartIds);
    return {
      success: true,
      message: `Bulk action completed: ${result.processed} carts processed`,
      data: result,
    };
  }
}

