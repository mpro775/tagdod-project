import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam
} from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { AddFavoriteDto, RemoveFavoriteDto, UpdateFavoriteDto, SyncFavoritesDto } from './dto/favorite.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('المفضلات-المستخدم')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesUserController {
  constructor(private favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({
    summary: 'الحصول على قائمة المفضلات',
    description: 'استرداد قائمة بجميع المنتجات المضافة للمفضلة من قبل المستخدم'
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد قائمة المفضلات بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string', example: '507f1f77bcf86cd799439011', description: 'معرف المفضلة' },
              productId: { type: 'string', example: '507f1f77bcf86cd799439012', description: 'معرف المنتج' },
              variantId: { type: 'string', example: '507f1f77bcf86cd799439013', description: 'معرف المتغير' },
              note: { type: 'string', example: 'منتج رائع!', description: 'ملاحظة المستخدم' },
              addedAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z', description: 'تاريخ الإضافة' }
            }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'غير مصرح لك بالوصول'
  })
  async listFavorites(@Req() req: { user: { sub: string } }) {
    const data = await this.favoritesService.listUserFavorites(req.user.sub);
    return data;
  }

  @Post()
  @ApiOperation({
    summary: 'إضافة منتج للمفضلة',
    description: 'إضافة منتج أو متغير منتج إلى قائمة المفضلات الخاصة بالمستخدم'
  })
  @ApiBody({ type: AddFavoriteDto })
  @ApiResponse({
    status: 201,
    description: 'تم إضافة المنتج للمفضلة بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011', description: 'معرف المفضلة الجديدة' },
            productId: { type: 'string', example: '507f1f77bcf86cd799439012', description: 'معرف المنتج' },
            variantId: { type: 'string', example: '507f1f77bcf86cd799439013', description: 'معرف المتغير' },
            note: { type: 'string', example: 'منتج رائع!', description: 'ملاحظة المستخدم' },
            addedAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z', description: 'تاريخ الإضافة' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'بيانات غير صحيحة أو المنتج موجود بالفعل في المفضلة'
  })
  @ApiResponse({
    status: 401,
    description: 'غير مصرح لك بالوصول'
  })
  async addFavorite(
    @Req() req: { user: { sub: string } },
    @Body() dto: AddFavoriteDto
  ) {
    const favorite = await this.favoritesService.addUserFavorite(req.user.sub, dto);
    return favorite;
  }

  @Delete()
  @ApiOperation({
    summary: 'إزالة منتج من المفضلة',
    description: 'إزالة منتج أو متغير منتج من قائمة المفضلات الخاصة بالمستخدم'
  })
  @ApiBody({ type: RemoveFavoriteDto })
  @ApiResponse({
    status: 200,
    description: 'تم إزالة المنتج من المفضلة بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true, description: 'نجاح العملية' },
            removed: { type: 'number', example: 1, description: 'عدد العناصر المزالة' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'بيانات غير صحيحة'
  })
  @ApiResponse({
    status: 401,
    description: 'غير مصرح لك بالوصول'
  })
  async removeFavorite(
    @Req() req: { user: { sub: string } },
    @Body() dto: RemoveFavoriteDto
  ) {
    const result = await this.favoritesService.removeUserFavorite(req.user.sub, dto);
    return result;
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'تحديث مفضلة',
    description: 'تحديث ملاحظة أو تفاصيل عنصر في المفضلة'
  })
  @ApiParam({
    name: 'id',
    description: 'معرف المفضلة',
    example: '507f1f77bcf86cd799439011'
  })
  @ApiBody({ type: UpdateFavoriteDto })
  @ApiResponse({
    status: 200,
    description: 'تم تحديث المفضلة بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011', description: 'معرف المفضلة' },
            productId: { type: 'string', example: '507f1f77bcf86cd799439012', description: 'معرف المنتج' },
            variantId: { type: 'string', example: '507f1f77bcf86cd799439013', description: 'معرف المتغير' },
            note: { type: 'string', example: 'منتج ممتاز!', description: 'الملاحظة المحدثة' },
            updatedAt: { type: 'string', format: 'date-time', example: '2024-01-15T11:00:00Z', description: 'تاريخ التحديث' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'بيانات غير صحيحة'
  })
  @ApiResponse({
    status: 401,
    description: 'غير مصرح لك بالوصول'
  })
  @ApiResponse({
    status: 404,
    description: 'المفضلة غير موجودة'
  })
  async updateFavorite(
    @Req() req: { user: { sub: string } },
    @Param('id') id: string,
    @Body() dto: UpdateFavoriteDto
  ) {
    const favorite = await this.favoritesService.updateUserFavorite(req.user.sub, id, dto);
    return favorite;
  }

  @Delete('clear/all')
  @ApiOperation({
    summary: 'حذف جميع المفضلات',
    description: 'حذف جميع المنتجات من قائمة المفضلات الخاصة بالمستخدم'
  })
  @ApiResponse({
    status: 200,
    description: 'تم حذف جميع المفضلات بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true, description: 'نجاح العملية' },
            deleted: { type: 'number', example: 15, description: 'عدد العناصر المحذوفة' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'غير مصرح لك بالوصول'
  })
  async clearFavorites(@Req() req: { user: { sub: string } }) {
    const result = await this.favoritesService.clearUserFavorites(req.user.sub);
    return result;
  }

  @Get('count')
  @ApiOperation({
    summary: 'الحصول على عدد المفضلات',
    description: 'استرداد عدد المنتجات في قائمة المفضلات الخاصة بالمستخدم'
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد عدد المفضلات بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            count: { type: 'number', example: 15, description: 'عدد المنتجات في المفضلة' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 401,
    description: 'غير مصرح لك بالوصول'
  })
  async getCount(@Req() req: { user: { sub: string } }) {
    const count = await this.favoritesService.getUserFavoritesCount(req.user.sub);
    return { count };
  }


  // ==================== مزامنة من الزائر ====================
  @Post('sync')
  async syncFromGuest(
    @Req() req: { user: { sub: string } },
    @Body() dto: SyncFavoritesDto
  ) {
    const result = await this.favoritesService.syncGuestToUser(dto.deviceId, req.user.sub);
    return result;
  }

  // ==================== زيادة عداد المشاهدات ====================
  @Post(':id/view')
  async incrementView(@Param('id') id: string) {
    await this.favoritesService.incrementViews(id);
    return { viewed: true };
  }
}

