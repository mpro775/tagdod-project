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
  Logger,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, SortOrder } from 'mongoose';
import { hash } from 'bcrypt';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';
import { User, UserRole, UserStatus, CapabilityStatus } from '../schemas/user.schema';
import { EngineerProfile } from '../schemas/engineer-profile.schema';
import { Capabilities } from '../../capabilities/schemas/capabilities.schema';
import {
  UserNotFoundException,
  AuthException,
  ForbiddenException,
  ErrorCode,
} from '../../../shared/exceptions';
import { AdminPermission, PERMISSION_GROUPS } from '../../../shared/constants/permissions';
import { CreateUserAdminDto } from './dto/create-user-admin.dto';
import { CreateAdminDto, CreateRoleBasedAdminDto } from './dto/create-admin.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { SuspendUserDto } from './dto/suspend-user.dto';
import { UpdateCapabilityStatusDto } from './dto/update-capability-status.dto';
import { AdminResetPasswordDto } from './dto/reset-password.dto';
import { ApproveVerificationDto } from '../dto/approve-verification.dto';
import { AuditService } from '../../../shared/services/audit.service';
import { EngineerProfileService } from '../services/engineer-profile.service';
import { NotificationService } from '../../notifications/services/notification.service';
import {
  NotificationType,
  NotificationChannel,
  NotificationPriority,
  NotificationCategory,
} from '../../notifications/enums/notification.enums';

