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
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR)
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
    const totalValue = limitedCarts.reduce(
      (sum, cart: any) => sum + (cart.pricingSummary?.total || 0),
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
  @ApiOperation({ summary: 'Get cart analytics' })
  async getAnalytics(@Query('period') period: string = '7d') {
    // Simple analytics for now
    // Can be enhanced later
    return {
      success: true,
      message: 'Analytics feature - to be implemented',
      data: {
        note: 'Use abandoned carts endpoint for basic analytics',
      },
    };
  }
}

