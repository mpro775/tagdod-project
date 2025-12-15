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
  BadRequestException,
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
import { ExchangeRatesService } from '../../exchange-rates/exchange-rates.service';
import { NotificationService } from '../../notifications/services/notification.service';
import {
  NotificationType,
  NotificationChannel,
  NotificationPriority,
  NotificationNavigationType,
  NotificationCategory,
} from '../../notifications/enums/notification.enums';

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
    private readonly exchangeRatesService: ExchangeRatesService,
    private readonly notificationService: NotificationService,
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
    // جلب profile كـ document قابل للتعديل (بدون lean)
    let profile = await this.engineerProfileService.getProfileDocument(userId);
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
          throw new BadRequestException('الرصيد غير كافي للخصم');
        }
        newBalance = oldBalance - dto.amount;
        break;
      case 'withdraw':
        if (oldBalance < dto.amount) {
          throw new BadRequestException('الرصيد غير كافي للسحب');
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

    // إرسال إشعار للمهندس
    try {
      const transactionId = profile.commissionTransactions[profile.commissionTransactions.length - 1].transactionId;

      if (dto.type === 'withdraw') {
        await this.notificationService.createNotification({
          type: NotificationType.ENGINEER_WALLET_WITHDRAWN,
          recipientId: userId,
          title: 'تم سحب مبلغ من رصيدك',
          message: `تم سحب ${dto.amount} USD من رصيدك. الرصيد الحالي: ${newBalance} USD`,
          messageEn: `Withdrawn ${dto.amount} USD from your wallet. Current balance: ${newBalance} USD`,
          channel: NotificationChannel.IN_APP,
          priority: NotificationPriority.HIGH,
          category: NotificationCategory.PAYMENT,
          data: {
            amount: dto.amount,
            oldBalance,
            newBalance,
            transactionId,
            reason: dto.reason,
          },
          navigationType: NotificationNavigationType.SECTION,
          navigationTarget: 'wallet',
          isSystemGenerated: true,
        });
      } else if (dto.type === 'add') {
        await this.notificationService.createNotification({
          type: NotificationType.ENGINEER_WALLET_DEPOSITED,
          recipientId: userId,
          title: 'تم إضافة مبلغ إلى رصيدك',
          message: `تم إضافة ${dto.amount} USD إلى رصيدك. الرصيد الحالي: ${newBalance} USD`,
          messageEn: `Added ${dto.amount} USD to your wallet. Current balance: ${newBalance} USD`,
          channel: NotificationChannel.IN_APP,
          priority: NotificationPriority.HIGH,
          category: NotificationCategory.PAYMENT,
          data: {
            amount: dto.amount,
            oldBalance,
            newBalance,
            transactionId,
            reason: dto.reason,
          },
          navigationType: NotificationNavigationType.SECTION,
          navigationTarget: 'wallet',
          isSystemGenerated: true,
        });
      }
    } catch (notificationError) {
      this.logger.error('Failed to send wallet notification:', notificationError);
      // لا نرمي خطأ هنا حتى لا نؤثر على العملية الأساسية
    }

    // تحويل العملات
    const oldBalanceConverted = await this.convertAmountFromUSD(oldBalance);
    const newBalanceConverted = await this.convertAmountFromUSD(newBalance);
    const amountConverted = await this.convertAmountFromUSD(dto.amount);

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
        oldBalance, // USD (الأصلي - للتوافق مع الكود القديم)
        newBalance, // USD (الأصلي - للتوافق مع الكود القديم)
        amount: dto.amount, // USD (الأصلي - للتوافق مع الكود القديم)
        type: dto.type,
        // إضافة تحويلات العملات
        oldBalanceUSD: oldBalanceConverted.usd,
        oldBalanceYER: oldBalanceConverted.yer,
        oldBalanceSAR: oldBalanceConverted.sar,
        newBalanceUSD: newBalanceConverted.usd,
        newBalanceYER: newBalanceConverted.yer,
        newBalanceSAR: newBalanceConverted.sar,
        amountUSD: amountConverted.usd,
        amountYER: amountConverted.yer,
        amountSAR: amountConverted.sar,
      },
    };
  }

  /**
   * تحويل المبلغ من USD إلى العملات الأخرى
   */
  private async convertAmountFromUSD(amountUSD: number): Promise<{
    usd: number;
    yer: number;
    sar: number;
  }> {
    try {
      const rates = await this.exchangeRatesService.getCurrentRates();
      return {
        usd: amountUSD,
        yer: Math.round(amountUSD * rates.usdToYer),
        sar: Math.round(amountUSD * rates.usdToSar * 100) / 100,
      };
    } catch (error) {
      this.logger.warn('Failed to get exchange rates, using USD only', error);
      // في حالة الخطأ، نعيد USD فقط
      return {
        usd: amountUSD,
        yer: amountUSD,
        sar: amountUSD,
      };
    }
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

    // تحويل العملات لكل معاملة
    const transactionsWithCurrencies = await Promise.all(
      paginatedTransactions.map(async (transaction) => {
        const amountUSD = Math.abs(transaction.amount);
        const converted = await this.convertAmountFromUSD(amountUSD);
        return {
          ...transaction,
          amountUSD: transaction.amount >= 0 ? converted.usd : -converted.usd,
          amountYER: transaction.amount >= 0 ? converted.yer : -converted.yer,
          amountSAR: transaction.amount >= 0 ? converted.sar : -converted.sar,
        };
      }),
    );

    // تحويل العملات للرصيد
    const walletBalanceUSD = profile.walletBalance || 0;
    const walletBalanceConverted = await this.convertAmountFromUSD(walletBalanceUSD);

    return {
      transactions: transactionsWithCurrencies,
      total: transactions.length,
      page: pageNum,
      limit: limitNum,
      walletBalance: walletBalanceUSD, // USD (الأصلي - للتوافق مع الكود القديم)
      walletBalanceUSD: walletBalanceConverted.usd,
      walletBalanceYER: walletBalanceConverted.yer,
      walletBalanceSAR: walletBalanceConverted.sar,
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
