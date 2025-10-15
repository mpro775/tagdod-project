import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Request as ExpressRequest } from 'express';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { CouponsService } from './coupons.service';
import {
  CreateCouponDto,
  UpdateCouponDto,
  ListCouponsDto,
  BulkGenerateCouponsDto,
} from './dto/coupon.dto';

@ApiTags('admin-coupons')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR)
@Controller('admin/coupons')
export class CouponsAdminController {
  constructor(private readonly couponsService: CouponsService) {}

  private getUserId(req: ExpressRequest): string | undefined {
    return (req as unknown as { user?: { userId?: string } }).user?.userId;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new coupon' })
  async createCoupon(@Body() dto: CreateCouponDto, @Req() req: ExpressRequest) {
    const coupon = await this.couponsService.createCoupon(dto, this.getUserId(req));
    return {
      success: true,
      message: 'Coupon created successfully',
      data: coupon,
    };
  }

  @Get()
  @ApiOperation({ summary: 'List all coupons with filters' })
  async listCoupons(@Query() dto: ListCouponsDto) {
    const result = await this.couponsService.listCoupons(dto);
    return {
      success: true,
      data: result.coupons,
      pagination: result.pagination,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get coupon by ID' })
  async getCoupon(@Param('id') id: string) {
    const coupon = await this.couponsService.getCouponById(id);
    return {
      success: true,
      data: coupon,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update coupon' })
  async updateCoupon(
    @Param('id') id: string,
    @Body() dto: UpdateCouponDto,
    @Req() req: ExpressRequest,
  ) {
    const coupon = await this.couponsService.updateCoupon(id, dto, this.getUserId(req));
    return {
      success: true,
      message: 'Coupon updated successfully',
      data: coupon,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete coupon (soft delete)' })
  async deleteCoupon(@Param('id') id: string, @Req() req: ExpressRequest) {
    await this.couponsService.deleteCoupon(id, this.getUserId(req));
    return {
      success: true,
      message: 'Coupon deleted successfully',
    };
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Toggle coupon active/inactive status' })
  async toggleStatus(@Param('id') id: string) {
    const coupon = await this.couponsService.toggleStatus(id);
    return {
      success: true,
      message: `Coupon ${coupon.status === 'active' ? 'activated' : 'deactivated'} successfully`,
      data: coupon,
    };
  }

  @Post('bulk-generate')
  @ApiOperation({ summary: 'Bulk generate coupons' })
  async bulkGenerate(@Body() dto: BulkGenerateCouponsDto, @Req() req: ExpressRequest) {
    const coupons = await this.couponsService.bulkGenerateCoupons(dto, this.getUserId(req));
    return {
      success: true,
      message: `Successfully generated ${coupons.length} coupons`,
      data: coupons,
    };
  }

  @Get(':id/analytics')
  @ApiOperation({ summary: 'Get coupon analytics and statistics' })
  async getAnalytics(@Param('id') id: string) {
    const analytics = await this.couponsService.getCouponAnalytics(id);
    return {
      success: true,
      data: analytics,
    };
  }

  @Get(':id/usage-history')
  @ApiOperation({ summary: 'Get coupon usage history' })
  async getUsageHistory(@Param('id') id: string) {
    const coupon = await this.couponsService.getCouponById(id);
    return {
      success: true,
      data: {
        code: coupon.code,
        usageHistory: coupon.usageHistory || [],
        currentUses: coupon.currentUses,
        maxTotalUses: coupon.maxTotalUses,
      },
    };
  }
}

