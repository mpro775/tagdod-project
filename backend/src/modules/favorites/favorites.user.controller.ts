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
  ApiParam,
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
      type: 'array',
      items: {
        type: 'object',
        properties: {
          _id: { type: 'string', example: '65af1c91f2a7f20012d34567', description: 'معرف عنصر المفضلة' },
          productId: { type: 'string', example: '65af1c91f2a7f20012d39999', description: 'معرف المنتج' },
          note: { type: 'string', example: 'أحتاج التحقق من المخزون قبل الشراء', description: 'ملاحظة المستخدم' },
          isSynced: { type: 'boolean', example: false, description: 'هل تمت مزامنة هذا السجل من جهاز زائر' },
          createdAt: { type: 'string', format: 'date-time', example: '2025-02-01T12:30:00.000Z', description: 'تاريخ الإضافة للمفضلة' },
        },
      },
      example: [
        {
          _id: '65af1c91f2a7f20012d34567',
          productId: '65af1c91f2a7f20012d39999',
          note: 'أحتاج التحقق من المخزون قبل الشراء',
          isSynced: false,
          createdAt: '2025-02-01T12:30:00.000Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'غير مصرح لك بالوصول'
  })
  async listFavorites(@Req() req: { user: { sub: string } }): Promise<Record<string, unknown>[]> {
    const data = await this.favoritesService.listUserFavorites(req.user.sub);
    return data as Record<string, unknown>[];
  }

  @Post()
  @ApiOperation({
    summary: 'إضافة منتج للمفضلة',
    description: 'إضافة منتج إلى قائمة المفضلات الخاصة بالمستخدم'
  })
  @ApiBody({
    type: AddFavoriteDto,
    examples: {
      default: {
        summary: 'إضافة منتج عادي',
        value: {
          productId: '65af1c91f2a7f20012d39999',
          note: 'هدية لعيد ميلاد أختي',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'تم إضافة المنتج للمفضلة بنجاح',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string', example: '65af1c91f2a7f20012d35555', description: 'معرف المفضلة الجديدة' },
        productId: { type: 'string', example: '65af1c91f2a7f20012d39999', description: 'معرف المنتج' },
        note: { type: 'string', example: 'منتج رائع!', description: 'ملاحظة المستخدم' },
        isSynced: { type: 'boolean', example: false, description: 'هل تمت مزامنة هذا السجل من جهاز زائر' },
        createdAt: { type: 'string', format: 'date-time', example: '2025-02-01T12:30:00.000Z', description: 'تاريخ الإضافة' },
        updatedAt: { type: 'string', format: 'date-time', example: '2025-02-01T12:30:00.000Z', description: 'آخر تحديث' },
      },
      example: {
        _id: '65af1c91f2a7f20012d35555',
        productId: '65af1c91f2a7f20012d39999',
        note: 'منتج رائع!',
        isSynced: false,
        createdAt: '2025-02-01T12:30:00.000Z',
        updatedAt: '2025-02-01T12:30:00.000Z',
      },
    },
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
    description: 'إزالة منتج من قائمة المفضلات الخاصة بالمستخدم'
  })
  @ApiBody({
    type: RemoveFavoriteDto,
    examples: {
      removeByProduct: {
        summary: 'إزالة منتج أساسي',
        value: {
          productId: '65af1c91f2a7f20012d39999',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'تم إزالة المنتج من المفضلة بنجاح',
    schema: {
      type: 'object',
      properties: {
        deleted: { type: 'boolean', example: true, description: 'هل تم حذف المفضلة بنجاح' },
      },
      example: { deleted: true },
    },
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
  @ApiBody({
    type: UpdateFavoriteDto,
    examples: {
      updateNote: {
        summary: 'تحديث الملاحظة فقط',
        value: {
          note: 'تم التأكد من السعر، مناسب للشراء',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'تم تحديث المفضلة بنجاح',
    schema: {
      type: 'object',
      properties: {
        _id: { type: 'string', example: '65af1c91f2a7f20012d34567', description: 'معرف المفضلة' },
        productId: { type: 'string', example: '65af1c91f2a7f20012d39999', description: 'معرف المنتج' },
        note: { type: 'string', example: 'منتج ممتاز!', description: 'الملاحظة المحدثة' },
        updatedAt: { type: 'string', format: 'date-time', example: '2025-02-05T17:00:00.000Z', description: 'تاريخ التحديث' },
      },
      example: {
        _id: '65af1c91f2a7f20012d34567',
        productId: '65af1c91f2a7f20012d39999',
        note: 'منتج ممتاز!',
        updatedAt: '2025-02-05T17:00:00.000Z',
      },
    },
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
        cleared: { type: 'number', example: 15, description: 'عدد العناصر المحذوفة' },
      },
      example: { cleared: 15 },
    },
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
        count: { type: 'number', example: 15, description: 'عدد المنتجات في المفضلة' },
      },
      example: { count: 15 },
    },
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
  @ApiOperation({
    summary: 'مزامنة مفضلات الزائر مع حساب المستخدم',
    description: 'يحول المفضلات المخزنة بواسطة deviceId إلى حساب المستخدم الحالي مع احتساب العناصر المتكررة',
  })
  @ApiBody({
    type: SyncFavoritesDto,
    examples: {
      default: {
        summary: 'مزامنة قياسية',
        value: {
          deviceId: 'device-abc-123',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'تمت المزامنة بنجاح',
    schema: {
      type: 'object',
      properties: {
        synced: { type: 'number', example: 5, description: 'عدد العناصر التي تمت إضافتها للمستخدم' },
        skipped: { type: 'number', example: 2, description: 'عدد العناصر التي تم تجاوزها لأنها موجودة مسبقاً' },
        total: { type: 'number', example: 7, description: 'إجمالي العناصر التي تمت قراءتها من جهاز الزائر' },
      },
      example: { synced: 5, skipped: 2, total: 7 },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'DeviceId مفقود أو غير صالح',
  })
  async syncFromGuest(
    @Req() req: { user: { sub: string } },
    @Body() dto: SyncFavoritesDto
  ) {
    const result = await this.favoritesService.syncGuestToUser(dto.deviceId, req.user.sub);
    return result;
  }

  // ==================== زيادة عداد المشاهدات ====================
  @Post(':id/view')
  @ApiOperation({
    summary: 'زيادة عدد مرات مشاهدة عنصر المفضلة',
    description: 'يستخدم هذا النداء عادة عند فتح المستخدم لصفحة المنتج لإحصاء الاهتمام',
  })
  @ApiParam({
    name: 'id',
    description: 'معرف عنصر المفضلة',
    example: '65af1c91f2a7f20012d34567',
  })
  @ApiResponse({
    status: 200,
    description: 'تم تحديث عداد المشاهدات للمفضلة',
    schema: {
      type: 'object',
      properties: {
        viewed: { type: 'boolean', example: true, description: 'تأكيد نجاح العملية' },
      },
      example: { viewed: true },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'المفضلة غير موجودة',
  })
  async incrementView(@Param('id') id: string) {
    await this.favoritesService.incrementViews(id);
    return { viewed: true };
  }
}

