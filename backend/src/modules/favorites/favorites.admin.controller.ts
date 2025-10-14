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
import { AdminGuard } from '../../shared/guards/admin.guard';

@ApiTags('favorites-admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/favorites')
export class FavoritesAdminController {
  constructor(private favoritesService: FavoritesService) {}

  // ==================== الإحصائيات العامة ====================
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

