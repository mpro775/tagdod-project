import { 
  Body, 
  Controller, 
  Delete, 
  Get, 
  Param, 
  Patch,
  Post, 
  Query, 
  UseGuards 
} from '@nestjs/common';
import { 
  ApiBearerAuth, 
  ApiOperation, 
  ApiTags, 
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RequirePermissions } from '../../shared/decorators/permissions.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { AdminPermission } from '../../shared/constants/permissions';
import { BrandsService } from './brands.service';
import { CreateBrandDto, UpdateBrandDto, ListBrandsDto } from './dto/brand.dto';

@ApiTags('admin-brands')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin/brands')
export class BrandsAdminController {
  constructor(private readonly brandsService: BrandsService) {}

  @RequirePermissions(AdminPermission.BRANDS_CREATE, AdminPermission.ADMIN_ACCESS)
  @Post()
  @ApiOperation({
    summary: 'إنشاء علامة تجارية جديدة',
    description: 'إنشاء علامة تجارية جديدة في النظام. يتطلب صلاحيات إدارية.',
    tags: ['إدارة العلامات التجارية']
  })
  @ApiBody({
    type: CreateBrandDto,
    description: 'بيانات العلامة التجارية الجديدة',
    examples: {
      samsung: {
        summary: 'إنشاء علامة سامسونج',
        value: {
          name: 'سامسونج',
          nameEn: 'Samsung',
          description: 'شركة تقنية كورية جنوبية متخصصة في الإلكترونيات',
          logoUrl: 'https://example.com/samsung-logo.png',
          website: 'https://samsung.com'
        }
      },
      apple: {
        summary: 'إنشاء علامة آبل',
        value: {
          name: 'آبل',
          nameEn: 'Apple',
          description: 'شركة تقنية أمريكية متخصصة في الإلكترونيات والحاسوب',
          logoUrl: 'https://example.com/apple-logo.png',
          website: 'https://apple.com'
        }
      }
    }
  })
  @ApiCreatedResponse({
    description: 'تم إنشاء العلامة التجارية بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'تم إنشاء العلامة التجارية بنجاح' },
        data: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64a1b2c3d4e5f6789abcdef0' },
            name: { type: 'string', example: 'سامسونج' },
            nameEn: { type: 'string', example: 'Samsung' },
            slug: { type: 'string', example: 'samsung' },
            description: { type: 'string', example: 'شركة تقنية كورية جنوبية' },
            logoUrl: { type: 'string', example: 'https://example.com/samsung-logo.png' },
            website: { type: 'string', example: 'https://samsung.com' },
            isActive: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiUnauthorizedResponse({
    description: 'غير مصرح - مطلوب تسجيل دخول'
  })
  @ApiForbiddenResponse({
    description: 'ممنوع - مطلوب صلاحيات إدارية'
  })
  async createBrand(@Body() dto: CreateBrandDto) {
    const brand = await this.brandsService.createBrand(dto);
    return {
      success: true,
      message: 'Brand created successfully',
      data: brand,
    };
  }

  @Get()
  @ApiOperation({
    summary: 'الحصول على قائمة العلامات التجارية',
    description: 'الحصول على قائمة بجميع العلامات التجارية مع إمكانية التصفية والترقيم. يتطلب صلاحيات إدارية.',
    tags: ['إدارة العلامات التجارية']
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'البحث في أسماء العلامات التجارية',
    example: 'سامسونج'
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    description: 'تصفية العلامات التجارية النشطة',
    example: true
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'رقم الصفحة',
    example: 1
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'عدد العناصر في الصفحة',
    example: 10
  })
  @ApiOkResponse({
    description: 'تم الحصول على قائمة العلامات التجارية بنجاح'
  })
  async listBrands(@Query() dto: ListBrandsDto) {
    const result = await this.brandsService.listBrands(dto);
    return {
      success: true,
      data: result.brands,
      pagination: result.pagination,
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'الحصول على علامة تجارية بواسطة المعرف',
    description: 'الحصول على تفاصيل علامة تجارية محددة باستخدام المعرف (ObjectId). يتطلب صلاحيات إدارية.',
    tags: ['إدارة العلامات التجارية']
  })
  @ApiParam({
    name: 'id',
    description: 'معرف العلامة التجارية (ObjectId)',
    example: '64a1b2c3d4e5f6789abcdef0'
  })
  @ApiOkResponse({
    description: 'تم الحصول على العلامة التجارية بنجاح'
  })
  @ApiNotFoundResponse({
    description: 'العلامة التجارية غير موجودة'
  })
  async getBrand(@Param('id') id: string) {
    const brand = await this.brandsService.getBrandById(id);
    return {
      success: true,
      data: brand,
    };
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'تحديث علامة تجارية',
    description: 'تحديث بيانات علامة تجارية موجودة. يتطلب صلاحيات إدارية.',
    tags: ['إدارة العلامات التجارية']
  })
  @ApiParam({
    name: 'id',
    description: 'معرف العلامة التجارية (ObjectId)',
    example: '64a1b2c3d4e5f6789abcdef0'
  })
  @ApiBody({
    type: UpdateBrandDto,
    description: 'البيانات المحدثة للعلامة التجارية'
  })
  @ApiOkResponse({
    description: 'تم تحديث العلامة التجارية بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'تم تحديث العلامة التجارية بنجاح' },
        data: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64a1b2c3d4e5f6789abcdef0' },
            name: { type: 'string', example: 'سامسونج المحدث' },
            nameEn: { type: 'string', example: 'Updated Samsung' },
            slug: { type: 'string', example: 'updated-samsung' },
            description: { type: 'string', example: 'شركة تقنية كورية جنوبية محدثة' },
            logoUrl: { type: 'string', example: 'https://example.com/updated-samsung-logo.png' },
            website: { type: 'string', example: 'https://samsung.com' },
            isActive: { type: 'boolean', example: true },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'العلامة التجارية غير موجودة'
  })
  async updateBrand(
    @Param('id') id: string,
    @Body() dto: UpdateBrandDto,
  ) {
    const brand = await this.brandsService.updateBrand(id, dto);
    return {
      success: true,
      message: 'Brand updated successfully',
      data: brand,
    };
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'حذف علامة تجارية',
    description: 'حذف علامة تجارية من النظام. يتطلب صلاحيات إدارية.',
    tags: ['إدارة العلامات التجارية']
  })
  @ApiParam({
    name: 'id',
    description: 'معرف العلامة التجارية (ObjectId)',
    example: '64a1b2c3d4e5f6789abcdef0'
  })
  @ApiOkResponse({
    description: 'تم حذف العلامة التجارية بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'تم حذف العلامة التجارية بنجاح' }
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'العلامة التجارية غير موجودة'
  })
  async deleteBrand(@Param('id') id: string) {
    await this.brandsService.deleteBrand(id);
    return {
      success: true,
      message: 'Brand deleted successfully',
    };
  }

  @Patch(':id/toggle-status')
  @ApiOperation({
    summary: 'تبديل حالة العلامة التجارية',
    description: 'تفعيل أو إلغاء تفعيل علامة تجارية. يتطلب صلاحيات إدارية.',
    tags: ['إدارة العلامات التجارية']
  })
  @ApiParam({
    name: 'id',
    description: 'معرف العلامة التجارية (ObjectId)',
    example: '64a1b2c3d4e5f6789abcdef0'
  })
  @ApiOkResponse({
    description: 'تم تبديل حالة العلامة التجارية بنجاح',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'تم تفعيل العلامة التجارية بنجاح' },
        data: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64a1b2c3d4e5f6789abcdef0' },
            name: { type: 'string', example: 'سامسونج' },
            isActive: { type: 'boolean', example: true },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({
    description: 'العلامة التجارية غير موجودة'
  })
  async toggleBrandStatus(@Param('id') id: string) {
    const brand = await this.brandsService.toggleBrandStatus(id);
    return {
      success: true,
      message: `Brand ${brand.isActive ? 'activated' : 'deactivated'} successfully`,
      data: brand,
    };
  }
}

