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
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  
} from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery, SortOrder } from 'mongoose';
import { hash } from 'bcrypt';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { RequirePermissions } from '../../../shared/decorators/permissions.decorator';
import { User, UserRole, UserStatus, CapabilityStatus } from '../schemas/user.schema';
import { Capabilities } from '../../capabilities/schemas/capabilities.schema';
import { 
  UserNotFoundException,
  AuthException,
  ForbiddenException,
  ErrorCode 
} from '../../../shared/exceptions';
import { AdminPermission, PERMISSION_GROUPS } from '../../../shared/constants/permissions';
import { CreateUserAdminDto } from './dto/create-user-admin.dto';
import { CreateAdminDto, CreateRoleBasedAdminDto } from './dto/create-admin.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { SuspendUserDto } from './dto/suspend-user.dto';

@ApiTags('إدارة-المستخدمين')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin/users')
export class UsersAdminController {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Capabilities.name) private capsModel: Model<Capabilities>,
  ) {}

  // ==================== قائمة المستخدمين مع Pagination ====================
  @RequirePermissions('users.read', 'admin.access')
  @Get()
  @ApiOperation({
    summary: 'قائمة المستخدمين',
    description: 'استرداد قائمة بجميع المستخدمين مع إمكانية التصفية والترقيم'
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
              email: { type: 'string', example: 'user@example.com', description: 'البريد الإلكتروني' },
              fullName: { type: 'string', example: 'أحمد محمد علي', description: 'الاسم الكامل' },
              status: { type: 'string', example: 'active', description: 'حالة المستخدم' },
              role: { type: 'string', example: 'customer', description: 'دور المستخدم' },
              createdAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' },
              lastLogin: { type: 'string', format: 'date-time', example: '2024-01-20T15:45:00Z' }
            }
          }
        },
        meta: {
          type: 'object',
          properties: {
            total: { type: 'number', example: 1500, description: 'إجمالي المستخدمين' },
            page: { type: 'number', example: 1, description: 'الصفحة الحالية' },
            limit: { type: 'number', example: 20, description: 'عدد المستخدمين في الصفحة' },
            totalPages: { type: 'number', example: 75, description: 'إجمالي الصفحات' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: 'غير مصرح لك بالوصول إلى قائمة المستخدمين'
  })
  async listUsers(@Query() dto: ListUsersDto) {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      role,
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
      query.$or = [
        { phone: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
      ];
    }

    // فلترة الحالة
    if (status) {
      query.status = status;
    }

    // فلترة الدور
    if (role) {
      query.roles = role;
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
  async createAdmin(@Body() dto: CreateAdminDto) {
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
  async createRoleBasedAdmin(@Body() dto: CreateRoleBasedAdminDto) {
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

    return await this.createAdmin(adminDto);
  }

  // ==================== إنشاء مستخدم عادي ====================
  @RequirePermissions('users.create', 'admin.access')
  @Post()
  async createUser(@Body() dto: CreateUserAdminDto) {
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
      jobTitle: dto.jobTitle,
      city: dto.city || 'صنعاء', // المدينة - افتراضي صنعاء
      roles: dto.roles || [UserRole.USER],
      permissions: dto.permissions || [],
      status: dto.status || UserStatus.ACTIVE,
      // القدرات الافتراضية
      customer_capable: true,
      engineer_capable: false,
      engineer_status: CapabilityStatus.NONE,
      wholesale_capable: false,
      wholesale_status: CapabilityStatus.NONE,
      wholesale_discount_percent: 0,
      admin_capable: false,
      admin_status: CapabilityStatus.NONE,
    };

    // معالجة طلبات القدرات - تحديث userData مباشرة
    if (dto.capabilityRequest === 'engineer') {
      if (!dto.jobTitle) {
        throw new AuthException(ErrorCode.AUTH_JOB_TITLE_REQUIRED);
      }
      userData.engineer_capable = true;
      userData.engineer_status = CapabilityStatus.APPROVED;
    }

    if (dto.capabilityRequest === 'wholesale') {
      userData.wholesale_capable = true;
      userData.wholesale_status = CapabilityStatus.APPROVED;
      userData.wholesale_discount_percent = dto.wholesaleDiscountPercent || 0;
    }

    // تحديث القدرات للأدمن
    if (dto.roles?.includes(UserRole.ADMIN) || dto.roles?.includes(UserRole.SUPER_ADMIN)) {
      userData.admin_capable = true;
      userData.admin_status = CapabilityStatus.APPROVED;
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
      wholesale_capable: user.wholesale_capable,
      wholesale_status: user.wholesale_status,
      wholesale_discount_percent: user.wholesale_discount_percent,
      admin_capable: user.admin_capable,
      admin_status: user.admin_status,
    };

    await this.capsModel.create(capsData);

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
    @Req() req: { user: { sub: string } },
  ) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new UserNotFoundException({ userId: id });
    }

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
    if (dto.jobTitle !== undefined) user.jobTitle = dto.jobTitle;
    if (dto.city !== undefined) user.city = dto.city;
    if (dto.roles !== undefined) user.roles = dto.roles;
    if (dto.permissions !== undefined) user.permissions = dto.permissions;
    if (dto.status !== undefined) user.status = dto.status;

    // تحديث كلمة المرور
    if (dto.password) {
      user.passwordHash = await hash(dto.password, 10);
    }

    // تحديث القدرات في User نفسه حسب النوع
    if (dto.roles && dto.roles.length > 0) {
      const mainRole = dto.roles[0];

      // تنظيف القدرات القديمة أولاً
      user.engineer_capable = false;
      user.engineer_status = CapabilityStatus.NONE;
      user.wholesale_capable = false;
      user.wholesale_status = CapabilityStatus.NONE;
      user.wholesale_discount_percent = 0;
      user.admin_capable = false;
      user.admin_status = CapabilityStatus.NONE;

      // إضافة القدرات حسب النوع الجديد
      if (mainRole === UserRole.ENGINEER) {
        user.engineer_capable = true;
        user.engineer_status = CapabilityStatus.APPROVED;
      } else if (mainRole === UserRole.MERCHANT) {
        user.wholesale_capable = true;
        user.wholesale_status = CapabilityStatus.APPROVED;
        user.wholesale_discount_percent = dto.wholesaleDiscountPercent || 0;
      } else if (mainRole === UserRole.ADMIN || mainRole === UserRole.SUPER_ADMIN) {
        user.admin_capable = true;
        user.admin_status = CapabilityStatus.APPROVED;
      }
    }

    await user.save();

    // تحديث Capabilities في الجدول المنفصل (للتوافق مع النظام القديم)
    let capabilities = await this.capsModel.findOne({ userId: id });
    if (!capabilities) {
      capabilities = await this.capsModel.create({
        userId: id,
        customer_capable: user.customer_capable,
        engineer_capable: user.engineer_capable,
        engineer_status: user.engineer_status,
        wholesale_capable: user.wholesale_capable,
        wholesale_status: user.wholesale_status,
        wholesale_discount_percent: user.wholesale_discount_percent,
        admin_capable: user.admin_capable,
        admin_status: user.admin_status,
      });
    } else {
      // تحديث القدرات الموجودة
      capabilities.customer_capable = user.customer_capable;
      capabilities.engineer_capable = user.engineer_capable;
      capabilities.engineer_status = user.engineer_status;
      capabilities.wholesale_capable = user.wholesale_capable;
      capabilities.wholesale_status = user.wholesale_status;
      capabilities.wholesale_discount_percent = user.wholesale_discount_percent;
      capabilities.admin_capable = user.admin_capable;
      capabilities.admin_status = user.admin_status;
      await capabilities.save();
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
    @Req() req: { user: { sub: string } },
  ) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new UserNotFoundException({ userId: id });
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new AuthException(ErrorCode.AUTH_USER_SUSPENDED, { userId: id });
    }

    user.status = UserStatus.SUSPENDED;
    user.suspendedReason = dto.reason || 'لم يتم تحديد السبب';
    user.suspendedBy = req.user.sub;
    user.suspendedAt = new Date();

    await user.save();

    return {
      id: user._id,
      status: user.status,
      suspended: true,
    };
  }

  // ==================== تفعيل مستخدم ====================
  @RequirePermissions('users.update', 'admin.access')
  @Post(':id/activate')
  async activateUser(@Param('id') id: string) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new UserNotFoundException({ userId: id });
    }

    user.status = UserStatus.ACTIVE;
    user.suspendedReason = undefined;
    user.suspendedBy = undefined;
    user.suspendedAt = undefined;

    await user.save();

    return {
      id: user._id,
      status: user.status,
      activated: true,
    };
  }

  // ==================== Soft Delete مستخدم ====================
  @RequirePermissions('users.delete', 'admin.access')
  @Delete(':id')
  async deleteUser(@Param('id') id: string, @Req() req: { user: { sub: string } }) {
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

    // Soft delete - إصلاح منطق الحذف الناعم
    user.deletedAt = new Date();
    user.deletedBy = req.user.sub;
    user.status = UserStatus.DELETED; // استخدام الحالة الجديدة

    await user.save();

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
  async permanentDelete(@Param('id') id: string) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new UserNotFoundException({ userId: id });
    }

    if (user.roles?.includes(UserRole.SUPER_ADMIN)) {
      throw new ForbiddenException({ reason: 'cannot_delete_super_admin' });
    }

    // حذف نهائي
    await this.userModel.deleteOne({ _id: id });
    await this.capsModel.deleteOne({ userId: id });

    return {
      id,
      permanentlyDeleted: true,
    };
  }

  // ==================== إحصائيات المستخدمين ====================
  @RequirePermissions('analytics.read', 'admin.access')
  @Get('stats/summary')
  async getUserStats() {
    const [total, active, suspended, deleted, admins, engineers, merchants, regularUsers] = await Promise.all([
      this.userModel.countDocuments({ 
        deletedAt: null,
        status: { $ne: UserStatus.DELETED }
      }),
      this.userModel.countDocuments({ 
        status: UserStatus.ACTIVE, 
        deletedAt: null 
      }),
      this.userModel.countDocuments({ 
        status: UserStatus.SUSPENDED, 
        deletedAt: null 
      }),
      this.userModel.countDocuments({ 
        $or: [
          { deletedAt: { $ne: null } },
          { status: UserStatus.DELETED }
        ]
      }),
      // Admins: من لديه admin أو super_admin فقط
      this.userModel.countDocuments({ 
        roles: { $in: [UserRole.ADMIN, UserRole.SUPER_ADMIN] }, 
        deletedAt: null,
        status: { $ne: UserStatus.DELETED }
      }),
      // Engineers: من لديه engineer ولكن ليس admin أو super_admin
      this.userModel.countDocuments({ 
        $and: [
          { roles: UserRole.ENGINEER },
          { roles: { $nin: [UserRole.ADMIN, UserRole.SUPER_ADMIN] } }
        ],
        deletedAt: null,
        status: { $ne: UserStatus.DELETED }
      }),
      // Merchants: من لديه merchant ولكن ليس admin أو super_admin
      this.userModel.countDocuments({ 
        $and: [
          { roles: UserRole.MERCHANT },
          { roles: { $nin: [UserRole.ADMIN, UserRole.SUPER_ADMIN] } }
        ],
        deletedAt: null,
        status: { $ne: UserStatus.DELETED }
      }),
      // Regular Users: من لديه user فقط (ليس admin/super_admin/engineer/merchant)
      this.userModel.countDocuments({ 
        $and: [
          { roles: UserRole.USER },
          { roles: { $nin: [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.ENGINEER, UserRole.MERCHANT] } }
        ],
        deletedAt: null,
        status: { $ne: UserStatus.DELETED }
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
}
