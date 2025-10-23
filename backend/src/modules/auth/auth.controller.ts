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
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserRole, UserStatus } from '../users/schemas/user.schema';
import { Capabilities } from '../capabilities/schemas/capabilities.schema';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AdminGuard } from '../../shared/guards/admin.guard';
import { RequirePermissions } from '../../shared/decorators/permissions.decorator';
import { AppException } from '../../shared/exceptions/app.exception';
import { FavoritesService } from '../favorites/favorites.service';

@ApiTags('auth')
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
    summary: 'Send OTP to phone number',
    description: 'Sends a one-time password (OTP) to the specified phone number for authentication',
  })
  @ApiBody({ type: SendOtpDto })
  @ApiCreatedResponse({
    description: 'OTP sent successfully',
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
    description: 'Invalid phone number or context',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Invalid phone number format' },
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
    summary: 'Verify OTP and complete registration/login',
    description: 'Verifies the OTP code and completes user registration or login process',
  })
  @ApiBody({ type: VerifyOtpDto })
  @ApiCreatedResponse({
    description: 'OTP verified successfully and user authenticated',
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
    description: 'Invalid OTP code',
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
    description: 'Missing required fields for engineer registration',
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
    if (!ok) throw new AppException('AUTH_INVALID_OTP', 'رمز التحقق غير صالح', null, 401);

    // التحقق من أن المسمى الوظيفي موجود عند طلب أن يكون مهندساً
    if (dto.capabilityRequest === 'engineer' && !dto.jobTitle) {
      throw new AppException(
        'AUTH_JOB_TITLE_REQUIRED',
        'المسمى الوظيفي مطلوب للمهندسين',
        null,
        400,
      );
    }

    let user = await this.userModel.findOne({ phone: dto.phone });
    if (!user) {
      user = await this.userModel.create({
        phone: dto.phone,
        firstName: dto.firstName,
        lastName: dto.lastName,
        gender: dto.gender,
        jobTitle: dto.capabilityRequest === 'engineer' ? dto.jobTitle : undefined,
      });
      await this.capsModel.create({ userId: user._id, customer_capable: true });
    } else if (dto.capabilityRequest === 'engineer' && dto.jobTitle && !user.jobTitle) {
      // تحديث المسمى الوظيفي إذا كان المستخدم موجوداً ولكن ليس لديه مسمى
      user.jobTitle = dto.jobTitle;
      await user.save();
    }
    if (dto.capabilityRequest) {
      const caps = await this.capsModel.findOne({ userId: user._id });
      if (caps) {
        if (
          dto.capabilityRequest === 'engineer' &&
          caps.engineer_status !== 'pending' &&
          !caps.engineer_capable
        )
          caps.engineer_status = 'pending';
        if (
          dto.capabilityRequest === 'wholesale' &&
          caps.wholesale_status !== 'pending' &&
          !caps.wholesale_capable
        )
          caps.wholesale_status = 'pending';
        await caps.save();
      }
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
        preferredCurrency: user.preferredCurrency || 'USD',
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
      throw new AppException('User not found', '404');
    }

    return {
      updated: true,
      preferredCurrency: user.preferredCurrency,
    };
  }

  @Post('forgot-password') async forgot(@Body() dto: ForgotPasswordDto) {
    const user = await this.userModel.findOne({ phone: dto.phone });
    if (!user) throw new AppException('AUTH_USER_NOT_FOUND', 'المستخدم غير موجود', null, 404);
    const result = await this.otp.sendOtp(dto.phone, 'reset');
    return { sent: result.sent, devCode: result.devCode };
  }

  @Post('reset-password') async reset(@Body() dto: ResetPasswordDto) {
    const ok = await this.otp.verifyOtp(dto.phone, dto.code, 'reset');
    if (!ok) throw new AppException('AUTH_INVALID_OTP', 'رمز التحقق غير صالح', null, 401);
    const user = await this.userModel.findOne({ phone: dto.phone });
    if (!user) throw new AppException('AUTH_USER_NOT_FOUND', 'المستخدم غير موجود', null, 404);
    const hashedPassword = await hash(dto.newPassword, 10);
    await this.userModel.updateOne({ _id: user._id }, { $set: { passwordHash: hashedPassword } });
    return { updated: true };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Retrieves the current authenticated user profile and capabilities',
  })
  @ApiOkResponse({
    description: 'User profile retrieved successfully',
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
            wholesale_capable: { type: 'boolean', example: false },
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
    @Body() body: { firstName?: string; lastName?: string; gender?: string; jobTitle?: string },
  ) {
    const allowed = ['firstName', 'lastName', 'gender', 'jobTitle'] as const;
    const $set: { firstName?: string; lastName?: string; gender?: string; jobTitle?: string } = {};
    for (const k of allowed) if (body[k] !== undefined) $set[k] = body[k];
    await this.userModel.updateOne({ _id: req.user.sub }, { $set });
    return { updated: true };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Delete('me')
  async deleteMe(@Req() req: { user: { sub: string } }) {
    await this.userModel.deleteOne({ _id: req.user.sub });
    await this.capsModel.deleteOne({ userId: req.user.sub });
    return { deleted: true };
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, AdminGuard)
  @RequirePermissions('capabilities.read', 'admin.access')
  @Get('admin/pending')
  async pending() {
    const list = await this.capsModel
      .find({ $or: [{ engineer_status: 'pending' }, { wholesale_status: 'pending' }] })
      .populate('userId', 'phone firstName lastName')
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
      capability: 'engineer' | 'wholesale';
      approve: boolean;
      wholesaleDiscountPercent?: number; // نسبة الخصم للتاجر (0-100)
    },
  ) {
    const caps = await this.capsModel.findOne({ userId: body.userId });
    if (!caps) throw new AppException('CAPS_NOT_FOUND', 'سجل القدرات غير موجود', null, 404);

    if (body.capability === 'engineer') {
      caps.engineer_status = body.approve ? 'approved' : 'rejected';
      caps.engineer_capable = body.approve;
    }

    if (body.capability === 'wholesale') {
      caps.wholesale_status = body.approve ? 'approved' : 'rejected';
      caps.wholesale_capable = body.approve;

      // تعيين نسبة الخصم عند الموافقة على التاجر
      if (body.approve) {
        if (
          body.wholesaleDiscountPercent === undefined ||
          body.wholesaleDiscountPercent < 0 ||
          body.wholesaleDiscountPercent > 100
        ) {
          throw new AppException(
            'INVALID_DISCOUNT',
            'نسبة الخصم يجب أن تكون بين 0 و 100',
            null,
            400,
          );
        }
        caps.wholesale_discount_percent = body.wholesaleDiscountPercent;
      } else {
        // إزالة الخصم عند الرفض
        caps.wholesale_discount_percent = 0;
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
      throw new AppException('NOT_ALLOWED', 'هذا الـ endpoint غير متاح في الإنتاج', null, 403);
    }

    // التحقق من المفتاح السري (يجب أن يكون في متغيرات البيئة)
    const expectedSecret = process.env.SUPER_ADMIN_SECRET || 'TAGADODO_SUPER_ADMIN_2024';
    if (body.secretKey !== expectedSecret) {
      throw new AppException('INVALID_SECRET', 'مفتاح سري غير صحيح', null, 403);
    }

    // التحقق من وجود ادمن رئيسي بالفعل
    const existingSuperAdmin = await this.userModel.findOne({
      roles: { $in: [UserRole.SUPER_ADMIN] },
    });

    if (existingSuperAdmin) {
      throw new AppException('SUPER_ADMIN_EXISTS', 'الادمن الرئيسي موجود بالفعل', null, 400);
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
      wholesale_capable: true,
      wholesale_status: 'approved',
      wholesale_discount_percent: 0,
    };

    await this.capsModel.create(adminCapabilities);

    return {
      success: true,
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

  // ==================== تسجيل دخول السوبر أدمن (للاستخدام في مرحلة التطوير) ====================
  @RequirePermissions('admin.access') // مطلوب في التطوير لكن يتم التحقق منه في الكود
  @Post('dev-login')
  async devLogin(@Body() body: { phone: string; password: string }) {
    // هذا الـ endpoint مخصص للتطوير فقط
    if (process.env.NODE_ENV === 'production') {
      throw new AppException('NOT_ALLOWED', 'هذا الـ endpoint غير متاح في الإنتاج', null, 403);
    }

    const user = await this.userModel.findOne({ phone: body.phone });
    if (!user) {
      throw new AppException('AUTH_USER_NOT_FOUND', 'المستخدم غير موجود', null, 404);
    }

    // التحقق من كلمة المرور
    if (!user.passwordHash) {
      throw new AppException('AUTH_NO_PASSWORD', 'كلمة المرور غير محددة', null, 400);
    }

    const isPasswordValid = await compare(body.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppException('AUTH_INVALID_PASSWORD', 'كلمة المرور غير صحيحة', null, 401);
    }

    // حساب صلاحية الأدمن من الأدوار
    const isAdminUser =
      Array.isArray(user.roles) &&
      (user.roles.includes(UserRole.ADMIN) || user.roles.includes(UserRole.SUPER_ADMIN));

    // التحقق من الصلاحية
    if (!isAdminUser) {
      throw new AppException(
        'AUTH_NOT_ADMIN',
        'هذا الحساب غير مصرح له بالدخول للوحة التحكم',
        null,
        403,
      );
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
        roles: user.roles || [],
        isAdmin: isAdminUser,
      },
    };
  }
}
