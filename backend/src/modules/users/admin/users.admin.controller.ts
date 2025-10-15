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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../../shared/guards/roles.guard';
import { Roles } from '../../../shared/decorators/roles.decorator';
import { User, UserRole, UserStatus } from '../schemas/user.schema';
import { Capabilities } from '../../capabilities/schemas/capabilities.schema';
import { AppException } from '../../../shared/exceptions/app.exception';
import { CreateUserAdminDto } from './dto/create-user-admin.dto';
import { UpdateUserAdminDto } from './dto/update-user-admin.dto';
import { ListUsersDto } from './dto/list-users.dto';
import { SuspendUserDto } from './dto/suspend-user.dto';

@ApiTags('admin-users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR)
@Controller('admin/users')
export class UsersAdminController {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Capabilities.name) private capsModel: Model<Capabilities>,
  ) {}

  // ==================== قائمة المستخدمين مع Pagination ====================
  @Get()
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
    const query: any = {};

    // فلترة المحذوفين
    if (!includeDeleted) {
      query.deletedAt = null;
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

    // فلترة الأدمن
    if (isAdmin !== undefined) {
      query.isAdmin = isAdmin;
    }

    // الترتيب
    const sort: any = {};
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
      data: usersWithCaps,
      meta: {
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
  @Get(':id')
  async getUser(@Param('id') id: string) {
    const user = await this.userModel.findById(id).select('-passwordHash').lean();
    if (!user) {
      throw new AppException('USER_NOT_FOUND', 'المستخدم غير موجود', null, 404);
    }

    const capabilities = await this.capsModel.findOne({ userId: id }).lean();

    return {
      data: {
        ...user,
        capabilities,
      },
    };
  }

  // ==================== إنشاء مستخدم جديد ====================
  @Post()
  async createUser(@Body() dto: CreateUserAdminDto) {
    // التحقق من عدم وجود المستخدم
    const existingUser = await this.userModel.findOne({ phone: dto.phone });
    if (existingUser) {
      throw new AppException('USER_ALREADY_EXISTS', 'رقم الهاتف مستخدم بالفعل', null, 400);
    }

    // تجهيز البيانات
    const userData: any = {
      phone: dto.phone,
      firstName: dto.firstName,
      lastName: dto.lastName,
      gender: dto.gender,
      jobTitle: dto.jobTitle,
      roles: dto.roles || [UserRole.USER],
      permissions: dto.permissions || [],
      status: dto.status || UserStatus.ACTIVE,
    };

    // إضافة كلمة المرور إن وجدت
    if (dto.password) {
      userData.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    // إنشاء المستخدم
    const user = await this.userModel.create(userData);

    // إنشاء Capabilities
    const capsData: any = {
      userId: user._id,
      customer_capable: true,
    };

    // معالجة طلبات القدرات
    if (dto.capabilityRequest === 'engineer') {
      if (!dto.jobTitle) {
        throw new AppException('JOB_TITLE_REQUIRED', 'المسمى الوظيفي مطلوب للمهندسين', null, 400);
      }
      capsData.engineer_capable = true;
      capsData.engineer_status = 'approved';
    }

    if (dto.capabilityRequest === 'wholesale') {
      capsData.wholesale_capable = true;
      capsData.wholesale_status = 'approved';
      capsData.wholesale_discount_percent = dto.wholesaleDiscountPercent || 0;
    }

    await this.capsModel.create(capsData);

    return {
      data: {
        id: user._id,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        status: user.status,
      },
    };
  }

  // ==================== تحديث مستخدم ====================
  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() dto: UpdateUserAdminDto,
    @Req() req: { user: { sub: string } },
  ) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new AppException('USER_NOT_FOUND', 'المستخدم غير موجود', null, 404);
    }

    // منع تعديل Super Admin من قبل Admin عادي
    const adminUser = await this.userModel.findById(req.user.sub);
    if (
      user.roles?.includes(UserRole.SUPER_ADMIN) &&
      !adminUser?.roles?.includes(UserRole.SUPER_ADMIN)
    ) {
      throw new AppException('PERMISSION_DENIED', 'لا يمكن تعديل Super Admin', null, 403);
    }

    // تحديث الحقول
    if (dto.firstName !== undefined) user.firstName = dto.firstName;
    if (dto.lastName !== undefined) user.lastName = dto.lastName;
    if (dto.gender !== undefined) user.gender = dto.gender;
    if (dto.jobTitle !== undefined) user.jobTitle = dto.jobTitle;
    if (dto.roles !== undefined) user.roles = dto.roles;
    if (dto.permissions !== undefined) user.permissions = dto.permissions;
    if (dto.status !== undefined) user.status = dto.status;
    if (dto.isAdmin !== undefined) user.isAdmin = dto.isAdmin;

    // تحديث كلمة المرور
    if (dto.password) {
      user.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    await user.save();

    return {
      data: {
        id: user._id,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        status: user.status,
        updated: true,
      },
    };
  }

  // ==================== إيقاف مستخدم ====================
  @Post(':id/suspend')
  async suspendUser(
    @Param('id') id: string,
    @Body() dto: SuspendUserDto,
    @Req() req: { user: { sub: string } },
  ) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new AppException('USER_NOT_FOUND', 'المستخدم غير موجود', null, 404);
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new AppException('USER_ALREADY_SUSPENDED', 'المستخدم موقوف بالفعل', null, 400);
    }

    user.status = UserStatus.SUSPENDED;
    user.suspendedReason = dto.reason || 'لم يتم تحديد السبب';
    user.suspendedBy = req.user.sub;
    user.suspendedAt = new Date();

    await user.save();

    return {
      data: {
        id: user._id,
        status: user.status,
        suspended: true,
      },
    };
  }

  // ==================== تفعيل مستخدم ====================
  @Post(':id/activate')
  async activateUser(@Param('id') id: string) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new AppException('USER_NOT_FOUND', 'المستخدم غير موجود', null, 404);
    }

    user.status = UserStatus.ACTIVE;
    user.suspendedReason = undefined;
    user.suspendedBy = undefined;
    user.suspendedAt = undefined;

    await user.save();

    return {
      data: {
        id: user._id,
        status: user.status,
        activated: true,
      },
    };
  }

  // ==================== Soft Delete مستخدم ====================
  @Delete(':id')
  async deleteUser(@Param('id') id: string, @Req() req: { user: { sub: string } }) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new AppException('USER_NOT_FOUND', 'المستخدم غير موجود', null, 404);
    }

    if (user.deletedAt) {
      throw new AppException('USER_ALREADY_DELETED', 'المستخدم محذوف بالفعل', null, 400);
    }

    // منع حذف Super Admin
    if (user.roles?.includes(UserRole.SUPER_ADMIN)) {
      throw new AppException('CANNOT_DELETE_SUPER_ADMIN', 'لا يمكن حذف Super Admin', null, 403);
    }

    // Soft delete
    user.deletedAt = new Date();
    user.deletedBy = req.user.sub;
    user.status = UserStatus.SUSPENDED;

    await user.save();

    return {
      data: {
        id: user._id,
        deleted: true,
        deletedAt: user.deletedAt,
      },
    };
  }

  // ==================== استعادة مستخدم محذوف ====================
  @Post(':id/restore')
  async restoreUser(@Param('id') id: string) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new AppException('USER_NOT_FOUND', 'المستخدم غير موجود', null, 404);
    }

    if (!user.deletedAt) {
      throw new AppException('USER_NOT_DELETED', 'المستخدم غير محذوف', null, 400);
    }

    user.deletedAt = null;
    user.deletedBy = undefined;
    user.status = UserStatus.ACTIVE;

    await user.save();

    return {
      data: {
        id: user._id,
        restored: true,
      },
    };
  }

  // ==================== حذف نهائي (Hard Delete) ====================
  @Delete(':id/permanent')
  @Roles(UserRole.SUPER_ADMIN) // فقط Super Admin
  async permanentDelete(@Param('id') id: string) {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new AppException('USER_NOT_FOUND', 'المستخدم غير موجود', null, 404);
    }

    if (user.roles?.includes(UserRole.SUPER_ADMIN)) {
      throw new AppException('CANNOT_DELETE_SUPER_ADMIN', 'لا يمكن حذف Super Admin', null, 403);
    }

    // حذف نهائي
    await this.userModel.deleteOne({ _id: id });
    await this.capsModel.deleteOne({ userId: id });

    return {
      data: {
        id,
        permanentlyDeleted: true,
      },
    };
  }

  // ==================== إحصائيات المستخدمين ====================
  @Get('stats/summary')
  async getUserStats() {
    const [total, active, suspended, deleted, admins, engineers, wholesale] = await Promise.all([
      this.userModel.countDocuments({ deletedAt: null }),
      this.userModel.countDocuments({ status: UserStatus.ACTIVE, deletedAt: null }),
      this.userModel.countDocuments({ status: UserStatus.SUSPENDED, deletedAt: null }),
      this.userModel.countDocuments({ deletedAt: { $ne: null } }),
      this.userModel.countDocuments({ isAdmin: true, deletedAt: null }),
      this.capsModel.countDocuments({ engineer_capable: true }),
      this.capsModel.countDocuments({ wholesale_capable: true }),
    ]);

    return {
      data: {
        total,
        active,
        suspended,
        deleted,
        admins,
        engineers,
        wholesale,
      },
    };
  }
}
