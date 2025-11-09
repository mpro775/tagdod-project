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
  ApiBody,
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
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '65af1c91f2a7f20012d44444', description: 'معرف المفضلة' },
          productId: { type: 'string', example: '65af1c91f2a7f20012d39999', description: 'معرف المنتج' },
          note: { type: 'string', example: 'إضافة لمقارنة الأسعار لاحقاً', description: 'ملاحظة الزائر' },
          createdAt: { type: 'string', format: 'date-time', example: '2025-02-01T12:30:00.000Z', description: 'تاريخ الإضافة' },
          updatedAt: { type: 'string', format: 'date-time', example: '2025-02-02T09:41:12.000Z', description: 'آخر تحديث' },
        },
      },
      example: [
        {
          _id: '65af1c91f2a7f20012d44444',
          productId: '65af1c91f2a7f20012d39999',
          note: 'إضافة لمقارنة الأسعار لاحقاً',
          createdAt: '2025-02-01T12:30:00.000Z',
          updatedAt: '2025-02-02T09:41:12.000Z',
        },
      ],
    },
  })
  async listFavorites(@Query('deviceId') deviceId: string): Promise<Record<string, unknown>[]> {
    if (!deviceId) {
      return [];
    }

    const data = await this.favoritesService.listGuestFavorites(deviceId);
    return data as Record<string, unknown>[];
  }

  @Post()
  @ApiOperation({
    summary: 'إضافة منتج لمفضلات الزائر',
    description: 'إضافة منتج إلى قائمة المفضلات للزائر غير المسجل'
  })
  @ApiBody({
    type: GuestAddFavoriteDto,
    examples: {
      default: {
        summary: 'إضافة منتج كزائر',
        value: {
          deviceId: 'device_123456789',
          productId: '65af1c91f2a7f20012d39999',
        },
      },
      withNote: {
        summary: 'إضافة مع ملاحظة',
        value: {
          deviceId: 'device_123456789',
          productId: '65af1c91f2a7f20012d39999',
          note: 'أحتاج هذا المقاس',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'تم إضافة المنتج لمفضلات الزائر بنجاح',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string', example: '65af1c91f2a7f20012d44444', description: 'معرف المفضلة الجديدة' },
        deviceId: { type: 'string', example: 'device_123456789', description: 'معرف جهاز الزائر' },
        productId: { type: 'string', example: '65af1c91f2a7f20012d39999', description: 'معرف المنتج' },
        note: { type: 'string', example: 'منتج رائع!', description: 'ملاحظة الزائر' },
        isSynced: { type: 'boolean', example: false, description: 'هل تمت مزامنة العنصر مع حساب مستخدم' },
      },
      example: {
        _id: '65af1c91f2a7f20012d44444',
        deviceId: 'device_123456789',
        productId: '65af1c91f2a7f20012d39999',
        note: 'منتج رائع!',
        isSynced: false,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'بيانات غير صحيحة'
  })
  async addFavorite(@Body() dto: GuestAddFavoriteDto) {
    const favorite = await this.favoritesService.addGuestFavorite(dto.deviceId, {
      productId: dto.productId,
      note: dto.note,
    });
    return favorite;
  }

  @Delete()
  @ApiOperation({
    summary: 'إزالة منتج من مفضلات الزائر',
    description: 'إزالة منتج من قائمة المفضلات للزائر غير المسجل'
  })
  @ApiBody({
    type: GuestRemoveFavoriteDto,
    examples: {
      default: {
        summary: 'إزالة منتج لزائر',
        value: {
          deviceId: 'device_123456789',
          productId: '65af1c91f2a7f20012d39999',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'تم إزالة المنتج من مفضلات الزائر بنجاح',
    schema: {
      type: 'object',
      properties: {
        deleted: { type: 'boolean', example: true, description: 'هل تم حذف المفضلة بنجاح' },
        removed: { type: 'number', example: 1, description: 'تم استخدامه للإشارة إلى عدد العناصر التي تمت إزالتها' },
      },
      example: { deleted: true, removed: 1 },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'بيانات غير صحيحة'
  })
  async removeFavorite(@Body() dto: GuestRemoveFavoriteDto) {
    const result = await this.favoritesService.removeGuestFavorite(dto.deviceId, {
      productId: dto.productId,
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
        cleared: { type: 'number', example: 10, description: 'عدد العناصر التي تم حذفها' },
      },
      example: { cleared: 10 },
    },
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
        count: { type: 'number', example: 5, description: 'عدد المنتجات في المفضلة' },
      },
      example: { count: 5 },
    },
  })
  async getCount(@Query('deviceId') deviceId: string) {
    if (!deviceId) {
      return { count: 0 };
    }

    const count = await this.favoritesService.getGuestFavoritesCount(deviceId);
    return { count };
  }
}

