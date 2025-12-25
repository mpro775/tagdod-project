import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  Req,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Inject, forwardRef, Logger } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { User, UserRole, CapabilityStatus, UserStatus } from '../schemas/user.schema';
import { EngineerProfile } from '../schemas/engineer-profile.schema';
import { UploadService } from '../../upload/upload.service';
import {
  SubmitVerificationDto,
  SubmitMerchantVerificationDto,
} from '../dto/submit-verification.dto';
import { UserNotFoundException, InvalidFileTypeException } from '../../../shared/exceptions';
import { NotificationService } from '../../notifications/services/notification.service';
import {
  NotificationType,
  NotificationChannel,
  NotificationPriority,
  NotificationCategory,
  NotificationNavigationType,
} from '../../notifications/enums/notification.enums';

@ApiTags('تحقق-المستخدمين')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users/verification')
export class UserVerificationController {
  private readonly logger = new Logger(UserVerificationController.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(EngineerProfile.name) private engineerProfileModel: Model<EngineerProfile>,
    private uploadService: UploadService,
    @Inject(forwardRef(() => NotificationService))
    private notificationService?: NotificationService,
  ) {}

  @Post('submit')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'رفع وثائق التحقق',
    description: 'رفع ملف السيرة الذاتية للمهندس أو صورة المحل للتاجر مع ملاحظة اختيارية',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'الملف المطلوب رفعه (CV للمهندس، صورة المحل للتاجر)',
        },
        storeName: {
          type: 'string',
          description: 'اسم المحل (مطلوب للتاجر فقط)',
          example: 'محل الأجهزة الكهربائية',
        },
        note: {
          type: 'string',
          description: 'ملاحظة اختيارية',
          example: 'ملاحظة إضافية حول طلب التحقق',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'تم رفع الوثائق بنجاح وتم تحديث الحالة إلى قيد المراجعة',
  })
  @ApiResponse({
    status: 400,
    description: 'بيانات غير صحيحة أو نوع الملف غير مدعوم',
  })
  @ApiResponse({
    status: 403,
    description: 'المستخدم ليس مهندساً أو تاجراً أو تم التحقق مسبقاً',
  })
  async submitVerification(
    @UploadedFile() file: { buffer: Buffer; originalname: string; mimetype: string; size: number },
    @Body() dto: SubmitVerificationDto & { storeName?: string },
    @Req() req: { user: { sub: string } },
  ) {
    const userId = req.user.sub;

    // الحصول على المستخدم
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UserNotFoundException({ userId });
    }

    // التحقق من وجود الملف
    if (!file) {
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'FILE_REQUIRED',
            message: 'الملف مطلوب',
          },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // تحديد نوع المستخدم ونوع الملف المطلوب
    const isEngineer = user.roles?.includes(UserRole.ENGINEER) || user.engineer_capable;
    const isMerchant = user.roles?.includes(UserRole.MERCHANT) || user.merchant_capable;

    // التحقق من أن المستخدم مهندس أو تاجر
    if (!isEngineer && !isMerchant) {
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'NOT_ENGINEER_OR_MERCHANT',
            message: 'يجب أن تكون مهندساً أو تاجراً لرفع وثائق التحقق',
          },
        },
        HttpStatus.FORBIDDEN,
      );
    }

    // التحقق من أن الحالة صحيحة (UNVERIFIED)
    if (isEngineer && user.engineer_status !== CapabilityStatus.UNVERIFIED) {
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'ALREADY_VERIFIED',
            message: 'تم التحقق من حسابك بالفعل أو طلب التحقق قيد المراجعة',
          },
        },
        HttpStatus.FORBIDDEN,
      );
    }

    if (isMerchant && user.merchant_status !== CapabilityStatus.UNVERIFIED) {
      throw new HttpException(
        {
          success: false,
          error: {
            code: 'ALREADY_VERIFIED',
            message: 'تم التحقق من حسابك بالفعل أو طلب التحقق قيد المراجعة',
          },
        },
        HttpStatus.FORBIDDEN,
      );
    }

    // التحقق من نوع الملف
    if (isEngineer) {
      // للمهندس: CV (PDF, DOC, DOCX فقط)
      const allowedCvTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ];
      if (!allowedCvTypes.includes(file.mimetype)) {
        throw new InvalidFileTypeException({
          type: file.mimetype,
          allowedTypes: allowedCvTypes,
          message: 'نوع الملف غير مدعوم. يجب أن يكون السيرة الذاتية بصيغة PDF أو DOC أو DOCX',
        });
      }
    } else if (isMerchant) {
      // للتاجر: صورة المحل (أي صورة)
      if (!file.mimetype.startsWith('image/')) {
        throw new InvalidFileTypeException({
          type: file.mimetype,
          allowedTypes: ['image/*'],
          message: 'نوع الملف غير مدعوم. يجب أن تكون صورة المحل بصيغة صورة',
        });
      }

      // التحقق من اسم المحل للتاجر
      const merchantDto = dto as SubmitMerchantVerificationDto;
      if (!merchantDto.storeName || merchantDto.storeName.trim().length === 0) {
        throw new HttpException(
          {
            success: false,
            error: {
              code: 'STORE_NAME_REQUIRED',
              message: 'اسم المحل مطلوب للتاجر',
            },
          },
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    // رفع الملف إلى Bunny.net
    const folder = isEngineer ? 'verification/engineers' : 'verification/merchants';
    const uploadResult = await this.uploadService.uploadFile(file, folder);

    // تحديث بيانات المستخدم
    if (isEngineer) {
      // تحديث بروفايل المهندس
      let profile = await this.engineerProfileModel.findOne({
        userId: user._id,
      });

      if (!profile) {
        // إنشاء بروفايل جديد إذا لم يكن موجوداً
        profile = new this.engineerProfileModel({
          userId: user._id,
          cvFileUrl: uploadResult.url,
          ratings: [],
          totalRatings: 0,
          averageRating: 0,
          ratingDistribution: [0, 0, 0, 0, 0],
          totalCompletedServices: 0,
          totalEarnings: 0,
          walletBalance: 0,
          commissionTransactions: [],
        });
      } else {
        profile.cvFileUrl = uploadResult.url;
      }

      await profile.save();

      user.verificationNote = dto.note;
      user.engineer_status = CapabilityStatus.PENDING;
    } else if (isMerchant) {
      const merchantDto = dto as SubmitMerchantVerificationDto;
      user.storePhotoUrl = uploadResult.url;
      user.storeName = merchantDto.storeName;
      user.verificationNote = dto.note;
      user.merchant_status = CapabilityStatus.PENDING;
    }

    await user.save();

    // إرسال إشعار للأدمن بوجود طلب توثيق جديد
    if (this.notificationService) {
      const verificationType = isEngineer ? 'engineer' : 'merchant';
      const typeLabel = isEngineer ? 'مهندس' : 'تاجر';
      const userName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.phone;

      try {
        // جلب جميع الأدمن النشطين
        const admins = await this.userModel
          .find({
            roles: { $in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
            status: UserStatus.ACTIVE,
          })
          .select('_id')
          .lean();

        // إرسال إشعار لكل أدمن
        const notificationPromises = admins.map((admin) =>
          this.notificationService!.createNotification({
            recipientId: admin._id.toString(),
            type: NotificationType.VERIFICATION_REQUEST_PENDING,
            title: `طلب توثيق جديد - ${typeLabel}`,
            message: `تم رفع طلب توثيق جديد من ${userName} (${typeLabel}). يرجى مراجعته.`,
            messageEn: `New verification request from ${userName} (${verificationType}). Please review.`,
            channel: NotificationChannel.DASHBOARD,
            priority: NotificationPriority.HIGH,
            category: NotificationCategory.ACCOUNT,
            data: {
              userId: userId,
              verificationType: verificationType,
              userName: userName,
              userPhone: user.phone,
            },
            navigationType: NotificationNavigationType.SECTION,
            navigationTarget: '/users/verification-requests',
            isSystemGenerated: true,
          }),
        );

        await Promise.all(notificationPromises);
        this.logger.log(`Sent verification request notification to ${admins.length} admin(s)`);
      } catch (err) {
        this.logger.error('Failed to send verification request notification to admins', err);
      }
    }

    return {
      success: true,
      message: 'تم رفع الوثائق بنجاح وتم إرسال طلب التحقق للمراجعة',
      data: {
        status: 'pending',
        fileUrl: uploadResult.url,
      },
    };
  }
}
