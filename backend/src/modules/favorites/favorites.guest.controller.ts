import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody
} from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { GuestAddFavoriteDto, GuestRemoveFavoriteDto } from './dto/favorite.dto';

@ApiTags('مفضلات-الزوار')
@Controller('favorites/guest')
export class FavoritesGuestController {
  constructor(private favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({
    summary: 'الحصول على مفضلات الزائر',
    description: 'استرداد قائمة المفضلات للزائر غير المسجل باستخدام معرف الجهاز'
  })
  @ApiQuery({
    name: 'deviceId',
    description: 'معرف الجهاز الفريد للزائر',
    example: 'device_123456789',
    required: true
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد مفضلات الزائر بنجاح',
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
              note: { type: 'string', example: 'منتج رائع!', description: 'ملاحظة الزائر' },
              addedAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z', description: 'تاريخ الإضافة' }
            }
          }
        }
      }
    }
  })
  async listFavorites(@Query('deviceId') deviceId: string) {
    if (!deviceId) {
      return [];
    }

    const data = await this.favoritesService.listGuestFavorites(deviceId);
    return data;
  }

  @Post()
  @ApiOperation({
    summary: 'إضافة منتج لمفضلات الزائر',
    description: 'إضافة منتج أو متغير منتج إلى قائمة المفضلات للزائر غير المسجل'
  })
  @ApiBody({ type: GuestAddFavoriteDto })
  @ApiResponse({
    status: 201,
    description: 'تم إضافة المنتج لمفضلات الزائر بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '507f1f77bcf86cd799439011', description: 'معرف المفضلة الجديدة' },
            productId: { type: 'string', example: '507f1f77bcf86cd799439012', description: 'معرف المنتج' },
            variantId: { type: 'string', example: '507f1f77bcf86cd799439013', description: 'معرف المتغير' },
            note: { type: 'string', example: 'منتج رائع!', description: 'ملاحظة الزائر' },
            addedAt: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z', description: 'تاريخ الإضافة' }
          }
        }
      }
    }
  })
  @ApiResponse({
    status: 400,
    description: 'بيانات غير صحيحة'
  })
  async addFavorite(@Body() dto: GuestAddFavoriteDto) {
    const favorite = await this.favoritesService.addGuestFavorite(dto.deviceId, {
      productId: dto.productId,
      variantId: dto.variantId,
      note: dto.note,
    });
    return favorite;
  }

  @Delete()
  @ApiOperation({
    summary: 'إزالة منتج من مفضلات الزائر',
    description: 'إزالة منتج أو متغير منتج من قائمة المفضلات للزائر غير المسجل'
  })
  @ApiBody({ type: GuestRemoveFavoriteDto })
  @ApiResponse({
    status: 200,
    description: 'تم إزالة المنتج من مفضلات الزائر بنجاح',
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
  async removeFavorite(@Body() dto: GuestRemoveFavoriteDto) {
    const result = await this.favoritesService.removeGuestFavorite(dto.deviceId, {
      productId: dto.productId,
      variantId: dto.variantId,
    });
    return {
      deleted: result.deleted,
      removed: result.deleted ? 1 : 0
    };
  }

  @Delete('clear')
  @ApiOperation({
    summary: 'حذف جميع مفضلات الزائر',
    description: 'حذف جميع المنتجات من قائمة المفضلات للزائر غير المسجل'
  })
  @ApiQuery({
    name: 'deviceId',
    description: 'معرف الجهاز الفريد للزائر',
    example: 'device_123456789',
    required: true
  })
  @ApiResponse({
    status: 200,
    description: 'تم حذف جميع مفضلات الزائر بنجاح',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'object',
          properties: {
            cleared: { type: 'number', example: 10, description: 'عدد العناصر المحذوفة' }
          }
        }
      }
    }
  })
  async clearFavorites(@Query('deviceId') deviceId: string) {
    if (!deviceId) {
      return { cleared: 0 };
    }

    const result = await this.favoritesService.clearGuestFavorites(deviceId);
    return result;
  }

  @Get('count')
  @ApiOperation({
    summary: 'الحصول على عدد مفضلات الزائر',
    description: 'استرداد عدد المنتجات في قائمة المفضلات للزائر غير المسجل'
  })
  @ApiQuery({
    name: 'deviceId',
    description: 'معرف الجهاز الفريد للزائر',
    example: 'device_123456789',
    required: true
  })
  @ApiResponse({
    status: 200,
    description: 'تم استرداد عدد مفضلات الزائر بنجاح',
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
  async getCount(@Query('deviceId') deviceId: string) {
    if (!deviceId) {
      return { count: 0 };
    }

    const count = await this.favoritesService.getGuestFavoritesCount(deviceId);
    return { count };
  }
}

