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
  UseGuards 
} from '@nestjs/common';
import { 
  ApiBearerAuth, 
  ApiTags, 
  ApiOperation, 
  ApiParam,
  ApiBody,
  ApiQuery,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RequirePermissions } from '../../shared/decorators/permissions.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { AdminPermission } from '../../shared/constants/permissions';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto, ListCategoriesDto } from './dto/category.dto';
import { Category } from './schemas/category.schema';

@ApiTags('إدارة-الفئات')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin/categories')
export class CategoriesAdminController {
  constructor(private categoriesService: CategoriesService) {}

  // ==================== إنشاء فئة ====================
  @RequirePermissions(AdminPermission.CATEGORIES_CREATE, AdminPermission.ADMIN_ACCESS)
  @Post()
  @ApiOperation({
    summary: 'إنشاء فئة جديدة',
    description: 'إنشاء فئة جديدة في النظام. يتطلب صلاحيات إدارية.',
    tags: ['إدارة الفئات']
  })
  @ApiBody({
    type: CreateCategoryDto,
    description: 'بيانات الفئة الجديدة',
    examples: {
      electronics: {
        summary: 'إنشاء فئة الإلكترونيات',
        value: {
          name: 'الإلكترونيات',
          nameEn: 'Electronics',
          description: 'جميع الأجهزة الإلكترونية والكهربائية',
          parentId: null,
          isActive: true,
          isFeatured: true,
          order: 1
        }
      },
      phones: {
        summary: 'إنشاء فئة الهواتف',
        value: {
          name: 'الهواتف',
          nameEn: 'Phones',
          description: 'الهواتف الذكية والملحقات',
          parentId: 'parent_category_id',
          isActive: true,
          isFeatured: false,
          order: 1
        }
      }
    }
  })
  @ApiCreatedResponse({
    description: 'تم إنشاء الفئة بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64a1b2c3d4e5f6789abcdef0' },
            name: { type: 'string', example: 'الإلكترونيات' },
            nameEn: { type: 'string', example: 'Electronics' },
            slug: { type: 'string', example: 'electronics' },
            description: { type: 'string', example: 'جميع الأجهزة الإلكترونية' },
            parentId: { type: 'string', example: null },
            isActive: { type: 'boolean', example: true },
            isFeatured: { type: 'boolean', example: true },
            order: { type: 'number', example: 1 },
            productCount: { type: 'number', example: 0 },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'غير مصرح - مطلوب تسجيل دخول' })
  @ApiForbiddenResponse({ description: 'ممنوع - مطلوب صلاحيات إدارية' })
  async createCategory(@Body() dto: CreateCategoryDto) {
    const category = await this.categoriesService.createCategory(dto as Partial<Category>);
    return category;
  }

  // ==================== قائمة الفئات ====================
  @Get()
  @ApiOperation({
    summary: 'الحصول على قائمة الفئات',
    description: 'الحصول على قائمة بجميع الفئات مع إمكانية التصفية والبحث. يتطلب صلاحيات إدارية.',
    tags: ['إدارة الفئات']
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'البحث في أسماء الفئات',
    example: 'إلكترونيات'
  })
  @ApiQuery({
    name: 'parentId',
    required: false,
    description: 'تصفية حسب الفئة الأب',
    example: '64a1b2c3d4e5f6789abcdef0'
  })
  @ApiQuery({
    name: 'isActive',
    required: false,
    description: 'تصفية الفئات النشطة',
    example: true
  })
  @ApiQuery({
    name: 'isFeatured',
    required: false,
    description: 'تصفية الفئات المميزة',
    example: true
  })
  @ApiQuery({
    name: 'includeDeleted',
    required: false,
    description: 'تضمين الفئات المحذوفة',
    example: false
  })
  @ApiOkResponse({
    description: 'تم الحصول على قائمة الفئات بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', example: '64a1b2c3d4e5f6789abcdef0' },
              name: { type: 'string', example: 'الإلكترونيات' },
              nameEn: { type: 'string', example: 'Electronics' },
              slug: { type: 'string', example: 'electronics' },
              description: { type: 'string', example: 'جميع الأجهزة الإلكترونية' },
              parentId: { type: 'string', example: null },
              isActive: { type: 'boolean', example: true },
              isFeatured: { type: 'boolean', example: true },
              order: { type: 'number', example: 1 },
              productCount: { type: 'number', example: 25 },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' }
            }
          }
        }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'غير مصرح - مطلوب تسجيل دخول' })
  @ApiForbiddenResponse({ description: 'ممنوع - مطلوب صلاحيات إدارية' })
  async listCategories(@Query() dto: ListCategoriesDto) {
    const categories = await this.categoriesService.listCategories(dto);
    return categories;
  }

  // ==================== شجرة الفئات الكاملة ====================
  @Get('tree')
  @ApiOperation({
    summary: 'الحصول على شجرة الفئات الكاملة',
    description: 'الحصول على شجرة الفئات الكاملة مع جميع المستويات والعلاقات الهرمية. يتطلب صلاحيات إدارية.',
    tags: ['إدارة الفئات']
  })
  @ApiOkResponse({
    description: 'تم الحصول على شجرة الفئات بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              _id: { type: 'string', example: '64a1b2c3d4e5f6789abcdef0' },
              name: { type: 'string', example: 'الإلكترونيات' },
              nameEn: { type: 'string', example: 'Electronics' },
              slug: { type: 'string', example: 'electronics' },
              description: { type: 'string', example: 'جميع الأجهزة الإلكترونية' },
              isActive: { type: 'boolean', example: true },
              isFeatured: { type: 'boolean', example: true },
              order: { type: 'number', example: 1 },
              productCount: { type: 'number', example: 25 },
              children: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    _id: { type: 'string', example: '64a1b2c3d4e5f6789abcdef1' },
                    name: { type: 'string', example: 'الهواتف' },
                    nameEn: { type: 'string', example: 'Phones' },
                    slug: { type: 'string', example: 'phones' },
                    productCount: { type: 'number', example: 15 }
                  }
                }
              }
            }
          }
        }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'غير مصرح - مطلوب تسجيل دخول' })
  @ApiForbiddenResponse({ description: 'ممنوع - مطلوب صلاحيات إدارية' })
  async getCategoryTree() {
    const tree = await this.categoriesService.getCategoryTree();
    return tree;
  }

  // ==================== عرض فئة واحدة ====================
  @Get(':id')
  @ApiOperation({
    summary: 'الحصول على فئة واحدة',
    description: 'الحصول على تفاصيل فئة محددة مع جميع المعلومات والإحصائيات. يتطلب صلاحيات إدارية.',
    tags: ['إدارة الفئات']
  })
  @ApiParam({
    name: 'id',
    description: 'معرف الفئة (ObjectId)',
    example: '64a1b2c3d4e5f6789abcdef0'
  })
  @ApiOkResponse({
    description: 'تم الحصول على الفئة بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64a1b2c3d4e5f6789abcdef0' },
            name: { type: 'string', example: 'الإلكترونيات' },
            nameEn: { type: 'string', example: 'Electronics' },
            slug: { type: 'string', example: 'electronics' },
            description: { type: 'string', example: 'جميع الأجهزة الإلكترونية' },
            parentId: { type: 'string', example: null },
            parent: {
              type: 'object',
              properties: {
                _id: { type: 'string', example: 'parent_id' },
                name: { type: 'string', example: 'الفئة الأب' },
                nameEn: { type: 'string', example: 'Parent Category' }
              }
            },
            isActive: { type: 'boolean', example: true },
            isFeatured: { type: 'boolean', example: true },
            order: { type: 'number', example: 1 },
            productCount: { type: 'number', example: 25 },
            children: { type: 'array' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'الفئة غير موجودة' })
  @ApiUnauthorizedResponse({ description: 'غير مصرح - مطلوب تسجيل دخول' })
  @ApiForbiddenResponse({ description: 'ممنوع - مطلوب صلاحيات إدارية' })
  async getCategory(@Param('id') id: string) {
    const category = await this.categoriesService.getCategory(id);
      return category;
  }

  // ==================== تحديث فئة ====================
  @Patch(':id')
  @ApiOperation({
    summary: 'تحديث فئة',
    description: 'تحديث بيانات فئة موجودة. يتطلب صلاحيات إدارية.',
    tags: ['إدارة الفئات']
  })
  @ApiParam({
    name: 'id',
    description: 'معرف الفئة (ObjectId)',
    example: '64a1b2c3d4e5f6789abcdef0'
  })
  @ApiBody({
    type: UpdateCategoryDto,
    description: 'البيانات المحدثة للفئة'
  })
  @ApiOkResponse({
    description: 'تم تحديث الفئة بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '64a1b2c3d4e5f6789abcdef0' },
            name: { type: 'string', example: 'الإلكترونيات المحدثة' },
            nameEn: { type: 'string', example: 'Updated Electronics' },
            slug: { type: 'string', example: 'updated-electronics' },
            description: { type: 'string', example: 'جميع الأجهزة الإلكترونية المحدثة' },
            isActive: { type: 'boolean', example: true },
            isFeatured: { type: 'boolean', example: true },
            order: { type: 'number', example: 2 },
            productCount: { type: 'number', example: 25 },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'الفئة غير موجودة' })
  @ApiUnauthorizedResponse({ description: 'غير مصرح - مطلوب تسجيل دخول' })
  @ApiForbiddenResponse({ description: 'ممنوع - مطلوب صلاحيات إدارية' })
  async updateCategory(
    @Param('id') id: string, 
    @Body() dto: UpdateCategoryDto
  ) {
    const category = await this.categoriesService.updateCategory(id, dto as Partial<Category>);
    return category;
  }

  // ==================== حذف فئة (Soft Delete) ====================
  @Delete(':id')
  @ApiOperation({
    summary: 'حذف فئة (حذف منطقي)',
    description: 'حذف فئة من النظام (حذف منطقي - Soft Delete). يمكن استعادتها لاحقاً. يتطلب صلاحيات إدارية.',
    tags: ['إدارة الفئات']
  })
  @ApiParam({
    name: 'id',
    description: 'معرف الفئة (ObjectId)',
    example: '64a1b2c3d4e5f6789abcdef0'
  })
  @ApiOkResponse({
    description: 'تم حذف الفئة بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            deleted: { type: 'boolean', example: true },
            deletedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'الفئة غير موجودة' })
  @ApiBadRequestResponse({ description: 'لا يمكن حذف فئة تحتوي على منتجات أو فئات فرعية' })
  @ApiUnauthorizedResponse({ description: 'غير مصرح - مطلوب تسجيل دخول' })
  @ApiForbiddenResponse({ description: 'ممنوع - مطلوب صلاحيات إدارية' })
  async deleteCategory(
    @Param('id') id: string,
    @Req() req: { user: { sub: string } }
  ) {
    const category = await this.categoriesService.deleteCategory(id, req.user.sub);
    return { deleted: true, deletedAt: category.deletedAt };
  }

  // ==================== استعادة فئة محذوفة ====================
  @Post(':id/restore')
  @ApiOperation({
    summary: 'استعادة فئة محذوفة',
    description: 'استعادة فئة تم حذفها مسبقاً (حذف منطقي). يتطلب صلاحيات إدارية.',
    tags: ['إدارة الفئات']
  })
  @ApiParam({
    name: 'id',
    description: 'معرف الفئة المحذوفة (ObjectId)',
    example: '64a1b2c3d4e5f6789abcdef0'
  })
  @ApiOkResponse({
    description: 'تم استعادة الفئة بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            restored: { type: 'boolean', example: true }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'الفئة غير موجودة أو غير محذوفة' })
  @ApiUnauthorizedResponse({ description: 'غير مصرح - مطلوب تسجيل دخول' })
  @ApiForbiddenResponse({ description: 'ممنوع - مطلوب صلاحيات إدارية' })
  async restoreCategory(@Param('id') id: string) {
    await this.categoriesService.restoreCategory(id);
    return { restored: true };
  }

  // ==================== حذف نهائي ====================
  @Delete(':id/permanent')
  @Roles(UserRole.SUPER_ADMIN) // فقط Super Admin
  @ApiOperation({
    summary: 'حذف نهائي للفئة',
    description: 'حذف فئة نهائياً من النظام. لا يمكن استعادتها. يتطلب صلاحيات Super Admin فقط.',
    tags: ['إدارة الفئات']
  })
  @ApiParam({
    name: 'id',
    description: 'معرف الفئة (ObjectId)',
    example: '64a1b2c3d4e5f6789abcdef0'
  })
  @ApiOkResponse({
    description: 'تم حذف الفئة نهائياً بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            deleted: { type: 'boolean', example: true },
            message: { type: 'string', example: 'تم حذف الفئة نهائياً' }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'الفئة غير موجودة' })
  @ApiUnauthorizedResponse({ description: 'غير مصرح - مطلوب تسجيل دخول' })
  @ApiForbiddenResponse({ description: 'ممنوع - مطلوب صلاحيات Super Admin فقط' })
  async permanentDeleteCategory(@Param('id') id: string) {
    const result = await this.categoriesService.permanentDeleteCategory(id);
    return result;
  }

  // ==================== تحديث الإحصائيات ====================
  @Post(':id/update-stats')
  @ApiOperation({
    summary: 'تحديث إحصائيات الفئة',
    description: 'تحديث عدد المنتجات والإحصائيات الأخرى للفئة. يتطلب صلاحيات إدارية.',
    tags: ['إدارة الفئات']
  })
  @ApiParam({
    name: 'id',
    description: 'معرف الفئة (ObjectId)',
    example: '64a1b2c3d4e5f6789abcdef0'
  })
  @ApiOkResponse({
    description: 'تم تحديث الإحصائيات بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            updated: { type: 'boolean', example: true },
            productCount: { type: 'number', example: 25 },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        }
      }
    }
  })
  @ApiNotFoundResponse({ description: 'الفئة غير موجودة' })
  @ApiUnauthorizedResponse({ description: 'غير مصرح - مطلوب تسجيل دخول' })
  @ApiForbiddenResponse({ description: 'ممنوع - مطلوب صلاحيات إدارية' })
  async updateCategoryStats(@Param('id') id: string) {
    const result = await this.categoriesService.updateCategoryStats(id);
    return  result;
  }

  // ==================== إحصائيات عامة ====================
  @Get('stats/summary')
  @ApiOperation({
    summary: 'إحصائيات الفئات العامة',
    description: 'الحصول على إحصائيات شاملة عن الفئات في النظام. يتطلب صلاحيات إدارية.',
    tags: ['إدارة الفئات - الإحصائيات']
  })
  @ApiOkResponse({
    description: 'تم الحصول على الإحصائيات بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            totalCategories: { type: 'number', example: 50 },
            activeCategories: { type: 'number', example: 45 },
            featuredCategories: { type: 'number', example: 10 },
            deletedCategories: { type: 'number', example: 5 },
            totalProducts: { type: 'number', example: 1250 },
            categoriesWithProducts: { type: 'number', example: 35 },
            averageProductsPerCategory: { type: 'number', example: 25.5 }
          }
        }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'غير مصرح - مطلوب تسجيل دخول' })
  @ApiForbiddenResponse({ description: 'ممنوع - مطلوب صلاحيات إدارية' })
  async getStats() {
    return this.categoriesService.getStats();
  }
}

