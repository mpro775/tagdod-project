import {
  Controller,
  Get,
  Put,
  Patch,
  Post,
  Delete,
  Param,
  Body,
  Query,
  Req,
  UseGuards,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';
import { UserRole } from '../schemas/user.schema';
import { EngineerProfileService } from '../services/engineer-profile.service';
import {
  UpdateEngineerProfileAdminDto,
  ManageWalletDto,
  SyncStatsDto,
} from './dto/engineer-profile-admin.dto';
import { GetRatingsQueryDto } from '../dto/engineer-profile.dto';
import { UserNotFoundException } from '../../../shared/exceptions';
import { AuditService } from '../../../shared/services/audit.service';

@ApiTags('إدارة-بروفايل-المهندس')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin/users/:userId/engineer-profile')
export class EngineerProfileAdminController {
  private readonly logger = new Logger(EngineerProfileAdminController.name);

  constructor(
    private readonly engineerProfileService: EngineerProfileService,
    private readonly auditService: AuditService,
  ) {}

  @RequirePermissions('users.read', 'admin.access')
  @Get()
  @ApiOperation({
    summary: 'جلب بروفايل مهندس (إداري)',
    description: 'جلب بروفايل مهندس كامل مع جميع المعلومات والإحصائيات والرصيد',
  })
  @ApiParam({ name: 'userId', description: 'معرف المستخدم (المهندس)' })
  @ApiResponse({ status: 200, description: 'تم جلب البروفايل بنجاح' })
  @ApiResponse({ status: 404, description: 'المهندس غير موجود' })
  async getEngineerProfile(@Param('userId') userId: string) {
    const profile = await this.engineerProfileService.getProfile(userId, true);
    if (!profile) {
      throw new UserNotFoundException({ userId, message: 'بروفايل المهندس غير موجود' });
    }
    return profile;
  }

  @RequirePermissions('users.update', 'admin.access')
  @Put()
  @ApiOperation({
    summary: 'تحديث بروفايل مهندس (إداري)',
    description: 'تحديث معلومات بروفايل المهندس بواسطة الأدمن',
  })
  @ApiParam({ name: 'userId', description: 'معرف المستخدم (المهندس)' })
  @ApiResponse({ status: 200, description: 'تم تحديث البروفايل بنجاح' })
  @ApiResponse({ status: 404, description: 'المهندس غير موجود' })
  async updateEngineerProfile(
    @Param('userId') userId: string,
    @Body() dto: UpdateEngineerProfileAdminDto,
    @Req() req: { user: { sub: string } } & Request,
  ) {
    const profile = await this.engineerProfileService.getProfile(userId, false);
    if (!profile) {
      throw new UserNotFoundException({ userId, message: 'بروفايل المهندس غير موجود' });
    }

    const oldValues = {
      bio: profile.bio,
      avatarUrl: profile.avatarUrl,
      whatsappNumber: profile.whatsappNumber,
      jobTitle: profile.jobTitle,
      specialties: profile.specialties,
      yearsOfExperience: profile.yearsOfExperience,
      certifications: profile.certifications,
    };

    const updatedProfile = await this.engineerProfileService.updateProfile(userId, dto);

    // تسجيل الحدث في audit log
    this.auditService
      .logUserEvent({
        userId,
        action: 'updated',
        performedBy: req.user.sub,
        oldValues,
        newValues: { ...dto } as Record<string, unknown>,
        reason: 'تحديث بروفايل المهندس',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      })
      .catch((err) => this.logger.error('Failed to log engineer profile update', err));

    return updatedProfile;
  }

  @RequirePermissions('users.read', 'admin.access')
  @Get('ratings')
  @ApiOperation({
    summary: 'جلب تقييمات مهندس (إداري)',
    description: 'جلب تقييمات مهندس مع خيارات التصفية والترتيب',
  })
  @ApiParam({ name: 'userId', description: 'معرف المستخدم (المهندس)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['recent', 'top', 'oldest'] })
  @ApiQuery({ name: 'minScore', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'تم جلب التقييمات بنجاح' })
  async getEngineerRatings(@Param('userId') userId: string, @Query() query: GetRatingsQueryDto) {
    return this.engineerProfileService.getRatings(userId, {
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      minScore: query.minScore,
    });
  }

  @RequirePermissions('users.update', 'admin.access')
  @Delete('ratings/:ratingId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'حذف تقييم مهندس (إداري)',
    description: 'حذف تقييم محدد من بروفايل المهندس',
  })
  @ApiParam({ name: 'userId', description: 'معرف المستخدم (المهندس)' })
  @ApiParam({ name: 'ratingId', description: 'معرف التقييم' })
  @ApiResponse({ status: 200, description: 'تم حذف التقييم بنجاح' })
  @ApiResponse({ status: 404, description: 'التقييم غير موجود' })
  async deleteRating(
    @Param('userId') userId: string,
    @Param('ratingId') ratingId: string,
    @Req() req: { user: { sub: string } } & Request,
  ) {
    const profile = await this.engineerProfileService.getProfile(userId, false);
    if (!profile) {
      throw new UserNotFoundException({ userId, message: 'بروفايل المهندس غير موجود' });
    }

    const ratingIndex = profile.ratings.findIndex(
      (r) => r.serviceRequestId?.toString() === ratingId || r.orderId?.toString() === ratingId,
    );

    if (ratingIndex === -1) {
      throw new UserNotFoundException({ userId: ratingId, message: 'التقييم غير موجود' });
    }

    const deletedRating = profile.ratings[ratingIndex];
    profile.ratings.splice(ratingIndex, 1);
    profile.calculateRatings();
    await profile.save();

    // تسجيل الحدث في audit log
    this.auditService
      .logUserEvent({
        userId,
        action: 'updated',
        performedBy: req.user.sub,
        oldValues: {
          ratingId,
          score: deletedRating.score,
          comment: deletedRating.comment,
        },
        reason: 'حذف تقييم من بروفايل المهندس',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      })
      .catch((err) => this.logger.error('Failed to log rating deletion', err));

    return { success: true, message: 'تم حذف التقييم بنجاح' };
  }

  @RequirePermissions('users.update', 'admin.access')
  @Patch('wallet')
  @ApiOperation({
    summary: 'إدارة رصيد المهندس (إداري)',
    description: 'إضافة أو خصم أو سحب رصيد من حساب المهندس',
  })
  @ApiParam({ name: 'userId', description: 'معرف المستخدم (المهندس)' })
  @ApiResponse({ status: 200, description: 'تم تحديث الرصيد بنجاح' })
  @ApiResponse({ status: 404, description: 'المهندس غير موجود' })
  @ApiResponse({ status: 400, description: 'الرصيد غير كافي للخصم/السحب' })
  async manageWallet(
    @Param('userId') userId: string,
    @Body() dto: ManageWalletDto,
    @Req() req: { user: { sub: string } } & Request,
  ) {
    let profile = await this.engineerProfileService.getProfile(userId, false);
    if (!profile) {
      profile = await this.engineerProfileService.createProfile(userId);
    }

    const oldBalance = profile.walletBalance || 0;
    let newBalance = oldBalance;

    switch (dto.type) {
      case 'add':
        newBalance = oldBalance + dto.amount;
        break;
      case 'deduct':
        if (oldBalance < dto.amount) {
          throw new Error('الرصيد غير كافي للخصم');
        }
        newBalance = oldBalance - dto.amount;
        break;
      case 'withdraw':
        if (oldBalance < dto.amount) {
          throw new Error('الرصيد غير كافي للسحب');
        }
        newBalance = oldBalance - dto.amount;
        break;
    }

    profile.walletBalance = newBalance;

    // إضافة سجل المعاملة
    profile.commissionTransactions = profile.commissionTransactions || [];
    profile.commissionTransactions.push({
      transactionId: `ADMIN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: dto.type === 'add' ? 'commission' : dto.type === 'withdraw' ? 'withdrawal' : 'refund',
      amount: dto.type === 'add' ? dto.amount : -dto.amount,
      description: `${dto.reason} (بواسطة الأدمن)`,
      createdAt: new Date(),
    });

    await profile.save();

    // تسجيل الحدث في audit log
    this.auditService
      .logUserEvent({
        userId,
        action: 'updated',
        performedBy: req.user.sub,
        oldValues: { walletBalance: oldBalance },
        newValues: {
          walletBalance: newBalance,
          operation: dto.type,
          amount: dto.amount,
          reason: dto.reason,
        } as Record<string, unknown>,
        reason: `إدارة رصيد المهندس: ${dto.type === 'add' ? 'إضافة' : dto.type === 'deduct' ? 'خصم' : 'سحب'} ${dto.amount}`,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      })
      .catch((err) => this.logger.error('Failed to log wallet management', err));

    return {
      success: true,
      message: `تم ${dto.type === 'add' ? 'إضافة' : dto.type === 'deduct' ? 'خصم' : 'سحب'} الرصيد بنجاح`,
      data: {
        oldBalance,
        newBalance,
        amount: dto.amount,
        type: dto.type,
      },
    };
  }

  @RequirePermissions('users.read', 'admin.access')
  @Get('transactions')
  @ApiOperation({
    summary: 'جلب سجل معاملات المهندس (إداري)',
    description: 'جلب سجل جميع المعاملات المالية للمهندس',
  })
  @ApiParam({ name: 'userId', description: 'معرف المستخدم (المهندس)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'تم جلب المعاملات بنجاح' })
  async getTransactions(
    @Param('userId') userId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    const profile = await this.engineerProfileService.getProfile(userId, false);
    if (!profile) {
      throw new UserNotFoundException({ userId, message: 'بروفايل المهندس غير موجود' });
    }

    const transactions = profile.commissionTransactions || [];
    const pageNum = page || 1;
    const limitNum = limit || 20;
    const startIndex = (pageNum - 1) * limitNum;
    const paginatedTransactions = transactions
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(startIndex, startIndex + limitNum);

    return {
      transactions: paginatedTransactions,
      total: transactions.length,
      page: pageNum,
      limit: limitNum,
      walletBalance: profile.walletBalance || 0,
    };
  }

  @RequirePermissions('users.update', 'admin.access')
  @Post('sync-stats')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'مزامنة إحصائيات المهندس (إداري)',
    description: 'مزامنة إحصائيات المهندس من قاعدة البيانات الفعلية',
  })
  @ApiParam({ name: 'userId', description: 'معرف المستخدم (المهندس)' })
  @ApiResponse({ status: 200, description: 'تمت المزامنة بنجاح' })
  async syncStats(
    @Param('userId') userId: string,
    @Body() dto: SyncStatsDto,
    @Req() req: { user: { sub: string } } & Request,
  ) {
    const profile = await this.engineerProfileService.getProfile(userId, false);
    if (!profile) {
      throw new UserNotFoundException({ userId, message: 'بروفايل المهندس غير موجود' });
    }

    if (dto.syncRatings !== false) {
      await this.engineerProfileService.syncRatings(userId);
    }

    if (dto.syncStatistics !== false) {
      await this.engineerProfileService.updateStatistics(userId);
    }

    const updatedProfile = await this.engineerProfileService.getProfile(userId, true);

    // تسجيل الحدث في audit log
    this.auditService
      .logUserEvent({
        userId,
        action: 'updated',
        performedBy: req.user.sub,
        newValues: {
          syncRatings: dto.syncRatings !== false,
          syncStatistics: dto.syncStatistics !== false,
        } as Record<string, unknown>,
        reason: 'مزامنة إحصائيات المهندس',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      })
      .catch((err) => this.logger.error('Failed to log stats sync', err));

    return {
      success: true,
      message: 'تمت مزامنة الإحصائيات بنجاح',
      data: updatedProfile,
    };
  }
}
