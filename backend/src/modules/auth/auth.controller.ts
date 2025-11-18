import { Body, Controller, Delete, Get, Patch, Post, Req, UseGuards, Logger } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiBadRequestResponse,
  ApiUnauthorizedResponse,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { hash, compare } from 'bcrypt';
import { OtpService } from './otp.service';
import { TokensService } from './tokens.service';
import { SendOtpDto } from './dto/send-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { SetPasswordDto } from './dto/set-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdatePreferredCurrencyDto } from './dto/update-preferred-currency.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { UserLoginDto } from './dto/user-login.dto';
import { BiometricRegisterChallengeDto } from './dto/biometric-register-challenge.dto';
import { BiometricRegisterVerifyDto } from './dto/biometric-register-verify.dto';
import { BiometricLoginChallengeDto } from './dto/biometric-login-challenge.dto';
import { BiometricLoginVerifyDto } from './dto/biometric-login-verify.dto';

import { UserSignupDto } from './dto/user-signup.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole, UserStatus, CapabilityStatus, UserDocument } from '../users/schemas/user.schema';
import { Capabilities } from '../capabilities/schemas/capabilities.schema';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AdminGuard } from '../../shared/guards/admin.guard';
import { RequirePermissions } from '../../shared/decorators/permissions.decorator';
import { 
  InvalidOTPException,
  UserNotFoundException, 
  InvalidPasswordException,
  NoPasswordException,
  SuperAdminExistsException,
  InvalidSecretException,
  NotAllowedInProductionException,
  AuthException,
  ErrorCode 
} from '../../shared/exceptions';
import { FavoritesService } from '../favorites/favorites.service';
import { BiometricService } from './biometric.service';
import { normalizeYemeniPhone } from '../../shared/utils/phone.util';

