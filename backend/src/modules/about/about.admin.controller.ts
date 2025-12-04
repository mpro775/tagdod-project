import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../../shared/guards/admin.guard';
import { AboutService } from './about.service';
import { CreateAboutDto, UpdateAboutDto, ToggleAboutDto, AboutResponseDto } from './dto/about.dto';

interface JwtUser {
  sub: string;
  phone: string;
  isAdmin: boolean;
  roles?: string[];
  permissions?: string[];
}

interface RequestWithUser {
  user: JwtUser;
}

@ApiTags('إدارة-من-نحن')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/about')
export class AboutAdminController {
  constructor(private readonly aboutService: AboutService) {}

  @Get()
  @ApiOperation({
    summary: 'جلب صفحة من نحن',
    description: 'الحصول على بيانات صفحة من نحن (للأدمن)',
  })
  @ApiResponse({
    status: 200,
    description: 'تم جلب البيانات بنجاح',
    type: AboutResponseDto,
  })
  async get(): Promise<AboutResponseDto | null> {
    return this.aboutService.getForAdmin();
  }

  @Post()
  @ApiOperation({
    summary: 'إنشاء صفحة من نحن',
    description: 'إنشاء صفحة من نحن جديدة (مرة واحدة فقط)',
  })
  @ApiBody({ type: CreateAboutDto })
  @ApiResponse({
    status: 201,
    description: 'تم إنشاء الصفحة بنجاح',
    type: AboutResponseDto,
  })
  @ApiResponse({ status: 409, description: 'صفحة من نحن موجودة بالفعل' })
  async create(
    @Body() dto: CreateAboutDto,
    @Req() req: RequestWithUser,
  ): Promise<AboutResponseDto> {
    return this.aboutService.create(dto, req.user.sub);
  }

  @Put()
  @ApiOperation({
    summary: 'تحديث صفحة من نحن',
    description: 'تحديث بيانات صفحة من نحن',
  })
  @ApiBody({ type: UpdateAboutDto })
  @ApiResponse({
    status: 200,
    description: 'تم تحديث الصفحة بنجاح',
    type: AboutResponseDto,
  })
  @ApiResponse({ status: 404, description: 'صفحة من نحن غير موجودة' })
  async update(
    @Body() dto: UpdateAboutDto,
    @Req() req: RequestWithUser,
  ): Promise<AboutResponseDto> {
    return this.aboutService.update(dto, req.user.sub);
  }

  @Post('toggle')
  @ApiOperation({
    summary: 'تفعيل/تعطيل صفحة من نحن',
    description: 'تفعيل أو تعطيل عرض صفحة من نحن للعامة',
  })
  @ApiBody({ type: ToggleAboutDto })
  @ApiResponse({
    status: 200,
    description: 'تم تحديث حالة الصفحة بنجاح',
    type: AboutResponseDto,
  })
  @ApiResponse({ status: 404, description: 'صفحة من نحن غير موجودة' })
  async toggle(
    @Body() dto: ToggleAboutDto,
    @Req() req: RequestWithUser,
  ): Promise<AboutResponseDto> {
    return this.aboutService.toggle(dto.isActive, req.user.sub);
  }
}

