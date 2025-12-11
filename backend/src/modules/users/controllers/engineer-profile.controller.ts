import { Controller, Get, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { EngineerProfileService } from '../services/engineer-profile.service';
import { UpdateEngineerProfileDto, GetRatingsQueryDto } from '../dto/engineer-profile.dto';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { EngineerGuard } from '../../../shared/guards/engineer.guard';

@ApiTags('بروفايل المهندس')
@Controller('engineers/profile')
export class EngineerProfileController {
  constructor(private readonly engineerProfileService: EngineerProfileService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard, EngineerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'جلب بروفايل المهندس الحالي' })
  @ApiResponse({ status: 200, description: 'تم جلب البروفايل بنجاح' })
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  async getMyProfile(@Request() req: any) {
    const userId = req.user.sub;
    const profile = await this.engineerProfileService.getProfile(userId, true);
    if (!profile) {
      // إنشاء بروفايل جديد إذا لم يكن موجوداً
      return await this.engineerProfileService.createProfile(userId);
    }

    // حذف totalRevenue من إحصائيات الكوبون - هذه المعلومة للإدارة فقط
    const couponData = profile.coupon as any;
    if (couponData?.stats) {
      delete couponData.stats.totalRevenue;
    }

    return profile;
  }

  @Put('me')
  @UseGuards(JwtAuthGuard, EngineerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'تحديث بروفايل المهندس الحالي' })
  @ApiResponse({ status: 200, description: 'تم تحديث البروفايل بنجاح' })
  @ApiResponse({ status: 401, description: 'غير مصرح' })
  async updateMyProfile(@Request() req: any, @Body() dto: UpdateEngineerProfileDto) {
    const userId = req.user.sub;
    return await this.engineerProfileService.updateProfile(userId, dto);
  }

  @Get(':engineerId')
  @ApiOperation({ summary: 'جلب بروفايل مهندس معين' })
  @ApiParam({ name: 'engineerId', description: 'معرف المهندس' })
  @ApiResponse({ status: 200, description: 'تم جلب البروفايل بنجاح' })
  @ApiResponse({ status: 404, description: 'المهندس غير موجود' })
  async getProfile(@Param('engineerId') engineerId: string) {
    const profile = await this.engineerProfileService.getProfile(engineerId, true);
    if (!profile) {
      return { message: 'البروفايل غير موجود' };
    }

    // حذف totalRevenue من إحصائيات الكوبون - هذه المعلومة للإدارة فقط
    const couponData = profile.coupon as any;
    if (couponData?.stats) {
      delete couponData.stats.totalRevenue;
    }

    return profile;
  }

  @Get(':engineerId/ratings')
  @ApiOperation({ summary: 'جلب تقييمات مهندس معين' })
  @ApiParam({ name: 'engineerId', description: 'معرف المهندس' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['recent', 'top', 'oldest'] })
  @ApiQuery({ name: 'minScore', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'تم جلب التقييمات بنجاح' })
  async getRatings(@Param('engineerId') engineerId: string, @Query() query: GetRatingsQueryDto) {
    return await this.engineerProfileService.getRatings(engineerId, {
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      minScore: query.minScore,
    });
  }

  @Get('me/ratings')
  @UseGuards(JwtAuthGuard, EngineerGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'جلب تقييمات المهندس الحالي' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['recent', 'top', 'oldest'] })
  @ApiQuery({ name: 'minScore', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'تم جلب التقييمات بنجاح' })
  async getMyRatings(@Request() req: any, @Query() query: GetRatingsQueryDto) {
    const userId = req.user.sub;
    return await this.engineerProfileService.getRatings(userId, {
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      minScore: query.minScore,
    });
  }
}