@ApiTags('المصادقة')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private otp: OtpService,
    private tokens: TokensService,
    private biometric: BiometricService,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Capabilities.name) private capsModel: Model<Capabilities>,
    private favoritesService: FavoritesService,
  ) {}

  private buildAuthResponse(user: UserDocument) {
    const isAdminUser =
      Array.isArray(user.roles) &&
      (user.roles.includes(UserRole.ADMIN) || user.roles.includes(UserRole.SUPER_ADMIN));

    const payload = {
      sub: String(user._id),
      phone: user.phone,
      isAdmin: isAdminUser,
      roles: user.roles || [],
      permissions: user.permissions || [],
      preferredCurrency: user.preferredCurrency || 'USD',
    };

    const access = this.tokens.signAccess(payload);
    const refresh = this.tokens.signRefresh(payload);

    return {
      tokens: { access, refresh },
      me: {
        id: String(user._id),
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        city: user.city,
        jobTitle: user.jobTitle,
        roles: user.roles || [],
        permissions: user.permissions || [],
        isAdmin: isAdminUser,
        preferredCurrency: user.preferredCurrency || 'USD',
        status: user.status,
        // Capability statuses
        customerCapable: user.customer_capable,
        engineerCapable: user.engineer_capable,
        engineerStatus: user.engineer_status,
        merchantCapable: user.merchant_capable,
        merchantStatus: user.merchant_status,
        merchantDiscountPercent: user.merchant_discount_percent,
        adminCapable: user.admin_capable,
        adminStatus: user.admin_status,
      },
    };
  }

  @Post('send-otp')
  @ApiOperation({
    summary: 'إرسال رمز OTP إلى رقم الهاتف',
    description: 'يرسل كلمة مرور لمرة واحدة (OTP) إلى رقم الهاتف المحدد للمصادقة',
  })
  @ApiBody({ type: SendOtpDto })
  @ApiCreatedResponse({
    description: 'تم إرسال رمز OTP بنجاح',
    schema: {
      type: 'object',
      properties: {
        sent: { type: 'boolean', example: true },
        devCode: {
          type: 'string',
          example: '123456',
          description: 'Development code (only in dev environment)',
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'رقم الهاتف أو السياق غير صحيح',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'صيغة رقم الهاتف غير صحيحة' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  async sendOtp(@Body() dto: SendOtpDto) {
    const result = await this.otp.sendOtp(
      dto.phone,
      (dto.context || 'register') as 'register' | 'reset',
    );
    return { sent: result.sent, devCode: result.devCode };
  }

  @Post('verify-otp')
  @ApiOperation({
    summary: 'التحقق من رمز OTP وإتمام التسجيل/الدخول',
    description: 'يتحقق من رمز OTP ويتم عملية تسجيل المستخدم أو دخوله',
  })
  @ApiBody({ type: VerifyOtpDto })
  @ApiCreatedResponse({
    description: 'تم التحقق من رمز OTP بنجاح ومصادقة المستخدم',
    schema: {
      type: 'object',
      properties: {
        tokens: {
          type: 'object',
          properties: {
            access: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            refresh: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          },
        },
        me: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            phone: { type: 'string', example: '+966501234567' },
            preferredCurrency: { type: 'string', example: 'USD' },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'رمز OTP غير صحيح',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'رمز التحقق غير صالح' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'الحقول المطلوبة مفقودة لتسجيل المهندس',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'المسمى الوظيفي مطلوب للمهندسين' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  async verifyOtp(@Body() dto: VerifyOtpDto) {
    // Normalize phone number for OTP verification only (SMS sending)
    // OTP is stored in Redis with normalized phone (+967 format)
    let normalizedPhone: string;
    try {
      normalizedPhone = normalizeYemeniPhone(dto.phone);
    } catch (error) {
      this.logger.error(`Failed to normalize phone number ${dto.phone}:`, error);
      throw new AuthException(ErrorCode.VALIDATION_ERROR, { 
        phone: dto.phone,
        message: error instanceof Error ? error.message : 'رقم الهاتف غير صحيح'
      });
    }

    // Verify OTP using normalized phone (OTP was stored with normalized phone)
    const ok = await this.otp.verifyOtp(normalizedPhone, dto.code, 'register');
    if (!ok) throw new InvalidOTPException({ phone: dto.phone });

    // البحث في قاعدة البيانات بالرقم كما هو (بدون +967) أو بالرقم المحول
    // نبحث بالرقم الأصلي أولاً، ثم بالرقم المحول إذا لم نجد
    let user = await this.userModel.findOne({ phone: dto.phone });
    if (!user) {
      user = await this.userModel.findOne({ phone: normalizedPhone });
    }
    
    // إذا كان المستخدم موجوداً بالفعل، رفض محاولة إنشاء حساب جديد
    if (user) {
      // التحقق من حالة الحساب أولاً
      if (user.status === UserStatus.SUSPENDED || user.status === UserStatus.DELETED) {
        throw new AuthException(ErrorCode.AUTH_USER_BLOCKED, { phone: dto.phone });
      }

      // المستخدم موجود - تفعيل الحساب إذا كان PENDING فقط
      if (user.status === UserStatus.PENDING) {
        user.status = UserStatus.ACTIVE;
        await user.save();
        this.logger.log(`Account activated via OTP verification: ${normalizedPhone}`);
      } else {
        // المستخدم موجود بحالة غير PENDING - رفض محاولة التسجيل
        this.logger.warn(`Registration attempt with existing phone: ${dto.phone} (status: ${user.status})`);
        throw new AuthException(ErrorCode.AUTH_PHONE_EXISTS, { phone: dto.phone });
      }

      // تحديث المسمى الوظيفي إذا كان المستخدم موجوداً ولكن ليس لديه مسمى
      if (dto.capabilityRequest === 'engineer' && dto.jobTitle && !user.jobTitle) {
        user.jobTitle = dto.jobTitle;
        await user.save();
      }
    } else {
      // المستخدم غير موجود - إنشاء حساب جديد
      const userData: {
        phone: string;
        firstName?: string;
        lastName?: string;
        gender?: 'male' | 'female' | 'other';
        city?: string;
        jobTitle?: string;
        engineer_capable?: boolean;
        engineer_status?: string;
        merchant_capable?: boolean;
        merchant_status?: string;
      } = {
        phone: dto.phone,
        firstName: dto.firstName,
        lastName: dto.lastName,
        gender: dto.gender,
        city: dto.city || 'صنعاء',
        jobTitle: dto.capabilityRequest === 'engineer' ? dto.jobTitle : undefined,
      };

      // تحديث User model مباشرة إذا طلب المستخدم أن يكون مهندساً أو تاجراً
      if (dto.capabilityRequest) {
        if (dto.capabilityRequest === 'engineer') {
          userData.engineer_capable = true;
          userData.engineer_status = 'unverified';
        } else if (dto.capabilityRequest === 'merchant') {
          userData.merchant_capable = true;
          userData.merchant_status = 'unverified';
        }
      }

      user = await this.userModel.create({
        ...userData,
        phone: dto.phone, // حفظ الرقم كما هو (بدون +967)
        status: UserStatus.ACTIVE, // تفعيل الحساب بعد التحقق من OTP
      });
      
      // إنشاء capabilities للمستخدم
      await this.capsModel.create({
        userId: user._id,
        customer_capable: true,
        engineer_capable: user.engineer_capable || false,
        engineer_status: user.engineer_status || 'none',
        merchant_capable: user.merchant_capable || false,
        merchant_status: user.merchant_status || 'none',
        merchant_discount_percent: 0,
      });
    }

    // مزامنة المفضلات تلقائياً عند التسجيل
    if (dto.deviceId) {
      try {
        await this.favoritesService.syncGuestToUser(dto.deviceId, String(user._id));
      } catch (error) {
        // نتجاهل الأخطاء في المزامنة لأنها ليست حرجة
        this.logger.error('Favorites sync error:', error);
      }
    }

    // حساب صلاحية الأدمن من الأدوار
    const isAdminUser =
      Array.isArray(user.roles) &&
      (user.roles.includes(UserRole.ADMIN) || user.roles.includes(UserRole.SUPER_ADMIN));

    const payload = {
      sub: String(user._id),
      phone: user.phone,
      isAdmin: isAdminUser,
      roles: user.roles || [],
      permissions: user.permissions || [],
      preferredCurrency: user.preferredCurrency || 'USD',
    };
    const access = this.tokens.signAccess(payload);
    const refresh = this.tokens.signRefresh(payload);
    return {
      tokens: { access, refresh },
      me: {
        id: user._id,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        city: user.city,
        jobTitle: user.jobTitle,
        roles: user.roles || [],
        permissions: user.permissions || [],
        isAdmin: isAdminUser,
        preferredCurrency: user.preferredCurrency || 'USD',
        status: user.status,
        // Capability statuses
        customerCapable: user.customer_capable,
        engineerCapable: user.engineer_capable,
        engineerStatus: user.engineer_status,
        merchantCapable: user.merchant_capable,
        merchantStatus: user.merchant_status,
        merchantDiscountPercent: user.merchant_discount_percent,
        adminCapable: user.admin_capable,
        adminStatus: user.admin_status,
      },
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('set-password')
  async setPassword(@Req() req: { user: { sub: string } }, @Body() dto: SetPasswordDto) {
    const hashedPassword = await hash(dto.password, 10);
    await this.userModel.updateOne({ _id: req.user.sub }, { $set: { passwordHash: hashedPassword } });
    return { updated: true };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('preferred-currency')
  async updatePreferredCurrency(
    @Req() req: { user: { sub: string } },
    @Body() dto: UpdatePreferredCurrencyDto,
  ) {
    const user = await this.userModel.findByIdAndUpdate(
      req.user.sub,
      { $set: { preferredCurrency: dto.currency } },
      { new: true },
    );

    if (!user) {
      throw new UserNotFoundException();
    }

    return {
      updated: true,
      preferredCurrency: user.preferredCurrency,
    };
  }

  @Post('forgot-password') async forgot(@Body() dto: ForgotPasswordDto) {
    this.logger.log(`Forgot password request for phone: ${dto.phone}`);

    // Normalize phone number for OTP sending (SMS requires +967 format)
    let normalizedPhone: string;
    try {
      normalizedPhone = normalizeYemeniPhone(dto.phone);
    } catch (error) {
      this.logger.error(`Failed to normalize phone number ${dto.phone}:`, error);
      throw new AuthException(ErrorCode.VALIDATION_ERROR, { 
        phone: dto.phone,
        message: error instanceof Error ? error.message : 'رقم الهاتف غير صحيح'
      });
    }

    // البحث في قاعدة البيانات بالرقم كما هو (بدون +967) أو بالرقم المحول
    let user = await this.userModel.findOne({ phone: dto.phone });
    if (!user) {
      user = await this.userModel.findOne({ phone: normalizedPhone });
    }

    if (!user) {
      this.logger.warn(`Forgot password failed - user not found: ${dto.phone}`);
      throw new UserNotFoundException();
    }

    // Send OTP via SMS (requires normalized phone)
    const result = await this.otp.sendOtp(normalizedPhone, 'reset');
    this.logger.log(`OTP sent for password reset to ${normalizedPhone}`);
    
    return { sent: result.sent, devCode: result.devCode };
  }

  @Post('reset-password') async reset(@Body() dto: ResetPasswordDto) {
    this.logger.log(`Reset password request for phone: ${dto.phone}`);

    // Normalize phone number for OTP verification only (OTP was stored with normalized phone)
    let normalizedPhone: string;
    try {
      normalizedPhone = normalizeYemeniPhone(dto.phone);
    } catch (error) {
      this.logger.error(`Failed to normalize phone number ${dto.phone}:`, error);
      throw new AuthException(ErrorCode.VALIDATION_ERROR, { 
        phone: dto.phone,
        message: error instanceof Error ? error.message : 'رقم الهاتف غير صحيح'
      });
    }

    // Verify OTP using normalized phone (OTP was stored with normalized phone)
    const ok = await this.otp.verifyOtp(normalizedPhone, dto.code, 'reset');
    if (!ok) {
      this.logger.warn(`Reset password failed - invalid OTP for ${dto.phone}`);
      throw new InvalidOTPException({ phone: dto.phone });
    }

    // البحث في قاعدة البيانات بالرقم كما هو (بدون +967) أو بالرقم المحول
    let user = await this.userModel.findOne({ phone: dto.phone });
    if (!user) {
      user = await this.userModel.findOne({ phone: normalizedPhone });
    }
    if (!user) {
      this.logger.warn(`Reset password failed - user not found: ${dto.phone}`);
      throw new UserNotFoundException();
    }

    // Update password
    const hashedPassword = await hash(dto.newPassword, 10);
    await this.userModel.updateOne({ _id: user._id }, { $set: { passwordHash: hashedPassword } });
    this.logger.log(`Password reset successful for ${normalizedPhone}`);
    
    return { updated: true };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({
    summary: 'الحصول على ملف المستخدم الحالي',
    description: 'يسترد ملف المستخدم المصادق عليه الحالي وقدراته',
  })
  @ApiOkResponse({
    description: 'تم استرداد ملف المستخدم بنجاح',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            phone: { type: 'string', example: '+966501234567' },
            firstName: { type: 'string', example: 'أحمد' },
            lastName: { type: 'string', example: 'محمد' },
            gender: { type: 'string', example: 'male', enum: ['male', 'female'] },
            jobTitle: { type: 'string', example: 'مهندس كهرباء' },
            isAdmin: { type: 'boolean', example: false },
          },
        },
        capabilities: {
          type: 'object',
          properties: {
            customer_capable: { type: 'boolean', example: true },
            engineer_capable: { type: 'boolean', example: false },
            merchant_capable: { type: 'boolean', example: false },
          },
        },
      },
    },
  })
  @ApiUnauthorizedResponse({ description: 'Invalid or missing JWT token' })
  async me(@Req() req: { user: { sub: string } }) {
    const user = await this.userModel.findById(req.user.sub);
    const caps = await this.capsModel.findOne({ userId: req.user.sub }).lean();

    // حساب صلاحية الأدمن من الأدوار
    const isAdminUser =
      Array.isArray(user!.roles) &&
      (user!.roles.includes(UserRole.ADMIN) || user!.roles.includes(UserRole.SUPER_ADMIN));

    return {
      user: {
        id: user!._id,
        phone: user!.phone,
        firstName: user!.firstName,
        lastName: user!.lastName,
        gender: user!.gender,
        city: user!.city,
        jobTitle: user!.jobTitle,
        roles: user!.roles || [],
        permissions: user!.permissions || [],
        isAdmin: isAdminUser,
        preferredCurrency: user!.preferredCurrency || 'USD',
        status: user!.status,
        // Capability statuses
        customerCapable: user!.customer_capable,
        engineerCapable: user!.engineer_capable,
        engineerStatus: user!.engineer_status,
        merchantCapable: user!.merchant_capable,
        merchantStatus: user!.merchant_status,
        merchantDiscountPercent: user!.merchant_discount_percent,
        adminCapable: user!.admin_capable,
        adminStatus: user!.admin_status,
      },
      capabilities: caps,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  @ApiOperation({
    summary: 'تحديث الملف الشخصي',
    description: 'تحديث بيانات الملف الشخصي للمستخدم الحالي',
  })
  @ApiBody({ type: UpdateProfileDto })
  @ApiOkResponse({
    description: 'تم تحديث الملف الشخصي بنجاح',
    schema: {
      type: 'object',
      properties: {
        updated: { type: 'boolean', example: true },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'بيانات غير صحيحة' })
  @ApiUnauthorizedResponse({ description: 'غير مصرح لك' })
  async updateMe(
    @Req() req: { user: { sub: string } },
    @Body() body: UpdateProfileDto,
  ) {
    const allowed = ['firstName', 'lastName', 'gender', 'city', 'jobTitle'] as const;
    const $set: { firstName?: string; lastName?: string; gender?: string; city?: string; jobTitle?: string } = {};
    for (const k of allowed) if (body[k] !== undefined) $set[k] = body[k];
    await this.userModel.updateOne({ _id: req.user.sub }, { $set });
    return { updated: true };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('me')
  @ApiOperation({
    summary: 'حذف الحساب',
    description: 'حذف حساب المستخدم (Soft Delete) مع إدخال السبب',
  })
  @ApiBody({ type: DeleteAccountDto })
  @ApiOkResponse({
    description: 'تم حذف الحساب بنجاح',
    schema: {
      type: 'object',
      properties: {
        deleted: { type: 'boolean', example: true },
        message: { type: 'string', example: 'تم حذف حسابك بنجاح' },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'بيانات غير صحيحة أو السبب مفقود' })
  @ApiUnauthorizedResponse({ description: 'غير مصرح لك' })
  async deleteMe(
    @Req() req: { user: { sub: string } },
    @Body() deleteAccountDto: DeleteAccountDto,
  ) {
    const userId = req.user.sub;

    // التحقق من وجود المستخدم
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UserNotFoundException({ userId });
    }

    // التحقق من أن الحساب لم يتم حذفه مسبقاً
    if (user.deletedAt || user.status === UserStatus.DELETED) {
      throw new AuthException(ErrorCode.AUTH_USER_DELETED, { userId });
    }

    // Soft Delete - تحديث البيانات بدلاً من الحذف الفعلي
    user.deletedAt = new Date();
    user.deletedBy = userId; // المستخدم حذف حسابه بنفسه
    user.deletionReason = deleteAccountDto.reason;
    user.status = UserStatus.DELETED;

    await user.save();

    // حذف capabilities أيضاً
    await this.capsModel.deleteOne({ userId });

    return {
      deleted: true,
      message: 'تم حذف حسابك بنجاح',
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @RequirePermissions('capabilities.read', 'admin.access')
  @Get('admin/pending')
  async pending() {
    // البحث في User model مباشرة للحصول على الطلبات قيد المراجعة
    const list = await this.userModel
      .find({
        $or: [
          { engineer_status: 'pending' },
          { merchant_status: 'pending' },
        ],
        deletedAt: null,
      })
      .select('phone firstName lastName engineer_status merchant_status cvFileUrl storePhotoUrl storeName verificationNote createdAt')
      .sort({ createdAt: -1 })
      .lean();
    return { items: list };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @RequirePermissions('capabilities.update', 'admin.access')
  @Post('admin/approve')
  async approve(
    @Body()
    body: {
      userId: string;
      capability: 'engineer' | 'merchant';
      approve: boolean;
      merchantDiscountPercent?: number; // نسبة الخصم للتاجر (0-100)
    },
  ) {
    const caps = await this.capsModel.findOne({ userId: body.userId });
    if (!caps) throw new AuthException(ErrorCode.AUTH_CAPS_NOT_FOUND, { userId: body.userId });

    if (body.capability === 'engineer') {
      caps.engineer_status = body.approve ? 'approved' : 'rejected';
      caps.engineer_capable = body.approve;
    }

    if (body.capability === 'merchant') {
      caps.merchant_status = body.approve ? 'approved' : 'rejected';
      caps.merchant_capable = body.approve;

      // تعيين نسبة الخصم عند الموافقة على التاجر
      if (body.approve) {
        if (
          body.merchantDiscountPercent === undefined ||
          body.merchantDiscountPercent < 0 ||
          body.merchantDiscountPercent > 100
        ) {
          throw new AuthException(ErrorCode.AUTH_INVALID_DISCOUNT, { discount: body.merchantDiscountPercent });
        }
        caps.merchant_discount_percent = body.merchantDiscountPercent;
      } else {
        // إزالة الخصم عند الرفض
        caps.merchant_discount_percent = 0;
      }
    }

    await caps.save();
    return { updated: true };
  }

  // ==================== إنشاء الادمن الرئيسي (للاستخدام الأولي فقط) ====================
  @Post('create-super-admin')
  async createSuperAdmin(@Body() body: { secretKey: string }) {
    // منع الوصول في بيئة الإنتاج لأسباب أمنية
    if (process.env.NODE_ENV === 'production') {
      throw new NotAllowedInProductionException();
    }

    // التحقق من المفتاح السري (يجب أن يكون في متغيرات البيئة)
    const expectedSecret = process.env.SUPER_ADMIN_SECRET || 'TAGADODO_SUPER_ADMIN_2024';
    if (body.secretKey !== expectedSecret) {
      throw new InvalidSecretException();
    }

    // التحقق من وجود ادمن رئيسي بالفعل
    const existingSuperAdmin = await this.userModel.findOne({
      roles: { $in: [UserRole.SUPER_ADMIN] },
    });

    if (existingSuperAdmin) {
      throw new SuperAdminExistsException();
    }

    // بيانات الادمن الرئيسي
    const superAdminData = {
      phone: '777777777',
      firstName: 'Super',
      lastName: 'Admin',
      gender: 'male' as const,
      jobTitle: 'System Administrator',
      passwordHash: await hash('Admin123!@#', 10),
      roles: [UserRole.SUPER_ADMIN],
      permissions: [
        'users.create',
        'users.read',
        'users.update',
        'users.delete',
        'products.create',
        'products.read',
        'products.update',
        'products.delete',
        'orders.create',
        'orders.read',
        'orders.update',
        'orders.delete',
        'analytics.read',
        'reports.read',
        'settings.read',
        'settings.update',
        'admin.access',
        'super_admin.access',
      ],
      status: UserStatus.ACTIVE,
    };

    // إنشاء الادمن الرئيسي
    const superAdmin = await this.userModel.create(superAdminData);

    // إنشاء capabilities
    const adminCapabilities = {
      userId: superAdmin._id.toString(),
      customer_capable: true,
      engineer_capable: true,
      engineer_status: 'approved',
      merchant_capable: true,
      merchant_status: 'approved',
      merchant_discount_percent: 0,
    };

    await this.capsModel.create(adminCapabilities);

    return {
      message: 'تم إنشاء الادمن الرئيسي بنجاح',
      admin: {
        id: superAdmin._id,
        phone: superAdmin.phone,
        firstName: superAdmin.firstName,
        lastName: superAdmin.lastName,
        roles: superAdmin.roles,
        status: superAdmin.status,
      },
      loginInfo: {
        phone: superAdmin.phone,
        password: 'Admin123!@#',
      },
    };
  }

  // ==================== تسجيل دخول الأدمن بكلمة المرور ====================
  @Post('admin-login')
  @ApiOperation({
    summary: 'تسجيل دخول الأدمن/السوبر أدمن بكلمة المرور',
    description: 'تسجيل دخول المسؤولين باستخدام رقم الهاتف وكلمة المرور'
  })
  @ApiBody({ type: AdminLoginDto })
  @ApiCreatedResponse({
    description: 'تم تسجيل الدخول بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            tokens: {
              type: 'object',
              properties: {
                access: { type: 'string', description: 'Access Token' },
                refresh: { type: 'string', description: 'Refresh Token' },
              },
            },
            me: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                phone: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                roles: { type: 'array', items: { type: 'string' } },
                permissions: { type: 'array', items: { type: 'string' } },
                isAdmin: { type: 'boolean' },
              },
            },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'بيانات غير صحيحة' })
  @ApiUnauthorizedResponse({ description: 'كلمة المرور غير صحيحة' })
  async adminLogin(@Body() body: AdminLoginDto) {
    this.logger.log(`Admin login attempt for phone: ${body.phone}`);

    // البحث عن المستخدم
    const user = await this.userModel.findOne({ phone: body.phone });
    if (!user) {
      this.logger.warn(`Admin login failed - user not found: ${body.phone}`);
      throw new InvalidPasswordException({ phone: body.phone });
    }

    // التحقق من كلمة المرور
    if (!user.passwordHash) {
      this.logger.warn(`Admin login failed - no password set: ${body.phone}`);
      throw new AuthException(ErrorCode.AUTH_PASSWORD_NOT_SET, { phone: body.phone });
    }

    const isPasswordValid = await compare(body.password, user.passwordHash);
    if (!isPasswordValid) {
      this.logger.warn(`Admin login failed - invalid password: ${body.phone}`);
      throw new InvalidPasswordException({ phone: body.phone });
    }

    // التحقق من حالة المستخدم
    if (user.status !== UserStatus.ACTIVE) {
      this.logger.warn(`Admin login failed - user not active: ${body.phone}`);
      throw new AuthException(ErrorCode.AUTH_USER_NOT_ACTIVE, { phone: body.phone, status: user.status });
    }

    // حساب صلاحية الأدمن من الأدوار
    const isAdminUser =
      Array.isArray(user.roles) &&
      (user.roles.includes(UserRole.ADMIN) || user.roles.includes(UserRole.SUPER_ADMIN));

    // التحقق من الصلاحية
    if (!isAdminUser) {
      this.logger.warn(`Admin login failed - not an admin: ${body.phone}`);
      throw new AuthException(ErrorCode.AUTH_NOT_ADMIN, { phone: body.phone });
    }

    // إنشاء الـ Tokens
    const payload = {
      sub: String(user._id),
      phone: user.phone,
      isAdmin: isAdminUser,
      roles: user.roles || [],
      permissions: user.permissions || [],
    };
    const access = this.tokens.signAccess(payload);
    const refresh = this.tokens.signRefresh(payload);

    this.logger.log(`Admin login successful: ${body.phone}`);

    return {
      tokens: { access, refresh },
      me: {
        id: String(user._id),
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        city: user.city,
        jobTitle: user.jobTitle,
        roles: user.roles || [],
        permissions: user.permissions || [],
        isAdmin: isAdminUser,
        preferredCurrency: user.preferredCurrency || 'USD',
        status: user.status,
        // Capability statuses
        customerCapable: user.customer_capable,
        engineerCapable: user.engineer_capable,
        engineerStatus: user.engineer_status,
        merchantCapable: user.merchant_capable,
        merchantStatus: user.merchant_status,
        merchantDiscountPercent: user.merchant_discount_percent,
        adminCapable: user.admin_capable,
        adminStatus: user.admin_status,
      },
    };
  }

  // ==================== تسجيل حساب جديد بكلمة مرور ====================
  @Post('user-signup')
  @ApiOperation({
    summary: 'تسجيل حساب جديد للمستخدم العادي/المهندس/التاجر بكلمة مرور',
    description: 'إنشاء حساب جديد باستخدام رقم الهاتف وكلمة المرور مع البيانات الأساسية'
  })
  @ApiBody({ type: UserSignupDto })
  @ApiCreatedResponse({
    description: 'تم إنشاء الحساب بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            tokens: {
              type: 'object',
              properties: {
                access: { type: 'string', description: 'Access Token' },
                refresh: { type: 'string', description: 'Refresh Token' },
              },
            },
            me: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                phone: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                gender: { type: 'string' },
                jobTitle: { type: 'string' },
                roles: { type: 'array', items: { type: 'string' } },
                permissions: { type: 'array', items: { type: 'string' } },
                isAdmin: { type: 'boolean' },
                preferredCurrency: { type: 'string' },
              },
            },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'بيانات غير صحيحة أو رقم الهاتف موجود مسبقاً' })
  async userSignup(@Body() dto: UserSignupDto) {
    this.logger.log(`User signup attempt for phone: ${dto.phone}`);

    // التحقق من أن رقم الهاتف غير موجود مسبقاً (البحث بالرقم كما هو أو بالرقم المحول)
    let existingUser = await this.userModel.findOne({ phone: dto.phone });
    if (!existingUser) {
      // Normalize phone number to check with +967 format
      let normalizedPhone: string;
      try {
        normalizedPhone = normalizeYemeniPhone(dto.phone);
        existingUser = await this.userModel.findOne({ phone: normalizedPhone });
      } catch (error) {
        this.logger.error(`Failed to normalize phone number ${dto.phone}:`, error);
        throw new AuthException(ErrorCode.VALIDATION_ERROR, { 
          phone: dto.phone,
          message: error instanceof Error ? error.message : 'رقم الهاتف غير صحيح'
        });
      }
    }
    if (existingUser) {
      this.logger.warn(`User signup failed - phone already exists: ${dto.phone}`);
      throw new AuthException(ErrorCode.AUTH_PHONE_EXISTS, { phone: dto.phone });
    }

    // تشفير كلمة المرور
    const hashedPassword = await hash(dto.password, 10);

    // إنشاء المستخدم الجديد بحالة PENDING (يحتاج التحقق من OTP)
    // حفظ الرقم كما هو (بدون +967) في قاعدة البيانات
    const user = await this.userModel.create({
      phone: dto.phone,
      firstName: dto.firstName,
      lastName: dto.lastName,
      gender: dto.gender,
      city: dto.city || 'صنعاء',
      jobTitle: dto.capabilityRequest === 'engineer' ? dto.jobTitle : undefined,
      passwordHash: hashedPassword,
      status: UserStatus.PENDING, // الحساب بحالة PENDING حتى يتم التحقق من OTP
    });

    // تحديث User model مباشرة إذا طلب المستخدم أن يكون مهندساً أو تاجراً
    if (dto.capabilityRequest) {
      if (dto.capabilityRequest === 'engineer') {
        user.engineer_capable = true;
        user.engineer_status = CapabilityStatus.UNVERIFIED;
      } else if (dto.capabilityRequest === 'merchant') {
        user.merchant_capable = true;
        user.merchant_status = CapabilityStatus.UNVERIFIED;
      }
      await user.save();
    }

    // إنشاء capabilities للمستخدم
    await this.capsModel.create({
      userId: user._id,
      customer_capable: true,
      engineer_capable: user.engineer_capable || false,
      engineer_status: user.engineer_status || 'none',
      merchant_capable: user.merchant_capable || false,
      merchant_status: user.merchant_status || 'none',
      merchant_discount_percent: 0,
    });

    // إرسال OTP عبر SMS بعد إنشاء الحساب (يتطلب الرقم بصيغة +967)
    let normalizedPhone: string;
    try {
      normalizedPhone = normalizeYemeniPhone(dto.phone);
      await this.otp.sendOtp(normalizedPhone, 'register');
      this.logger.log(`OTP sent to ${normalizedPhone} after signup - account pending verification`);
    } catch (error) {
      this.logger.warn(`Failed to send OTP after signup to ${dto.phone}:`, error);
      // Continue anyway - account is created, OTP sending failure is not critical
    }

    // لا نعيد Tokens هنا - يجب التحقق من OTP أولاً
    this.logger.log(`User signup successful but pending verification: ${dto.phone}`);

    return {
      success: true,
      message: 'تم إنشاء الحساب بنجاح. يرجى التحقق من رقم الهاتف عبر رمز OTP المرسل',
      phone: dto.phone,
      requiresVerification: true,
    };
  }

  // ==================== مصادقة البصمة (WebAuthn) ====================
  @Post('biometric/register-challenge')
  @ApiOperation({
    summary: 'الحصول على تحدي WebAuthn لتسجيل بصمة اليد',
    description: 'ينشئ تحدياً لتسجيل جهاز جديد باستخدام WebAuthn للمستخدم المحدد',
  })
  @ApiBody({ type: BiometricRegisterChallengeDto })
  @ApiOkResponse({
    description: 'تم إنشاء التحدي بنجاح',
    schema: {
      type: 'object',
      properties: {
        options: {
          type: 'object',
          properties: {
            challenge: { type: 'string', example: 'base64url-encoded-challenge' },
            rp: {
              type: 'object',
              properties: {
                name: { type: 'string', example: 'Tagdod Platform' },
                id: { type: 'string', example: 'localhost' },
              },
            },
            user: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'base64-encoded-user-id' },
                name: { type: 'string', example: '+966501234567' },
                displayName: { type: 'string', example: '+966501234567' },
              },
            },
            pubKeyCredParams: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string', example: 'public-key' },
                  alg: { type: 'number', example: -7 },
                },
              },
            },
            timeout: { type: 'number', example: 300000 },
            attestationType: { type: 'string', example: 'none' },
            authenticatorSelection: {
              type: 'object',
              properties: {
                residentKey: { type: 'string', example: 'preferred' },
                userVerification: { type: 'string', example: 'required' },
              },
            },
            excludeCredentials: { type: 'array', items: { type: 'object' } },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'بيانات غير صحيحة أو رقم هاتف غير صالح',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'صيغة رقم الهاتف غير صحيحة' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'المستخدم غير موجود أو الحساب غير نشط',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'المستخدم غير موجود' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  async createBiometricRegisterChallenge(@Body() body: BiometricRegisterChallengeDto) {
    this.logger.log(`Biometric register challenge for phone: ${body.phone}`);

    const user = await this.userModel.findOne({ phone: body.phone });
    if (!user) {
      this.logger.warn(`Biometric register failed - user not found: ${body.phone}`);
      throw new UserNotFoundException({ phone: body.phone });
    }

    if (user.status !== UserStatus.ACTIVE) {
      this.logger.warn(`Biometric register failed - user not active: ${body.phone}`);
      throw new AuthException(ErrorCode.AUTH_USER_NOT_ACTIVE, {
        phone: body.phone,
        status: user.status,
      });
    }

    const options = await this.biometric.generateRegistrationChallenge(user, {
      deviceName: body.deviceName,
      userAgent: body.userAgent,
    });

    return { options };
  }

  @Post('biometric/register-verify')
  @ApiOperation({
    summary: 'التحقق من استجابة WebAuthn لإتمام تسجيل بصمة اليد',
    description: 'يتحقق من استجابة WebAuthn ويخزن بيانات الجهاز المسجل',
  })
  @ApiBody({ type: BiometricRegisterVerifyDto })
  @ApiOkResponse({
    description: 'تم تسجيل الجهاز بنجاح وإصدار التوكنات',
    schema: {
      type: 'object',
      properties: {
        tokens: {
          type: 'object',
          properties: {
            access: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            refresh: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          },
        },
        me: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            phone: { type: 'string', example: '+966501234567' },
            firstName: { type: 'string', example: 'أحمد' },
            lastName: { type: 'string', example: 'محمد' },
            gender: { type: 'string', example: 'male' },
            city: { type: 'string', example: 'صنعاء' },
            jobTitle: { type: 'string', example: 'مهندس' },
            roles: { type: 'array', items: { type: 'string' }, example: [] },
            permissions: { type: 'array', items: { type: 'string' }, example: [] },
            isAdmin: { type: 'boolean', example: false },
            preferredCurrency: { type: 'string', example: 'USD' },
            engineerStatus: { type: 'string', example: 'none' },
            merchantStatus: { type: 'string', example: 'none' },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'بيانات الاستجابة غير صحيحة أو فشل التحقق',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'فشل التحقق من بيانات البصمة' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'فشل التحقق من الاستجابة أو انتهت صلاحية التحدي',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'انتهت صلاحية التحدي' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  async verifyBiometricRegister(@Body() body: BiometricRegisterVerifyDto) {
    this.logger.log(`Biometric register verify for phone: ${body.phone}`);

    const user = await this.userModel.findOne({ phone: body.phone });
    if (!user) {
      this.logger.warn(`Biometric register verify failed - user not found: ${body.phone}`);
      throw new UserNotFoundException({ phone: body.phone });
    }

    if (user.status !== UserStatus.ACTIVE) {
      this.logger.warn(`Biometric register verify failed - user not active: ${body.phone}`);
      throw new AuthException(ErrorCode.AUTH_USER_NOT_ACTIVE, {
        phone: body.phone,
        status: user.status,
      });
    }

    await this.biometric.verifyRegistration(user, body.response, {
      deviceName: body.deviceName,
      userAgent: body.userAgent,
    });

    this.logger.log(`Biometric registration successful: ${body.phone}`);
    return this.buildAuthResponse(user);
  }

  @Post('biometric/login-challenge')
  @ApiOperation({
    summary: 'الحصول على تحدي WebAuthn لتسجيل الدخول بالبصمة',
    description: 'ينشئ تحدياً لتوثيق المستخدم بالبصمة على جهاز مسجل مسبقاً',
  })
  @ApiBody({ type: BiometricLoginChallengeDto })
  @ApiOkResponse({
    description: 'تم إنشاء التحدي بنجاح',
    schema: {
      type: 'object',
      properties: {
        options: {
          type: 'object',
          properties: {
            challenge: { type: 'string', example: 'base64url-encoded-challenge' },
            allowCredentials: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string', example: 'public-key' },
                  id: { type: 'string', example: 'base64url-credential-id' },
                  transports: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['internal', 'hybrid'],
                  },
                },
              },
            },
            rpId: { type: 'string', example: 'localhost' },
            timeout: { type: 'number', example: 300000 },
            userVerification: { type: 'string', example: 'required' },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'بيانات غير صحيحة',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'صيغة رقم الهاتف غير صحيحة' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'المستخدم غير موجود أو لم يتم تسجيل بصمة من قبل',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'لم يتم تسجيل بصمة لهذا المستخدم' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  async createBiometricLoginChallenge(@Body() body: BiometricLoginChallengeDto) {
    this.logger.log(`Biometric login challenge for phone: ${body.phone}`);

    const user = await this.userModel.findOne({ phone: body.phone });
    if (!user) {
      this.logger.warn(`Biometric login challenge failed - user not found: ${body.phone}`);
      throw new UserNotFoundException({ phone: body.phone });
    }

    if (user.status !== UserStatus.ACTIVE) {
      this.logger.warn(`Biometric login challenge failed - user not active: ${body.phone}`);
      throw new AuthException(ErrorCode.AUTH_USER_NOT_ACTIVE, {
        phone: body.phone,
        status: user.status,
      });
    }

    const options = await this.biometric.generateLoginChallenge(user, {
      userAgent: body.userAgent,
    });

    return { options };
  }

  @Post('biometric/login-verify')
  @ApiOperation({
    summary: 'التحقق من استجابة WebAuthn لتسجيل الدخول بالبصمة',
    description: 'يتحقق من التحدي ويصدر توكنات الدخول للمستخدم',
  })
  @ApiBody({ type: BiometricLoginVerifyDto })
  @ApiOkResponse({
    description: 'تم تسجيل الدخول بنجاح باستخدام البصمة',
    schema: {
      type: 'object',
      properties: {
        tokens: {
          type: 'object',
          properties: {
            access: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            refresh: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          },
        },
        me: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            phone: { type: 'string', example: '+966501234567' },
            firstName: { type: 'string', example: 'أحمد' },
            lastName: { type: 'string', example: 'محمد' },
            gender: { type: 'string', example: 'male' },
            city: { type: 'string', example: 'صنعاء' },
            jobTitle: { type: 'string', example: 'مهندس' },
            roles: { type: 'array', items: { type: 'string' }, example: [] },
            permissions: { type: 'array', items: { type: 'string' }, example: [] },
            isAdmin: { type: 'boolean', example: false },
            preferredCurrency: { type: 'string', example: 'USD' },
            engineerStatus: { type: 'string', example: 'none' },
            merchantStatus: { type: 'string', example: 'none' },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'بيانات الاستجابة غير صحيحة',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'بيانات الاستجابة غير صحيحة' },
        error: { type: 'string', example: 'Bad Request' },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'فشل التحقق من البصمة أو انتهت صلاحية التحدي',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 401 },
        message: { type: 'string', example: 'فشل التحقق من البصمة' },
        error: { type: 'string', example: 'Unauthorized' },
      },
    },
  })
  async verifyBiometricLogin(@Body() body: BiometricLoginVerifyDto) {
    this.logger.log(`Biometric login attempt for phone: ${body.phone}`);

    const user = await this.userModel.findOne({ phone: body.phone });
    if (!user) {
      this.logger.warn(`Biometric login failed - user not found: ${body.phone}`);
      throw new UserNotFoundException({ phone: body.phone });
    }

    if (user.status !== UserStatus.ACTIVE) {
      this.logger.warn(`Biometric login failed - user not active: ${body.phone}`);
      throw new AuthException(ErrorCode.AUTH_USER_NOT_ACTIVE, {
        phone: body.phone,
        status: user.status,
      });
    }

    await this.biometric.verifyLogin(user, body.response, {
      userAgent: body.userAgent,
    });

    this.logger.log(`Biometric login successful: ${body.phone}`);
    return this.buildAuthResponse(user);
  }

  // ==================== تسجيل دخول المستخدم العادي بكلمة المرور ====================
  @Post('user-login')
  @ApiOperation({
    summary: 'تسجيل دخول المستخدم العادي/المهندس/التاجر بكلمة المرور',
    description: 'تسجيل دخول المستخدمين العاديين باستخدام رقم الهاتف وكلمة المرور'
  })
  @ApiBody({ type: UserLoginDto })
  @ApiCreatedResponse({
    description: 'تم تسجيل الدخول بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        data: {
          type: 'object',
          properties: {
            tokens: {
              type: 'object',
              properties: {
                access: { type: 'string', description: 'Access Token' },
                refresh: { type: 'string', description: 'Refresh Token' },
              },
            },
            me: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                phone: { type: 'string' },
                firstName: { type: 'string' },
                lastName: { type: 'string' },
                roles: { type: 'array', items: { type: 'string' } },
                permissions: { type: 'array', items: { type: 'string' } },
                isAdmin: { type: 'boolean' },
              },
            },
          },
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'بيانات غير صحيحة' })
  @ApiUnauthorizedResponse({ description: 'كلمة المرور غير صحيحة' })
  async userLogin(@Body() body: UserLoginDto) {
    this.logger.log(`User login attempt for phone: ${body.phone}`);

    // البحث عن المستخدم بالرقم كما هو (بدون تحويل إلى +967)
    // التحويل إلى +967 يحدث فقط عند إرسال OTP
    const user = await this.userModel.findOne({ phone: body.phone });
    if (!user) {
      this.logger.warn(`User login failed - user not found: ${body.phone}`);
      throw new InvalidPasswordException({ phone: body.phone });
    }

    // التحقق من كلمة المرور
    if (!user.passwordHash) {
      this.logger.warn(`User login failed - no password set: ${body.phone}`);
      throw new AuthException(ErrorCode.AUTH_PASSWORD_NOT_SET, { phone: body.phone });
    }

    const isPasswordValid = await compare(body.password, user.passwordHash);
    if (!isPasswordValid) {
      this.logger.warn(`User login failed - invalid password: ${body.phone}`);
      throw new InvalidPasswordException({ phone: body.phone });
    }

    // التحقق من حالة المستخدم
    if (user.status === UserStatus.PENDING) {
      this.logger.warn(`User login failed - account pending verification: ${body.phone}`);
      throw new AuthException(ErrorCode.AUTH_USER_NOT_ACTIVE, { 
        phone: body.phone, 
        status: user.status,
        message: 'الحساب في انتظار التحقق من رقم الهاتف. يرجى التحقق من OTP المرسل'
      });
    }

    if (user.status !== UserStatus.ACTIVE) {
      this.logger.warn(`User login failed - user not active: ${body.phone}`);
      throw new AuthException(ErrorCode.AUTH_USER_NOT_ACTIVE, { phone: body.phone, status: user.status });
    }

    this.logger.log(`User login successful: ${body.phone}`);
    return this.buildAuthResponse(user);
  }

  // ==================== تسجيل دخول السوبر أدمن (للاستخدام في مرحلة التطوير) ====================
  @RequirePermissions('admin.access') // مطلوب في التطوير لكن يتم التحقق منه في الكود
  @Post('dev-login')
  async devLogin(@Body() body: { phone: string; password: string }) {
    // هذا الـ endpoint مخصص للتطوير فقط
    if (process.env.NODE_ENV === 'production') {
      throw new NotAllowedInProductionException();
    }

    const user = await this.userModel.findOne({ phone: body.phone });
    if (!user) {
      throw new UserNotFoundException();
    }

    // التحقق من كلمة المرور
    if (!user.passwordHash) {
      throw new NoPasswordException({ userId: user._id });
    }

    const isPasswordValid = await compare(body.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new InvalidPasswordException({ userId: user._id });
    }

    // حساب صلاحية الأدمن من الأدوار
    const isAdminUser =
      Array.isArray(user.roles) &&
      (user.roles.includes(UserRole.ADMIN) || user.roles.includes(UserRole.SUPER_ADMIN));

    // التحقق من الصلاحية
    if (!isAdminUser) {
      throw new AuthException(ErrorCode.AUTH_NOT_ADMIN, { phone: body.phone });
    }

    const payload = {
      sub: String(user._id),
      phone: user.phone,
      isAdmin: isAdminUser,
      roles: user.roles || [],
      permissions: user.permissions || [],
    };
    const access = this.tokens.signAccess(payload);
    const refresh = this.tokens.signRefresh(payload);

    return {
      tokens: { access, refresh },
      me: {
        id: user._id,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        city: user.city,
        jobTitle: user.jobTitle,
        roles: user.roles || [],
        permissions: user.permissions || [],
        isAdmin: isAdminUser,
        preferredCurrency: user.preferredCurrency || 'USD',
        status: user.status,
        // Capability statuses
        customerCapable: user.customer_capable,
        engineerCapable: user.engineer_capable,
        engineerStatus: user.engineer_status,
        merchantCapable: user.merchant_capable,
        merchantStatus: user.merchant_status,
        merchantDiscountPercent: user.merchant_discount_percent,
        adminCapable: user.admin_capable,
        adminStatus: user.admin_status,
      },
    };
  }
}