@ApiTags('إدارة-المستخدمين')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin/users')
export class UsersAdminController {
  private readonly logger = new Logger(UsersAdminController.name);
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(EngineerProfile.name) private engineerProfileModel: Model<EngineerProfile>,
    @InjectModel(Capabilities.name) private capsModel: Model<Capabilities>,
    private auditService: AuditService,
    private engineerProfileService: EngineerProfileService,
    @Inject(forwardRef(() => NotificationService))
    private notificationService?: NotificationService,
  ) {}

  // ==================== قائمة المستخدمين مع Pagination ====================
  @RequirePermissions('users.read', 'admin.access')
  @Get()
  @ApiOperation({
    summary: 'قائمة المستخدمين',
    description: 'استرداد قائمة بجميع المستخدمين مع إمكانية التصفية والترقيم',
  })
  @ApiQuery({ type: ListUsersDto })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد قائمة المستخدمين بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'user123', description: 'معرف المستخدم' },
              phone: { type: 'string', example: '+967771234567', description: 'رقم الهاتف' },
              email: {
                type: 'string',
                example: 'user@example.com',
                description: 'البريد الإلكتروني',
              },
              fullName: { type: 'string', example: 'أحمد محمد علي', description: 'الاسم الكامل' },
              status: { type: 'string', example: 'active', description: 'حالة المستخدم' },
              role: { type: 'string', example: 'customer', description: 'دور المستخدم' },
              createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' },
              lastLogin: { type: 'string', format: 'date-time', example: '2024-01-20T15:45:00Z' },
            },
          },
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 1500, description: 'إجمالي المستخدمين' },
            page: { type: 'number', example: 1, description: 'الصفحة الحالية' },
            limit: { type: 'number', example: 20, description: 'عدد المستخدمين في الصفحة' },
            totalPages: { type: 'number', example: 75, description: 'إجمالي الصفحات' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'غير مصرح لك بالوصول إلى قائمة المستخدمين',
  })
  async listUsers(@Query() dto: ListUsersDto) {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      role,
      verificationStatus,
      isAdmin,
      includeDeleted,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = dto;

    const skip = (page - 1) * limit;
    const query: FilterQuery<User> = {};

    // فلترة المحذوفين - إصلاح منطق الفلترة
    if (!includeDeleted) {
      query.deletedAt = null;
      query.status = { $ne: UserStatus.DELETED };
    }

    // البحث
    if (search) {
      const searchConditions: FilterQuery<User>[] = [
        { phone: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
      ];

      // إضافة البحث في سبب الحذف إذا كان البحث عن المحذوفين
      if (includeDeleted) {
        searchConditions.push({ deletionReason: { $regex: search, $options: 'i' } });
      }

      query.$or = searchConditions;
    }

    // فلترة الحالة
    if (status) {
      query.status = status;
    }

    // فلترة الدور
    if (role) {
      query.roles = role;
    }

    // فلترة حالة التوثيق (عند role=merchant أو role=engineer)
    if (verificationStatus && verificationStatus !== 'all') {
      if (role === UserRole.MERCHANT) {
        if (verificationStatus === 'verified') {
          query.merchant_status = CapabilityStatus.APPROVED;
        } else if (verificationStatus === 'unverified') {
          query.merchant_status = {
            $in: [
              CapabilityStatus.NONE,
              CapabilityStatus.UNVERIFIED,
              CapabilityStatus.PENDING,
              CapabilityStatus.REJECTED,
            ],
          };
        }
      } else if (role === UserRole.ENGINEER) {
        if (verificationStatus === 'verified') {
          query.engineer_status = CapabilityStatus.APPROVED;
        } else if (verificationStatus === 'unverified') {
          query.engineer_status = {
            $in: [
              CapabilityStatus.NONE,
              CapabilityStatus.UNVERIFIED,
              CapabilityStatus.PENDING,
              CapabilityStatus.REJECTED,
            ],
          };
        }
      }
    }

    // فلترة الأدمن (استخدام الأدوار بدلاً من isAdmin)
    if (isAdmin !== undefined) {
      if (isAdmin) {
        query.roles = { $in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] };
      } else {
        query.roles = { $nin: [UserRole.ADMIN, UserRole.SUPER_ADMIN] };
      }
    }

    // الترتيب
    const sort: Record<string, SortOrder> = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [users, total] = await Promise.all([
      this.userModel.find(query).select('-passwordHash').sort(sort).skip(skip).limit(limit).lean(),
      this.userModel.countDocuments(query),
    ]);

    // جلب capabilities لكل مستخدم
    const userIds = users.map((u) => u._id);
    const capabilities = await this.capsModel.find({ userId: { $in: userIds } }).lean();
    const capsMap = new Map(capabilities.map((c) => [String(c.userId), c]));

    const usersWithCaps = users.map((user) => ({
      ...user,
      capabilities: capsMap.get(String(user._id)) || null,
    }));

    return {
      users: usersWithCaps,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    };
  }

  // ==================== جلب معرفات المستخدمين فقط (لاختيار الكل) ====================
  @RequirePermissions('users.read', 'admin.access')
  @Get('ids')
  @ApiOperation({
    summary: 'جلب معرفات المستخدمين',
    description: 'استرداد مصفوفة معرفات المستخدمين المطابقين للفلاتر (لاختيار الكل في الإرسال الجماعي)',
  })
  @ApiQuery({ type: ListUsersDto })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد المعرفات بنجاح',
    schema: {
      type: 'object',
      properties: {
        ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'مصفوفة معرفات المستخدمين',
        },
      },
    },
  })
  async listUserIds(@Query() dto: ListUsersDto) {
    const {
      search,
      status,
      role,
      verificationStatus,
      isAdmin,
      includeDeleted,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = dto;

    const query: FilterQuery<User> = {};

    if (!includeDeleted) {
      query.deletedAt = null;
      query.status = { $ne: UserStatus.DELETED };
    }

    if (search) {
      query.$or = [
        { phone: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.status = status;
    }

    if (role) {
      query.roles = role;
    }

    if (verificationStatus && verificationStatus !== 'all') {
      if (role === UserRole.MERCHANT) {
        if (verificationStatus === 'verified') {
          query.merchant_status = CapabilityStatus.APPROVED;
        } else if (verificationStatus === 'unverified') {
          query.merchant_status = {
            $in: [
              CapabilityStatus.NONE,
              CapabilityStatus.UNVERIFIED,
              CapabilityStatus.PENDING,
              CapabilityStatus.REJECTED,
            ],
          };
        }
      } else if (role === UserRole.ENGINEER) {
        if (verificationStatus === 'verified') {
          query.engineer_status = CapabilityStatus.APPROVED;
        } else if (verificationStatus === 'unverified') {
          query.engineer_status = {
            $in: [
              CapabilityStatus.NONE,
              CapabilityStatus.UNVERIFIED,
              CapabilityStatus.PENDING,
              CapabilityStatus.REJECTED,
            ],
          };
        }
      }
    }

    if (isAdmin !== undefined) {
      if (isAdmin) {
        query.roles = { $in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] };
      } else {
        query.roles = { $nin: [UserRole.ADMIN, UserRole.SUPER_ADMIN] };
      }
    }

    const sort: Record<string, SortOrder> = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const users = await this.userModel
      .find(query)
      .select('_id')
      .sort(sort)
      .limit(10000)
      .lean();

    return {
      ids: users.map((u) => String(u._id)),
    };
  }

  // ==================== قائمة الحسابات المحذوفة مع السبب ====================
  @RequirePermissions('users.read', 'admin.access')
  @Get('deleted')
  @ApiOperation({
    summary: 'الحسابات المحذوفة',
    description: 'استرداد قائمة بجميع الحسابات المحذوفة مع سبب الحذف',
  })
  @ApiQuery({ type: ListUsersDto })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد الحسابات المحذوفة بنجاح',
    schema: {
      type: 'object',
      properties: {
        deletedUsers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: 'user123', description: 'معرف المستخدم' },
              phone: { type: 'string', example: '+967771234567', description: 'رقم الهاتف' },
              firstName: { type: 'string', example: 'أحمد', description: 'الاسم الأول' },
              lastName: { type: 'string', example: 'محمد', description: 'الاسم الأخير' },
              deletionReason: {
                type: 'string',
                example: 'لا أستخدم التطبيق بعد الآن',
                description: 'سبب الحذف',
              },
              deletedAt: {
                type: 'string',
                format: 'date-time',
                example: '2024-01-15T10:30:00Z',
                description: 'تاريخ الحذف',
              },
              deletedBy: {
                type: 'string',
                example: 'user456',
                description: 'معرف من قام بالحذف (null إذا حذف المستخدم حسابه بنفسه)',
              },
              createdAt: {
                type: 'string',
                format: 'date-time',
                example: '2023-01-01T10:00:00Z',
                description: 'تاريخ الإنشاء',
              },
            },
          },
        },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 20 },
            total: { type: 'number', example: 50 },
            totalPages: { type: 'number', example: 3 },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'غير مصرح لك بالوصول إلى الحسابات المحذوفة',
  })
  async getDeletedUsers(@Query() dto: ListUsersDto) {
    const { page = 1, limit = 20, search, sortBy = 'deletedAt', sortOrder = 'desc' } = dto;

    const skip = (page - 1) * limit;

    // بناء query للحسابات المحذوفة
    const baseQuery: FilterQuery<User>[] = [
      { deletedAt: { $ne: null } },
      { status: UserStatus.DELETED },
    ];

    const query: FilterQuery<User> = {
      $or: baseQuery,
    };

    // البحث في الحسابات المحذوفة
    if (search) {
      const searchConditions = [
        { phone: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { deletionReason: { $regex: search, $options: 'i' } },
      ];

      // دمج شروط البحث مع شروط الحذف
      query.$and = [{ $or: baseQuery }, { $or: searchConditions }];
      delete query.$or; // إزالة $or لأننا استخدمنا $and
    }

    // الترتيب - افتراضي حسب تاريخ الحذف
    const sort: Record<string, SortOrder> = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // جلب الحسابات المحذوفة مع الحقول المهمة
    const [deletedUsers, total] = await Promise.all([
      this.userModel.find(query).select('-passwordHash').sort(sort).skip(skip).limit(limit).lean(),
      this.userModel.countDocuments(query),
    ]);

    // تنسيق البيانات مع التأكد من إظهار سبب الحذف
    const formattedUsers = deletedUsers.map((user) => {
      const userWithTimestamps = user as typeof user & { createdAt: Date };
      return {
        id: user._id,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        deletionReason: user.deletionReason || 'لم يتم تحديد السبب',
        deletedAt: user.deletedAt,
        deletedBy: user.deletedBy, // null إذا حذف المستخدم حسابه بنفسه
        createdAt: userWithTimestamps.createdAt,
        status: user.status,
      };
    });

    return {
      deletedUsers: formattedUsers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }

  // ==================== عرض مستخدم واحد ====================
  @RequirePermissions('users.read', 'admin.access')
  @Get(':id')
  async getUser(@Param('id') id: string) {
    const user = await this.userModel.findById(id).select('-passwordHash').lean();
    if (!user) {
      throw new UserNotFoundException({ userId: id });
    }

    const capabilities = await this.capsModel.findOne({ userId: id }).lean();

    return {
      ...user,
      capabilities,
    };
  }

  // ==================== إنشاء أدمن مع صلاحيات مخصصة ====================
  @RequirePermissions('users.create', 'super_admin.access')
  @Post('create-admin')
  async createAdmin(@Body() dto: CreateAdminDto, @Req() req: { user: { sub: string } } & Request) {
    // التحقق من عدم وجود المستخدم
    const existingUser = await this.userModel.findOne({ phone: dto.phone });
    if (existingUser) {
      throw new AuthException(ErrorCode.AUTH_PHONE_EXISTS, { phone: dto.phone });
    }

    // إنشاء كلمة مرور مؤقتة إذا لم يتم تحديدها
    let passwordHash: string | undefined;
    if (dto.temporaryPassword) {
      passwordHash = await hash(dto.temporaryPassword, 10);
    }

    // إنشاء المستخدم
    const user = await this.userModel.create({
      phone: dto.phone,
      firstName: dto.firstName,
      lastName: dto.lastName,
      gender: dto.gender,
      roles: dto.roles,
      permissions: dto.permissions,
      passwordHash,
      status: dto.activateImmediately ? UserStatus.ACTIVE : UserStatus.PENDING,
    });

    // إنشاء Capabilities
    const capsData: Partial<Capabilities> = {
      userId: user._id.toString(),
      customer_capable: true,
    };

    // إضافة capabilities حسب الأدوار
    if (dto.roles.includes(UserRole.ADMIN) || dto.roles.includes(UserRole.SUPER_ADMIN)) {
      capsData.admin_capable = true;
      capsData.admin_status = 'approved';
    }

    await this.capsModel.create(capsData);

    // تسجيل حدث إنشاء الأدمن
    this.auditService
      .logUserEvent({
        userId: String(user._id),
        action: 'created',
        performedBy: req.user.sub,
        newValues: {
          phone: user.phone,
          roles: user.roles,
          permissions: user.permissions,
          status: user.status,
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      })
      .catch((err) => this.logger?.error('Failed to log user event', err));

    return {
      id: user._id,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles,
      permissions: user.permissions,
      status: user.status,
      temporaryPassword: dto.temporaryPassword ? dto.temporaryPassword : undefined,
      loginUrl: dto.temporaryPassword ? `/admin/login` : undefined,
      message: 'تم إنشاء الأدمن بنجاح. تأكد من مشاركة معلومات تسجيل الدخول معه بشكل آمن.',
    };
  }

  // ==================== إنشاء أدمن بناءً على الدور ====================
  @RequirePermissions('users.create', 'super_admin.access')
  @Post('create-role-admin')
  async createRoleBasedAdmin(
    @Body() dto: CreateRoleBasedAdminDto,
    @Req() req: { user: { sub: string } } & Request,
  ) {
    // تحديد الأدوار والصلاحيات بناءً على النوع
    let roles: UserRole[] = [UserRole.ADMIN];
    let permissions: AdminPermission[] = [];

    switch (dto.adminType) {
      case 'full_admin':
        roles = [UserRole.ADMIN, UserRole.SUPER_ADMIN];
        permissions = PERMISSION_GROUPS.FULL_ADMIN;
        break;
      case 'product_manager':
        permissions = [...PERMISSION_GROUPS.PRODUCT_MANAGER];
        break;
      case 'sales_manager':
        permissions = [...PERMISSION_GROUPS.SALES_MANAGER];
        break;
      case 'support_manager':
        permissions = [...PERMISSION_GROUPS.SUPPORT_MANAGER];
        break;
      case 'marketing_manager':
        permissions = [...PERMISSION_GROUPS.MARKETING_MANAGER];
        break;
      case 'content_manager':
        permissions = [...PERMISSION_GROUPS.CONTENT_MANAGER];
        break;
      case 'view_only':
        permissions = [...PERMISSION_GROUPS.VIEW_ONLY_ADMIN];
        break;
      default:
        throw new AuthException(ErrorCode.VALIDATION_ERROR, { field: 'adminType' });
    }

    // إضافة الصلاحيات الإضافية إذا تم تحديدها
    if (dto.additionalPermissions) {
      permissions = [...permissions, ...dto.additionalPermissions];
      // إزالة التكرارات
      permissions = [...new Set(permissions)];
    }

    // إنشاء الأدمن باستخدام الصلاحيات المحددة
    const adminDto: CreateAdminDto = {
      phone: dto.phone,
      firstName: dto.firstName,
      lastName: dto.lastName,
      gender: dto.gender,
      roles,
      permissions,
      temporaryPassword: `Temp${Math.random().toString(36).substr(2, 8)}!`,
      activateImmediately: true,
      description: dto.description,
    };

    return await this.createAdmin(adminDto, req);
  }

  /**
   * إرسال إشعارات للإداريين
   */
  private async notifyAdmins(
    type: NotificationType,
    title: string,
    message: string,
    messageEn: string,
    data?: Record<string, unknown>,
  ) {
    try {
      if (!this.notificationService) return;

      const admins = await this.userModel
        .find({
          roles: { $in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
          status: UserStatus.ACTIVE,
        })
        .select('_id')
        .lean();

      const notificationPromises = admins.map((admin) =>
        this.notificationService!.createNotification({
          recipientId: admin._id.toString(),
          type,
          title,
          message,
          messageEn,
          data,
          channel: NotificationChannel.IN_APP,
          priority: NotificationPriority.HIGH,
        }),
      );

      await Promise.all(notificationPromises);
      this.logger.log(`Sent ${type} notification to ${admins.length} admin(s)`);
    } catch (error) {
      this.logger.warn(`Failed to notify admins:`, error);
    }
  }

  // ==================== إنشاء مستخدم عادي ====================
  @RequirePermissions('users.create', 'admin.access')
  @Post()
  async createUser(
    @Body() dto: CreateUserAdminDto,
    @Req() req: { user: { sub: string } } & Request,
  ) {
    // التحقق من عدم وجود المستخدم
    const existingUser = await this.userModel.findOne({ phone: dto.phone });
    if (existingUser) {
      throw new AuthException(ErrorCode.AUTH_PHONE_EXISTS, { phone: dto.phone });
    }

    // تجهيز البيانات
    const userData: Partial<User> & { passwordHash?: string } = {
      phone: dto.phone,
      firstName: dto.firstName,
      lastName: dto.lastName,
      gender: dto.gender,
      city: dto.city || 'صنعاء', // المدينة - افتراضي صنعاء
      roles: dto.roles || [UserRole.USER],
      permissions: dto.permissions || [],
      status: dto.status || UserStatus.ACTIVE,
      // القدرات الافتراضية
      customer_capable: true,
      engineer_capable: false,
      engineer_status: CapabilityStatus.NONE,
      merchant_capable: false,
      merchant_status: CapabilityStatus.NONE,
      merchant_discount_percent: 0,
      admin_capable: false,
      admin_status: CapabilityStatus.NONE,
    };

    // معالجة طلبات القدرات - تحديث userData مباشرة
    if (dto.capabilityRequest === 'engineer') {
      userData.engineer_capable = true;
      userData.engineer_status = CapabilityStatus.APPROVED;
    }

    if (dto.capabilityRequest === 'merchant') {
      userData.merchant_capable = true;
      userData.merchant_status = CapabilityStatus.APPROVED;
      userData.merchant_discount_percent = dto.merchantDiscountPercent || 0;
    }

    // تحديث القدرات للأدمن وإضافة الصلاحيات الأساسية
    if (dto.roles?.includes(UserRole.ADMIN) || dto.roles?.includes(UserRole.SUPER_ADMIN)) {
      userData.admin_capable = true;
      userData.admin_status = CapabilityStatus.APPROVED;

      // إضافة admin.access تلقائياً إذا لم يكن موجوداً
      if (!userData.permissions || !Array.isArray(userData.permissions)) {
        userData.permissions = [];
      }
      if (!userData.permissions.includes(AdminPermission.ADMIN_ACCESS)) {
        userData.permissions.push(AdminPermission.ADMIN_ACCESS);
      }

      // إضافة super_admin.access للـ SUPER_ADMIN
      if (
        dto.roles?.includes(UserRole.SUPER_ADMIN) &&
        !userData.permissions.includes(AdminPermission.SUPER_ADMIN_ACCESS)
      ) {
        userData.permissions.push(AdminPermission.SUPER_ADMIN_ACCESS);
      }
    }

    // إضافة كلمة المرور إن وجدت
    if (dto.password) {
      userData.passwordHash = await hash(dto.password, 10);
    }

    // إنشاء المستخدم
    const user = await this.userModel.create(userData);

    // إنشاء Capabilities في الجدول المنفصل (للتوافق مع النظام القديم)
    const capsData: Partial<Capabilities> = {
      userId: user._id.toString(),
      customer_capable: user.customer_capable,
      engineer_capable: user.engineer_capable,
      engineer_status: user.engineer_status,
      merchant_capable: user.merchant_capable,
      merchant_status: user.merchant_status,
      merchant_discount_percent: user.merchant_discount_percent,
      admin_capable: user.admin_capable,
      admin_status: user.admin_status,
    };

    await this.capsModel.create(capsData);

    // إنشاء بروفايل المهندس إذا كان مهندساً
    if (dto.capabilityRequest === 'engineer' && dto.jobTitle) {
      await this.engineerProfileModel.create({
        userId: user._id,
        jobTitle: dto.jobTitle,
        ratings: [],
        totalRatings: 0,
        averageRating: 0,
        ratingDistribution: [0, 0, 0, 0, 0],
        totalCompletedServices: 0,
        totalEarnings: 0,
        walletBalance: 0,
        commissionTransactions: [],
      });
    }

    // تسجيل حدث إنشاء المستخدم
    this.auditService
      .logUserEvent({
        userId: String(user._id),
        action: 'created',
        performedBy: req.user.sub,
        newValues: {
          phone: user.phone,
          roles: user.roles,
          status: user.status,
        },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      })
      .catch((err) => this.logger?.error('Failed to log user event', err));

    // إرسال إشعار NEW_USER_REGISTERED للإداريين (استثناء منشئ الحساب)
    await this.notifyAdmins(
      NotificationType.NEW_USER_REGISTERED,
      'مستخدم جديد',
      `تم إنشاء مستخدم جديد من قبل الإدارة: ${user.firstName || ''} ${user.lastName || ''} (${user.phone})`,
      `New user created by admin: ${user.firstName || ''} ${user.lastName || ''} (${user.phone})`,
      {
        userId: user._id.toString(),
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        status: user.status,
        createdBy: req.user.sub,
      },
    );

    return {
      id: user._id,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles,
      status: user.status,
    };
  }

  // ==================== تحديث مستخدم ====================
  @RequirePermissions('users.update', 'admin.access')
  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserAdminDto,
    @Req() req: { user: { sub: string } } & Request,
  ) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new UserNotFoundException({ userId: id });
    }

    // حفظ القيم القديمة للتسجيل
    const oldValues = {
      roles: user.roles ? [...user.roles] : [],
      permissions: user.permissions ? [...user.permissions] : [],
      status: user.status,
    };

    // منع تعديل Super Admin من قبل Admin عادي
    const adminUser = await this.userModel.findById(req.user.sub);
    if (
      user.roles?.includes(UserRole.SUPER_ADMIN) &&
      !adminUser?.roles?.includes(UserRole.SUPER_ADMIN)
    ) {
      throw new ForbiddenException({ reason: 'cannot_edit_super_admin' });
    }

    // تحديث الحقول
    if (dto.firstName !== undefined) user.firstName = dto.firstName;
    if (dto.lastName !== undefined) user.lastName = dto.lastName;
    if (dto.gender !== undefined) user.gender = dto.gender;
    if (dto.city !== undefined) user.city = dto.city;

    // تحديث jobTitle في بروفايل المهندس
    if (dto.jobTitle !== undefined && user.engineer_capable) {
      const profile = await this.engineerProfileModel.findOne({ userId: user._id });
      if (profile) {
        profile.jobTitle = dto.jobTitle;
        await profile.save();
      } else if (dto.jobTitle) {
        // إنشاء بروفايل جديد إذا لم يكن موجوداً
        await this.engineerProfileModel.create({
          userId: user._id,
          jobTitle: dto.jobTitle,
          ratings: [],
          totalRatings: 0,
          averageRating: 0,
          ratingDistribution: [0, 0, 0, 0, 0],
          totalCompletedServices: 0,
          totalEarnings: 0,
          walletBalance: 0,
          commissionTransactions: [],
        });
      }
    }
    if (dto.roles !== undefined) user.roles = dto.roles;
    if (dto.permissions !== undefined) {
      // التأكد من وجود admin.access للأدمن
      const permissions = Array.isArray(dto.permissions) ? [...dto.permissions] : [];
      const mainRole = dto.roles?.[0] || user.roles?.[0];

      if (mainRole === UserRole.ADMIN || mainRole === UserRole.SUPER_ADMIN) {
        // إضافة admin.access تلقائياً إذا لم يكن موجوداً
        if (!permissions.includes(AdminPermission.ADMIN_ACCESS)) {
          permissions.push(AdminPermission.ADMIN_ACCESS);
        }

        // إضافة super_admin.access للـ SUPER_ADMIN
        if (
          mainRole === UserRole.SUPER_ADMIN &&
          !permissions.includes(AdminPermission.SUPER_ADMIN_ACCESS)
        ) {
          permissions.push(AdminPermission.SUPER_ADMIN_ACCESS);
        }
      }

      user.permissions = permissions;
    }
    if (dto.status !== undefined) user.status = dto.status;

    // تحديث كلمة المرور
    if (dto.password) {
      user.passwordHash = await hash(dto.password, 10);
    }

    // تحديث القدرات في User نفسه حسب النوع
    // ⚠️ فقط عند تغيير الأدوار بشكل صريح (وليس فارغ)
    if (dto.roles !== undefined && dto.roles.length > 0) {
      const mainRole = dto.roles[0];

      // حفظ الحالات الخاصة (unverified/pending) قبل إعادة التعيين
      const preserveEngineerStatus =
        user.engineer_capable &&
        (user.engineer_status === CapabilityStatus.UNVERIFIED ||
          user.engineer_status === CapabilityStatus.PENDING);

      const preserveMerchantStatus =
        user.merchant_capable &&
        (user.merchant_status === CapabilityStatus.UNVERIFIED ||
          user.merchant_status === CapabilityStatus.PENDING);

      // تنظيف القدرات القديمة أولاً (ما عدا الحالات المحفوظة)
      if (!preserveEngineerStatus) {
        user.engineer_capable = false;
        user.engineer_status = CapabilityStatus.NONE;
      }
      if (!preserveMerchantStatus) {
        user.merchant_capable = false;
        user.merchant_status = CapabilityStatus.NONE;
        user.merchant_discount_percent = 0;
      }
      user.admin_capable = false;
      user.admin_status = CapabilityStatus.NONE;

      // إضافة القدرات حسب النوع الجديد
      if (mainRole === UserRole.ENGINEER) {
        // فقط إذا لم تكن الحالة محفوظة (unverified/pending)
        if (!preserveEngineerStatus) {
          user.engineer_capable = true;
          user.engineer_status = CapabilityStatus.APPROVED;
        }
      } else if (mainRole === UserRole.MERCHANT) {
        // فقط إذا لم تكن الحالة محفوظة (unverified/pending)
        if (!preserveMerchantStatus) {
          user.merchant_capable = true;
          user.merchant_status = CapabilityStatus.APPROVED;
          user.merchant_discount_percent = dto.merchantDiscountPercent || 0;
        }
      } else if (mainRole === UserRole.ADMIN || mainRole === UserRole.SUPER_ADMIN) {
        user.admin_capable = true;
        user.admin_status = CapabilityStatus.APPROVED;
      }
    }
    // إذا لم يتم إرسال roles أو كان فارغاً، لا تغير القدرات على الإطلاق

    await user.save();

    // تحديث Capabilities في الجدول المنفصل (للتوافق مع النظام القديم)
    let capabilities = await this.capsModel.findOne({ userId: id });
    if (!capabilities) {
      capabilities = await this.capsModel.create({
        userId: id,
        customer_capable: user.customer_capable,
        engineer_capable: user.engineer_capable,
        engineer_status: user.engineer_status,
        merchant_capable: user.merchant_capable,
        merchant_status: user.merchant_status,
        merchant_discount_percent: user.merchant_discount_percent,
        admin_capable: user.admin_capable,
        admin_status: user.admin_status,
      });
    } else {
      // تحديث القدرات الموجودة
      capabilities.customer_capable = user.customer_capable;
      capabilities.engineer_capable = user.engineer_capable;
      capabilities.engineer_status = user.engineer_status;
      capabilities.merchant_capable = user.merchant_capable;
      capabilities.merchant_status = user.merchant_status;
      capabilities.merchant_discount_percent = user.merchant_discount_percent;
      capabilities.admin_capable = user.admin_capable;
      capabilities.admin_status = user.admin_status;
      await capabilities.save();
    }

    // تسجيل حدث تحديث المستخدم
    const newValues = {
      roles: user.roles ? [...user.roles] : [],
      permissions: user.permissions ? [...user.permissions] : [],
      status: user.status,
    };

    this.auditService
      .logUserEvent({
        userId: id,
        action: 'updated',
        performedBy: req.user.sub,
        oldValues,
        newValues,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      })
      .catch((err) => this.logger?.error('Failed to log user event', err));

    // تسجيل تغييرات الأدوار إذا تغيرت
    if (
      dto.roles !== undefined &&
      JSON.stringify(oldValues.roles) !== JSON.stringify(newValues.roles)
    ) {
      const addedRoles = newValues.roles.filter((r) => !oldValues.roles.includes(r));
      const removedRoles = oldValues.roles.filter((r) => !newValues.roles.includes(r));

      for (const role of addedRoles) {
        this.auditService
          .logRoleChange({
            userId: id,
            role,
            action: 'assign',
            changedBy: req.user.sub,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
          })
          .catch((err) => this.logger?.error('Failed to log role change', err));
      }

      for (const role of removedRoles) {
        this.auditService
          .logRoleChange({
            userId: id,
            role,
            action: 'remove',
            changedBy: req.user.sub,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
          })
          .catch((err) => this.logger?.error('Failed to log role change', err));
      }
    }

    return {
      id: user._id,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      roles: user.roles,
      status: user.status,
      updated: true,
    };
  }

  // ==================== إيقاف مستخدم ====================
  @RequirePermissions('users.update', 'admin.access')
  @Post(':id/suspend')
  async suspendUser(
    @Param('id') id: string,
    @Body() dto: SuspendUserDto,
    @Req() req: { user: { sub: string } } & Request,
  ) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new UserNotFoundException({ userId: id });
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new AuthException(ErrorCode.AUTH_USER_SUSPENDED, { userId: id });
    }

    const oldStatus = user.status;
    user.status = UserStatus.SUSPENDED;
    user.suspendedReason = dto.reason || 'لم يتم تحديد السبب';
    user.suspendedBy = req.user.sub;
    user.suspendedAt = new Date();

    await user.save();

    // تسجيل حدث تعليق المستخدم
    this.auditService
      .logUserEvent({
        userId: id,
        action: 'suspended',
        performedBy: req.user.sub,
        oldValues: { status: oldStatus },
        newValues: { status: user.status },
        reason: dto.reason,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      })
      .catch((err) => this.logger?.error('Failed to log user event', err));

    return {
      id: user._id,
      status: user.status,
      suspended: true,
    };
  }

  // ==================== تفعيل مستخدم ====================
  @RequirePermissions('users.update', 'admin.access')
  @Post(':id/activate')
  async activateUser(@Param('id') id: string, @Req() req: { user: { sub: string } } & Request) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new UserNotFoundException({ userId: id });
    }

    const oldStatus = user.status;
    user.status = UserStatus.ACTIVE;
    user.suspendedReason = undefined;
    user.suspendedBy = undefined;
    user.suspendedAt = undefined;

    await user.save();

    // تسجيل حدث تفعيل المستخدم
    this.auditService
      .logUserEvent({
        userId: id,
        action: 'activated',
        performedBy: req.user.sub,
        oldValues: { status: oldStatus },
        newValues: { status: user.status },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      })
      .catch((err) => this.logger?.error('Failed to log user event', err));

    return {
      id: user._id,
      status: user.status,
      activated: true,
    };
  }

  // ==================== Soft Delete مستخدم ====================
  @RequirePermissions('users.delete', 'admin.access')
  @Delete(':id')
  async deleteUser(@Param('id') id: string, @Req() req: { user: { sub: string } } & Request) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new UserNotFoundException({ userId: id });
    }

    if (user.deletedAt) {
      throw new AuthException(ErrorCode.AUTH_USER_DELETED, { userId: id });
    }

    // منع حذف Super Admin
    if (user.roles?.includes(UserRole.SUPER_ADMIN)) {
      throw new ForbiddenException({ reason: 'cannot_delete_super_admin' });
    }

    const oldStatus = user.status;
    // Soft delete - إصلاح منطق الحذف الناعم
    user.deletedAt = new Date();
    user.deletedBy = req.user.sub;
    user.status = UserStatus.DELETED; // استخدام الحالة الجديدة

    await user.save();

    // تسجيل حدث حذف المستخدم
    this.auditService
      .logUserEvent({
        userId: id,
        action: 'deleted',
        performedBy: req.user.sub,
        oldValues: { status: oldStatus },
        newValues: { status: user.status },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      })
      .catch((err) => this.logger?.error('Failed to log user event', err));

    return {
      id: user._id,
      deleted: true,
      deletedAt: user.deletedAt,
    };
  }

  // ==================== استعادة مستخدم محذوف ====================
  @RequirePermissions('users.update', 'admin.access')
  @Post(':id/restore')
  async restoreUser(@Param('id') id: string) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new UserNotFoundException({ userId: id });
    }

    if (!user.deletedAt && user.status !== UserStatus.DELETED) {
      throw new AuthException(ErrorCode.USER_INVALID_DATA, { userId: id, reason: 'not_deleted' });
    }

    user.deletedAt = null;
    user.deletedBy = undefined;
    user.status = UserStatus.ACTIVE;

    await user.save();

    return {
      id: user._id,
      restored: true,
    };
  }

  // ==================== حذف نهائي (Hard Delete) ====================
  @RequirePermissions('users.delete', 'super_admin.access')
  @Roles(UserRole.SUPER_ADMIN) // فقط Super Admin
  @Delete(':id/permanent')
  async permanentDelete(@Param('id') id: string, @Req() req: { user: { sub: string } } & Request) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new UserNotFoundException({ userId: id });
    }

    if (!user.deletedAt && user.status !== UserStatus.DELETED) {
      throw new AuthException(ErrorCode.USER_INVALID_DATA, {
        userId: id,
        reason: 'user_must_be_soft_deleted_first',
      });
    }

    if (user.roles?.includes(UserRole.SUPER_ADMIN)) {
      throw new ForbiddenException({ reason: 'cannot_delete_super_admin' });
    }

    const [userDeleteResult, capsDeleteResult, engineerProfileDeleteResult] = await Promise.all([
      this.userModel.deleteOne({ _id: id }),
      this.capsModel.deleteOne({ userId: id }),
      this.engineerProfileModel.deleteOne({ userId: user._id }),
    ]);

    await this.auditService.logAdminAction({
      adminId: req.user.sub,
      action: 'permanent_delete_user',
      resource: 'user',
      resourceId: id,
      details: {
        phone: user.phone,
        roles: user.roles,
        previousStatus: user.status,
        deletedAt: user.deletedAt,
        deletedDocs: {
          user: userDeleteResult.deletedCount || 0,
          capabilities: capsDeleteResult.deletedCount || 0,
          engineerProfile: engineerProfileDeleteResult.deletedCount || 0,
        },
      },
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      reason: 'permanent_user_deletion_from_admin_dashboard',
    });

    return {
      id,
      permanentlyDeleted: true,
    };
  }

  // ==================== إحصائيات المستخدمين ====================
  @RequirePermissions('analytics.read', 'admin.access')
  @Get('stats/summary')
  async getUserStats() {
    const [total, active, suspended, deleted, admins, engineers, merchants, regularUsers] =
      await Promise.all([
        this.userModel.countDocuments({
          deletedAt: null,
          status: { $ne: UserStatus.DELETED },
        }),
        this.userModel.countDocuments({
          status: UserStatus.ACTIVE,
          deletedAt: null,
        }),
        this.userModel.countDocuments({
          status: UserStatus.SUSPENDED,
          deletedAt: null,
        }),
        this.userModel.countDocuments({
          $or: [{ deletedAt: { $ne: null } }, { status: UserStatus.DELETED }],
        }),
        // Admins: من لديه admin أو super_admin فقط
        this.userModel.countDocuments({
          roles: { $in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] },
          deletedAt: null,
          status: { $ne: UserStatus.DELETED },
        }),
        // Engineers: من لديه engineer ولكن ليس admin أو super_admin
        this.userModel.countDocuments({
          $and: [
            { roles: UserRole.ENGINEER },
            { roles: { $nin: [UserRole.ADMIN, UserRole.SUPER_ADMIN] } },
          ],
          deletedAt: null,
          status: { $ne: UserStatus.DELETED },
        }),
        // Merchants: من لديه merchant ولكن ليس admin أو super_admin
        this.userModel.countDocuments({
          $and: [
            { roles: UserRole.MERCHANT },
            { roles: { $nin: [UserRole.ADMIN, UserRole.SUPER_ADMIN] } },
          ],
          deletedAt: null,
          status: { $ne: UserStatus.DELETED },
        }),
        // Regular Users: من لديه user فقط (ليس admin/super_admin/engineer/merchant)
        this.userModel.countDocuments({
          $and: [
            { roles: UserRole.USER },
            {
              roles: {
                $nin: [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.ENGINEER, UserRole.MERCHANT],
              },
            },
          ],
          deletedAt: null,
          status: { $ne: UserStatus.DELETED },
        }),
      ]);

    return {
      total,
      active,
      suspended,
      deleted,
      admins,
      engineers,
      merchants,
      users: regularUsers,
    };
  }

  // ==================== قائمة طلبات التحقق قيد المراجعة ====================
  @RequirePermissions('users.read', 'admin.access')
  @Get('verification/pending')
  @ApiOperation({
    summary: 'قائمة طلبات التحقق قيد المراجعة',
    description: 'عرض جميع طلبات التحقق للمهندسين والتجار التي في حالة PENDING',
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد قائمة طلبات التحقق بنجاح',
  })
  async getPendingVerifications() {
    const pendingUsers = await this.userModel
      .find({
        $or: [
          { engineer_status: CapabilityStatus.PENDING },
          { merchant_status: CapabilityStatus.PENDING },
        ],
        deletedAt: null,
      })
      .select(
        'phone firstName lastName engineer_status merchant_status storePhotoUrl storeName verificationNote createdAt',
      )
      .sort({ createdAt: -1 })
      .lean();

    // جلب بروفايلات المهندسين
    const engineerIds = pendingUsers
      .filter((u) => u.engineer_status === CapabilityStatus.PENDING)
      .map((u) => u._id);

    const profiles = await this.engineerProfileModel
      .find({ userId: { $in: engineerIds } })
      .select('userId cvFileUrl')
      .lean();

    const profilesMap = new Map(profiles.map((p) => [p.userId.toString(), p]));

    const formatted = pendingUsers.map((user) => {
      const userWithTimestamps = user as typeof user & { createdAt: Date };
      const profile = profilesMap.get(user._id.toString());
      return {
        id: user._id,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        verificationType:
          user.engineer_status === CapabilityStatus.PENDING ? 'engineer' : 'merchant',
        cvFileUrl: profile?.cvFileUrl,
        storePhotoUrl: user.storePhotoUrl,
        storeName: user.storeName,
        verificationNote: user.verificationNote,
        createdAt: userWithTimestamps.createdAt,
      };
    });

    return {
      data: formatted,
      total: formatted.length,
    };
  }

  // ==================== تفاصيل طلب التحقق ====================
  @RequirePermissions('users.read', 'admin.access')
  @Get('verification/:userId')
  @ApiOperation({
    summary: 'تفاصيل طلب التحقق',
    description: 'عرض تفاصيل كاملة لطلب التحقق لمستخدم محدد',
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد تفاصيل طلب التحقق بنجاح',
  })
  @ApiResponse({
    status: 404,
    description: 'المستخدم غير موجود أو ليس لديه طلب تحقق قيد المراجعة',
  })
  async getVerificationDetails(@Param('userId') userId: string) {
    const user = await this.userModel.findById(userId).select('-passwordHash').lean();
    if (!user) {
      throw new UserNotFoundException({ userId });
    }

    // التحقق من وجود طلب تحقق قيد المراجعة
    const hasPendingVerification =
      user.engineer_status === CapabilityStatus.PENDING ||
      user.merchant_status === CapabilityStatus.PENDING;

    if (!hasPendingVerification) {
      throw new UserNotFoundException({
        userId,
        message: 'المستخدم ليس لديه طلب تحقق قيد المراجعة',
      });
    }

    // جلب بروفايل المهندس إذا كان مهندساً
    let profile = null;
    if (user.engineer_status === CapabilityStatus.PENDING) {
      profile = await this.engineerProfileModel
        .findOne({ userId: user._id })
        .select('jobTitle cvFileUrl')
        .lean();
    }

    const userWithTimestamps = user as typeof user & { createdAt: Date; updatedAt: Date };
    return {
      data: {
        id: user._id,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        jobTitle: profile?.jobTitle,
        verificationType:
          user.engineer_status === CapabilityStatus.PENDING ? 'engineer' : 'merchant',
        cvFileUrl: profile?.cvFileUrl,
        storePhotoUrl: user.storePhotoUrl,
        storeName: user.storeName,
        verificationNote: user.verificationNote,
        engineerStatus: user.engineer_status,
        merchantStatus: user.merchant_status,
        createdAt: userWithTimestamps.createdAt,
        updatedAt: userWithTimestamps.updatedAt,
      },
    };
  }

  // ==================== الموافقة على التحقق ====================
  @RequirePermissions('users.update', 'admin.access')
  @Post('verification/:userId/approve')
  @ApiOperation({
    summary: 'الموافقة على التحقق',
    description: 'الموافقة على طلب التحقق للمهندس أو التاجر وتحديث الحالة إلى APPROVED',
  })
  @ApiResponse({
    status: 200,
    description: 'تمت الموافقة على التحقق بنجاح',
  })
  @ApiResponse({
    status: 404,
    description: 'المستخدم غير موجود أو ليس لديه طلب تحقق قيد المراجعة',
  })
  async approveVerification(
    @Param('userId') userId: string,
    @Req() req: { user: { sub: string } } & Request,
  ) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UserNotFoundException({ userId });
    }

    // التحقق من وجود طلب قيد المراجعة
    const isEngineerPending = user.engineer_status === CapabilityStatus.PENDING;
    const isMerchantPending = user.merchant_status === CapabilityStatus.PENDING;

    if (!isEngineerPending && !isMerchantPending) {
      throw new UserNotFoundException({
        userId,
        message: 'المستخدم ليس لديه طلب تحقق قيد المراجعة',
      });
    }

    const oldValues: Record<string, unknown> = {};
    const newValues: Record<string, unknown> = {};

    // الموافقة على التحقق
    if (isEngineerPending) {
      oldValues.engineer_status = user.engineer_status;
      user.engineer_status = CapabilityStatus.APPROVED;
      newValues.engineer_status = user.engineer_status;
      if (!user.roles.includes(UserRole.ENGINEER)) {
        user.roles.push(UserRole.ENGINEER);
      }
    }

    if (isMerchantPending) {
      oldValues.merchant_status = user.merchant_status;
      user.merchant_status = CapabilityStatus.APPROVED;
      newValues.merchant_status = user.merchant_status;
      if (!user.roles.includes(UserRole.MERCHANT)) {
        user.roles.push(UserRole.MERCHANT);
      }
    }

    await user.save();

    // تحديث Capabilities في الجدول المنفصل
    const caps = await this.capsModel.findOne({ userId });
    if (caps) {
      if (isEngineerPending) {
        caps.engineer_status = CapabilityStatus.APPROVED;
        caps.engineer_capable = true;
        await caps.save();

        // إنشاء بروفايل المهندس تلقائياً عند الموافقة
        const existingProfile = await this.engineerProfileModel.findOne({ userId });
        if (!existingProfile) {
          try {
            await this.engineerProfileService.createProfile(userId);
            this.logger.log(`Created engineer profile for approved user ${userId}`);
          } catch (error) {
            this.logger.error(`Failed to create engineer profile for user ${userId}:`, error);
            // لا نرمي خطأ هنا لأن الموافقة تمت بنجاح، فقط نسجل الخطأ
          }
        }
      }
      if (isMerchantPending) {
        caps.merchant_status = CapabilityStatus.APPROVED;
        caps.merchant_capable = true;
        await caps.save();
      }
    }

    // تسجيل حدث الموافقة على capability
    const capabilityType = isEngineerPending ? 'engineer' : 'merchant';
    this.auditService
      .logCapabilityDecision({
        userId,
        capability: capabilityType,
        action: 'approve',
        decidedBy: req.user.sub,
        oldValues,
        newValues,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      })
      .catch((err) => this.logger?.error('Failed to log capability decision', err));

    // إرسال إشعار للمستخدم بالموافقة
    if (this.notificationService) {
      const typeLabel = capabilityType === 'engineer' ? 'مهندس' : 'تاجر';
      try {
        await this.notificationService.createNotification({
          recipientId: userId,
          type: NotificationType.VERIFICATION_APPROVED,
          title: 'تم قبول طلب التوثيق',
          message: `تم قبول طلب توثيقك كـ ${typeLabel}. يمكنك الآن الاستفادة من جميع المميزات.`,
          messageEn: `Your verification request as ${capabilityType} has been approved. You can now enjoy all features.`,
          channel: NotificationChannel.IN_APP,
          priority: NotificationPriority.HIGH,
          category: NotificationCategory.ACCOUNT,
          data: {
            verificationType: capabilityType,
          },
          isSystemGenerated: true,
        });
        this.logger.log(`Verification approval notification sent to user ${userId}`);
      } catch (err) {
        this.logger.error('Failed to send verification approval notification', err);
      }
    }

    return {
      success: true,
      message: 'تمت الموافقة على التحقق بنجاح',
      data: {
        userId: user._id,
        verificationType: capabilityType,
        status: 'approved',
      },
    };
  }

  // ==================== رفض التحقق ====================
  @RequirePermissions('users.update', 'admin.access')
  @Post('verification/:userId/reject')
  @ApiOperation({
    summary: 'رفض التحقق',
    description: 'رفض طلب التحقق للمهندس أو التاجر وتحديث الحالة إلى REJECTED',
  })
  @ApiResponse({
    status: 200,
    description: 'تم رفض التحقق بنجاح',
  })
  @ApiResponse({
    status: 404,
    description: 'المستخدم غير موجود أو ليس لديه طلب تحقق قيد المراجعة',
  })
  async rejectVerification(
    @Param('userId') userId: string,
    @Body() dto: ApproveVerificationDto,
    @Req() req: { user: { sub: string } } & Request,
  ) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UserNotFoundException({ userId });
    }

    // التحقق من وجود طلب قيد المراجعة
    const isEngineerPending = user.engineer_status === CapabilityStatus.PENDING;
    const isMerchantPending = user.merchant_status === CapabilityStatus.PENDING;

    if (!isEngineerPending && !isMerchantPending) {
      throw new UserNotFoundException({
        userId,
        message: 'المستخدم ليس لديه طلب تحقق قيد المراجعة',
      });
    }

    const oldValues: Record<string, unknown> = {};
    const newValues: Record<string, unknown> = {};

    // رفض التحقق
    if (isEngineerPending) {
      oldValues.engineer_status = user.engineer_status;
      user.engineer_status = CapabilityStatus.REJECTED;
      newValues.engineer_status = user.engineer_status;
      // لا نحذف الدور - المستخدم يبقى مهندساً لكن بحالة REJECTED
      // مسح ملف السيرة الذاتية من بروفايل المهندس
      const profile = await this.engineerProfileModel.findOne({ userId: user._id });
      if (profile) {
        profile.cvFileUrl = undefined;
        await profile.save();
      }
    }

    if (isMerchantPending) {
      oldValues.merchant_status = user.merchant_status;
      user.merchant_status = CapabilityStatus.REJECTED;
      newValues.merchant_status = user.merchant_status;
      // لا نحذف الدور - المستخدم يبقى تاجراً لكن بحالة REJECTED
      // مسح صورة المحل واسم المحل
      user.storePhotoUrl = undefined;
      user.storeName = undefined;
    }

    // حفظ سبب الرفض في الملاحظة
    if (dto.reason) {
      user.verificationNote = dto.reason;
    }

    await user.save();

    // تحديث Capabilities في الجدول المنفصل
    const caps = await this.capsModel.findOne({ userId });
    if (caps) {
      if (isEngineerPending) {
        caps.engineer_status = CapabilityStatus.REJECTED;
        caps.engineer_capable = false;
      }
      if (isMerchantPending) {
        caps.merchant_status = CapabilityStatus.REJECTED;
        caps.merchant_capable = false;
      }
      await caps.save();
    }

    // تسجيل حدث رفض capability
    const capabilityType = isEngineerPending ? 'engineer' : 'merchant';
    this.auditService
      .logCapabilityDecision({
        userId,
        capability: capabilityType,
        action: 'reject',
        decidedBy: req.user.sub,
        oldValues,
        newValues,
        reason: dto.reason,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      })
      .catch((err) => this.logger?.error('Failed to log capability decision', err));

    // إرسال إشعار للمستخدم بالرفض
    if (this.notificationService) {
      const typeLabel = capabilityType === 'engineer' ? 'مهندس' : 'تاجر';
      const reasonText = dto.reason
        ? `السبب: ${dto.reason}`
        : 'يرجى مراجعة الوثائق المرفوعة وإعادة المحاولة.';
      try {
        await this.notificationService.createNotification({
          recipientId: userId,
          type: NotificationType.VERIFICATION_REJECTED,
          title: 'تم رفض طلب التوثيق',
          message: `تم رفض طلب توثيقك كـ ${typeLabel}. ${reasonText}`,
          messageEn: `Your verification request as ${capabilityType} has been rejected. ${dto.reason ? `Reason: ${dto.reason}` : 'Please review the uploaded documents and try again.'}`,
          channel: NotificationChannel.IN_APP,
          priority: NotificationPriority.HIGH,
          category: NotificationCategory.ACCOUNT,
          data: {
            verificationType: capabilityType,
            reason: dto.reason,
          },
          isSystemGenerated: true,
        });
        this.logger.log(`Verification rejection notification sent to user ${userId}`);
      } catch (err) {
        this.logger.error('Failed to send verification rejection notification', err);
      }
    }

    return {
      success: true,
      message: 'تم رفض التحقق بنجاح',
      data: {
        userId: user._id,
        verificationType: capabilityType,
        status: 'rejected',
        reason: dto.reason,
      },
    };
  }

  // ==================== تغيير حالة المهندس ====================
  @RequirePermissions('users.update', 'admin.access')
  @Patch(':id/engineer-status')
  @ApiOperation({
    summary: 'تغيير حالة توثيق المهندس',
    description:
      'يسمح للأدمن بتغيير حالة توثيق المهندس (none/unverified/pending/approved/rejected)',
  })
  async updateEngineerStatus(@Param('id') userId: string, @Body() dto: UpdateCapabilityStatusDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UserNotFoundException({ userId });
    }

    // تحديث حالة المهندس
    const oldStatus = user.engineer_status;
    user.engineer_status = dto.status;

    // تحديث القدرة والدور حسب الحالة
    if (dto.status === CapabilityStatus.APPROVED) {
      user.engineer_capable = true;
      if (!user.roles.includes(UserRole.ENGINEER)) {
        user.roles.push(UserRole.ENGINEER);
      }
    } else if (dto.status === CapabilityStatus.REJECTED) {
      user.engineer_capable = false;
      // لا نحذف الدور - المستخدم يبقى مهندساً لكن بحالة REJECTED
      // مسح الملفات عند الرفض من بروفايل المهندس
      const profile = await this.engineerProfileModel.findOne({ userId: user._id });
      if (profile) {
        profile.cvFileUrl = undefined;
        await profile.save();
      }
    } else if (dto.status === CapabilityStatus.NONE) {
      user.engineer_capable = false;
      // في حالة NONE (لم يرفع وثائق)، يمكن حذف الدور
      user.roles = user.roles.filter((role) => role !== UserRole.ENGINEER);
    } else if (
      dto.status === CapabilityStatus.UNVERIFIED ||
      dto.status === CapabilityStatus.PENDING
    ) {
      // في حالة UNVERIFIED أو PENDING، يبقى المستخدم مهندساً (دور ENGINEER موجود)
      // فقط حالة التوثيق تتغير، ولا يتم حذف الدور
      user.engineer_capable = true;
      // التأكد من وجود دور ENGINEER إذا لم يكن موجوداً
      if (!user.roles.includes(UserRole.ENGINEER)) {
        user.roles.push(UserRole.ENGINEER);
      }
    }

    await user.save();

    // تحديث Capabilities في الجدول المنفصل
    const caps = await this.capsModel.findOne({ userId });
    if (caps) {
      caps.engineer_status = user.engineer_status;
      caps.engineer_capable = user.engineer_capable;
      await caps.save();
    }

    return {
      success: true,
      message: `تم تغيير حالة المهندس من ${oldStatus} إلى ${dto.status}`,
      data: {
        userId: user._id,
        engineerStatus: user.engineer_status,
        engineerCapable: user.engineer_capable,
        roles: user.roles,
      },
    };
  }

  // ==================== تغيير حالة التاجر ====================
  @RequirePermissions('users.update', 'admin.access')
  @Patch(':id/merchant-status')
  @ApiOperation({
    summary: 'تغيير حالة توثيق التاجر',
    description:
      'يسمح للأدمن بتغيير حالة توثيق التاجر ونسبة الخصم (none/unverified/pending/approved/rejected)',
  })
  async updateMerchantStatus(@Param('id') userId: string, @Body() dto: UpdateCapabilityStatusDto) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UserNotFoundException({ userId });
    }

    // تحديث حالة التاجر
    const oldStatus = user.merchant_status;
    user.merchant_status = dto.status;

    // تحديث نسبة الخصم إذا تم توفيرها
    if (dto.merchantDiscountPercent !== undefined) {
      user.merchant_discount_percent = dto.merchantDiscountPercent;
    }

    // تحديث القدرة والدور حسب الحالة
    if (dto.status === CapabilityStatus.APPROVED) {
      user.merchant_capable = true;
      if (!user.roles.includes(UserRole.MERCHANT)) {
        user.roles.push(UserRole.MERCHANT);
      }
    } else if (dto.status === CapabilityStatus.REJECTED) {
      user.merchant_capable = false;
      // لا نحذف الدور - المستخدم يبقى تاجراً لكن بحالة REJECTED
      // مسح الملفات عند الرفض
      user.storePhotoUrl = undefined;
      user.storeName = undefined;
      user.merchant_discount_percent = 0;
    } else if (dto.status === CapabilityStatus.NONE) {
      user.merchant_capable = false;
      // في حالة NONE (لم يرفع وثائق)، يمكن حذف الدور
      user.roles = user.roles.filter((role) => role !== UserRole.MERCHANT);
      user.merchant_discount_percent = 0;
    } else if (
      dto.status === CapabilityStatus.UNVERIFIED ||
      dto.status === CapabilityStatus.PENDING
    ) {
      // في حالة UNVERIFIED أو PENDING، يبقى المستخدم تاجراً (دور MERCHANT موجود)
      // فقط حالة التوثيق تتغير، ولا يتم حذف الدور
      user.merchant_capable = true;
      // التأكد من وجود دور MERCHANT إذا لم يكن موجوداً
      if (!user.roles.includes(UserRole.MERCHANT)) {
        user.roles.push(UserRole.MERCHANT);
      }
    }

    await user.save();

    // تحديث Capabilities في الجدول المنفصل
    const caps = await this.capsModel.findOne({ userId });
    if (caps) {
      caps.merchant_status = user.merchant_status;
      caps.merchant_capable = user.merchant_capable;
      caps.merchant_discount_percent = user.merchant_discount_percent;
      await caps.save();
    }

    return {
      success: true,
      message: `تم تغيير حالة التاجر من ${oldStatus} إلى ${dto.status}`,
      data: {
        userId: user._id,
        merchantStatus: user.merchant_status,
        merchantCapable: user.merchant_capable,
        merchantDiscountPercent: user.merchant_discount_percent,
        roles: user.roles,
      },
    };
  }

  // ==================== إعادة تعيين كلمة المرور (Admin) ====================
  @RequirePermissions('users.update', 'admin.access')
  @Post(':id/reset-password')
  @ApiOperation({
    summary: 'إعادة تعيين كلمة مرور المستخدم',
    description: 'يسمح للأدمن بإعادة تعيين كلمة مرور أي مستخدم',
  })
  async resetUserPassword(
    @Param('id') userId: string,
    @Body() dto: AdminResetPasswordDto,
    @Req() req: { user: { sub: string } },
  ) {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UserNotFoundException({ userId });
    }

    // منع تغيير كلمة مرور Super Admin من قبل Admin عادي
    const adminUser = await this.userModel.findById(req.user.sub);
    if (
      user.roles?.includes(UserRole.SUPER_ADMIN) &&
      !adminUser?.roles?.includes(UserRole.SUPER_ADMIN)
    ) {
      throw new ForbiddenException({ reason: 'cannot_reset_super_admin_password' });
    }

    // تشفير كلمة المرور الجديدة
    const hashedPassword = await hash(dto.newPassword, 10);
    user.passwordHash = hashedPassword;

    await user.save();

    return {
      success: true,
      message: 'تم إعادة تعيين كلمة المرور بنجاح',
      data: {
        userId: user._id,
        phone: user.phone,
        resetAt: new Date(),
        resetBy: req.user.sub,
      },
    };
  }
}
