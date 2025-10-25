import {
  Controller,
  Get,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam
} from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RequirePermissions } from '../../shared/decorators/permissions.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { AdminPermission } from '../../shared/constants/permissions';
import { AdminGuard } from '../../shared/guards/admin.guard';

@ApiTags('إدارة-المفضلات')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, AdminGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin/favorites')
export class FavoritesAdminController {
  constructor(private favoritesService: FavoritesService) {}

  @RequirePermissions(AdminPermission.FAVORITES_READ, AdminPermission.ADMIN_ACCESS)
  @Get('stats')
  @ApiOperation({
    summary: 'الحصول على إحصائيات المفضلات',
    description: 'استرداد إحصائيات شاملة حول استخدام المفضلات في النظام'
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد إحصائيات المفضلات بنجاح',
    schema: {
      type: 'object',
      properties: {
        totalFavorites: { type: 'number', example: 1250, description: 'إجمالي عدد المفضلات' },
        totalUsers: { type: 'number', example: 450, description: 'عدد المستخدمين الذين لديهم مفضلات' },
        averagePerUser: { type: 'number', example: 2.8, description: 'متوسط عدد المفضلات لكل مستخدم' },
        mostFavoritedProducts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              productId: { type: 'string', example: '507f1f77bcf86cd799439011' },
              count: { type: 'number', example: 45 }
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 403,
    description: 'غير مصرح لك بالوصول إلى هذه البيانات'
  })
  async getStats() {
    return this.favoritesService.getStats();
  }

  @Get('most-favorited')
  @ApiOperation({
    summary: 'المنتجات الأكثر إضافة للمفضلة',
    description: 'استرداد قائمة بالمنتجات الأكثر إضافة للمفضلة مرتبة تنازلياً'
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'عدد المنتجات المراد عرضها',
    example: 10
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد المنتجات الأكثر تفضيلاً بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              productId: { type: 'string', example: '507f1f77bcf86cd799439011', description: 'معرف المنتج' },
              productName: { type: 'string', example: 'هاتف ذكي سامسونج', description: 'اسم المنتج' },
              count: { type: 'number', example: 45, description: 'عدد مرات الإضافة للمفضلة' },
              percentage: { type: 'number', example: 12.5, description: 'النسبة المئوية من إجمالي المفضلات' }
            }
          }
        }
      }
    }
  })
  async getMostFavorited(@Query('limit') limit?: number) {
    const data = await this.favoritesService.getMostFavoritedProducts(limit || 10);
    return data;
  }

  @Get('product/:productId/count')
  @ApiOperation({
    summary: 'عدد المفضلات لمنتج معين',
    description: 'استرداد عدد المرات التي تم فيها إضافة منتج محدد للمفضلة'
  })
  @ApiParam({
    name: 'productId',
    description: 'معرف المنتج',
    example: '507f1f77bcf86cd799439011'
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد عدد المفضلات للمنتج بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            count: { type: 'number', example: 45, description: 'عدد مرات إضافة المنتج للمفضلة' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'المنتج غير موجود'
  })
  async getProductCount(@Param('productId') productId: string) {
    const count = await this.favoritesService.getProductFavoritesCount(productId);
    return { count };
  }

  @Get('user/:userId/count')
  @ApiOperation({
    summary: 'عدد المفضلات لمستخدم معين',
    description: 'استرداد عدد المنتجات في قائمة المفضلات لمستخدم محدد'
  })
  @ApiParam({
    name: 'userId',
    description: 'معرف المستخدم',
    example: '507f1f77bcf86cd799439012'
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد عدد المفضلات للمستخدم بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            count: { type: 'number', example: 15, description: 'عدد المنتجات في مفضلات المستخدم' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 404,
    description: 'المستخدم غير موجود'
  })
  async getUserCount(@Param('userId') userId: string) {
    const count = await this.favoritesService.getUserFavoritesCount(userId);
    return { count };
  }
}

