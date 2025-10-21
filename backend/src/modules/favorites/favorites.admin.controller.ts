import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RequirePermissions } from '../../shared/decorators/permissions.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { AdminPermission } from '../../shared/constants/permissions';
import { AdminGuard } from '../../shared/guards/admin.guard';

@ApiTags('favorites-admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, AdminGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin/favorites')
export class FavoritesAdminController {
  constructor(private favoritesService: FavoritesService) {}

  // ==================== الإحصائيات العامة ====================
  @RequirePermissions(AdminPermission.FAVORITES_READ, AdminPermission.ADMIN_ACCESS)
  @Get('stats')
  async getStats() {
    return this.favoritesService.getStats();
  }

  // ==================== المنتجات الأكثر إضافة للمفضلة ====================
  @Get('most-favorited')
  async getMostFavorited(@Query('limit') limit?: number) {
    const data = await this.favoritesService.getMostFavoritedProducts(limit || 10);
    return { data };
  }

  // ==================== عدد المفضلات لمنتج معين ====================
  @Get('product/:productId/count')
  async getProductCount(@Param('productId') productId: string) {
    const count = await this.favoritesService.getProductFavoritesCount(productId);
    return { data: { count } };
  }

  // ==================== عدد المفضلات لمستخدم معين ====================
  @Get('user/:userId/count')
  async getUserCount(@Param('userId') userId: string) {
    const count = await this.favoritesService.getUserFavoritesCount(userId);
    return { data: { count } };
  }
}

