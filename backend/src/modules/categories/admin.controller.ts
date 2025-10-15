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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto, ListCategoriesDto } from './dto/category.dto';
import { Category } from './schemas/category.schema';

@ApiTags('admin-categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR)
@Controller('admin/categories')
export class CategoriesAdminController {
  constructor(private categoriesService: CategoriesService) {}

  // ==================== إنشاء فئة ====================
  @Post()
  async createCategory(@Body() dto: CreateCategoryDto) {
    const category = await this.categoriesService.createCategory(dto as Partial<Category>);
    return { data: category };
  }

  // ==================== قائمة الفئات ====================
  @Get()
  async listCategories(@Query() dto: ListCategoriesDto) {
    const categories = await this.categoriesService.listCategories(dto);
    return { data: categories };
  }

  // ==================== شجرة الفئات الكاملة ====================
  @Get('tree')
  async getCategoryTree() {
    const tree = await this.categoriesService.getCategoryTree();
    return { data: tree };
  }

  // ==================== عرض فئة واحدة ====================
  @Get(':id')
  async getCategory(@Param('id') id: string) {
    const category = await this.categoriesService.getCategory(id);
    return { data: category };
  }

  // ==================== تحديث فئة ====================
  @Patch(':id')
  async updateCategory(
    @Param('id') id: string, 
    @Body() dto: UpdateCategoryDto
  ) {
    const category = await this.categoriesService.updateCategory(id, dto as Partial<Category>);
    return { data: category };
  }

  // ==================== حذف فئة (Soft Delete) ====================
  @Delete(':id')
  async deleteCategory(
    @Param('id') id: string,
    @Req() req: { user: { sub: string } }
  ) {
    const category = await this.categoriesService.deleteCategory(id, req.user.sub);
    return { data: { deleted: true, deletedAt: category.deletedAt } };
  }

  // ==================== استعادة فئة محذوفة ====================
  @Post(':id/restore')
  async restoreCategory(@Param('id') id: string) {
    await this.categoriesService.restoreCategory(id);
    return { data: { restored: true } };
  }

  // ==================== حذف نهائي ====================
  @Delete(':id/permanent')
  @Roles(UserRole.SUPER_ADMIN) // فقط Super Admin
  async permanentDeleteCategory(@Param('id') id: string) {
    const result = await this.categoriesService.permanentDeleteCategory(id);
    return { data: result };
  }

  // ==================== تحديث الإحصائيات ====================
  @Post(':id/update-stats')
  async updateCategoryStats(@Param('id') id: string) {
    const result = await this.categoriesService.updateCategoryStats(id);
    return { data: result };
  }

  // ==================== إحصائيات عامة ====================
  @Get('stats/summary')
  async getStats() {
    return this.categoriesService.getStats();
  }
}

