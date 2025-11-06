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
import { DeleteAccountDto } from './dto/delete-account.dto';
import { AdminLoginDto } from './dto/admin-login.dto';
import { UserLoginDto } from './dto/user-login.dto';

import { UserSignupDto } from './dto/user-signup.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole, UserStatus, CapabilityStatus } from '../users/schemas/user.schema';
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

@ApiTags('المصادقة')
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private otp: OtpService,
    private tokens: TokensService,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Capabilities.name) private capsModel: Model<Capabilities>,
    private favoritesService: FavoritesService,
  ) {}

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
    const ok = await this.otp.verifyOtp(dto.phone, dto.code, 'register');
    if (!ok) throw new InvalidOTPException({ phone: dto.phone });

    // التحقق من أن المسمى الوظيفي موجود عند طلب أن يكون مهندساً
    if (dto.capabilityRequest === 'engineer' && !dto.jobTitle) {
      throw new AuthException(ErrorCode.AUTH_JOB_TITLE_REQUIRED);
    }

    let user = await this.userModel.findOne({ phone: dto.phone });
    if (!user) {
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

      user = await this.userModel.create(userData);
      
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
    } else if (dto.capabilityRequest === 'engineer' && dto.jobTitle && !user.jobTitle) {
      // تحديث المسمى الوظيفي إذا كان المستخدم موجوداً ولكن ليس لديه مسمى
      user.jobTitle = dto.jobTitle;
      await user.save();
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
        engineerStatus: user.engineer_status,
        merchantStatus: user.merchant_status,
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
    const user = await this.userModel.findOne({ phone: dto.phone });
    if (!user) throw new UserNotFoundException();
    const result = await this.otp.sendOtp(dto.phone, 'reset');
    return { sent: result.sent, devCode: result.devCode };
  }

  @Post('reset-password') async reset(@Body() dto: ResetPasswordDto) {
    const ok = await this.otp.verifyOtp(dto.phone, dto.code, 'reset');
    if (!ok) throw new InvalidOTPException({ phone: dto.phone });
    const user = await this.userModel.findOne({ phone: dto.phone });
    if (!user) throw new UserNotFoundException();
    const hashedPassword = await hash(dto.newPassword, 10);
    await this.userModel.updateOne({ _id: user._id }, { $set: { passwordHash: hashedPassword } });
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
      },
      capabilities: caps,
    };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateMe(
    @Req() req: { user: { sub: string } },
    @Body() body: { firstName?: string; lastName?: string; gender?: string; city?: string; jobTitle?: string },
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

    // التحقق من أن رقم الهاتف غير موجود مسبقاً
    const existingUser = await this.userModel.findOne({ phone: dto.phone });
    if (existingUser) {
      this.logger.warn(`User signup failed - phone already exists: ${dto.phone}`);
      throw new AuthException(ErrorCode.AUTH_PHONE_EXISTS, { phone: dto.phone });
    }

    // التحقق من صحة البيانات عند طلب أن يكون مهندساً
    if (dto.capabilityRequest === 'engineer' && !dto.jobTitle) {
      throw new AuthException(ErrorCode.AUTH_JOB_TITLE_REQUIRED);
    }

    // تشفير كلمة المرور
    const hashedPassword = await hash(dto.password, 10);

    // إنشاء المستخدم الجديد
    const user = await this.userModel.create({
      phone: dto.phone,
      firstName: dto.firstName,
      lastName: dto.lastName,
      gender: dto.gender,
      city: dto.city || 'صنعاء',
      jobTitle: dto.capabilityRequest === 'engineer' ? dto.jobTitle : undefined,
      passwordHash: hashedPassword,
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

    // مزامنة المفضلات تلقائياً عند التسجيل
    if (dto.deviceId) {
      try {
        await this.favoritesService.syncGuestToUser(dto.deviceId, String(user._id));
      } catch (error) {
        // نتجاهل الأخطاء في المزامنة لأنها ليست حرجة
        this.logger.error('Favorites sync error during signup:', error);
      }
    }

    // حساب صلاحية الأدمن من الأدوار (سوف تكون false للمستخدمين العاديين الجدد)
    const isAdminUser = false;

    // إنشاء الـ Tokens
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

    this.logger.log(`User signup successful: ${dto.phone}`);

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
        engineerStatus: user.engineer_status,
        merchantStatus: user.merchant_status,
      },
    };
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

    // البحث عن المستخدم
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
    if (user.status !== UserStatus.ACTIVE) {
      this.logger.warn(`User login failed - user not active: ${body.phone}`);
      throw new AuthException(ErrorCode.AUTH_USER_NOT_ACTIVE, { phone: body.phone, status: user.status });
    }

    // حساب صلاحية الأدمن من الأدوار
    const isAdminUser =
      Array.isArray(user.roles) &&
      (user.roles.includes(UserRole.ADMIN) || user.roles.includes(UserRole.SUPER_ADMIN));

    // إنشاء الـ Tokens
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

    this.logger.log(`User login successful: ${body.phone}`);

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
        engineerStatus: user.engineer_status,
        merchantStatus: user.merchant_status,
      },
    };
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
      },
    };
  }
}
