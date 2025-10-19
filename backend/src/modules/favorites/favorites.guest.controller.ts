import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { GuestAddFavoriteDto, GuestRemoveFavoriteDto } from './dto/favorite.dto';

@ApiTags('favorites-guest')
@Controller('favorites/guest')
export class FavoritesGuestController {
  constructor(private favoritesService: FavoritesService) {}

  // ==================== قائمة المفضلات للزائر ====================
  @Get()
  async listFavorites(@Query('deviceId') deviceId: string) {
    if (!deviceId) {
      return { data: [] };
    }

    const data = await this.favoritesService.listGuestFavorites(deviceId);
    return { data };
  }

  // ==================== إضافة للمفضلة (زائر) ====================
  @Post()
  async addFavorite(@Body() dto: GuestAddFavoriteDto) {
    const favorite = await this.favoritesService.addGuestFavorite(dto.deviceId, {
      productId: dto.productId,
      variantId: dto.variantId,
      note: dto.note,
    });
    return { data: favorite };
  }

  // ==================== إزالة من المفضلة (زائر) ====================
  @Delete()
  async removeFavorite(@Body() dto: GuestRemoveFavoriteDto) {
    const result = await this.favoritesService.removeGuestFavorite(dto.deviceId, {
      productId: dto.productId,
      variantId: dto.variantId,
    });
    return { data: result };
  }

  // ==================== حذف جميع المفضلات (زائر) ====================
  @Delete('clear')
  async clearFavorites(@Query('deviceId') deviceId: string) {
    if (!deviceId) {
      return { data: { cleared: 0 } };
    }

    const result = await this.favoritesService.clearGuestFavorites(deviceId);
    return { data: result };
  }

  // ==================== عدد المفضلات (زائر) ====================
  @Get('count')
  async getCount(@Query('deviceId') deviceId: string) {
    if (!deviceId) {
      return { data: { count: 0 } };
    }

    const count = await this.favoritesService.getGuestFavoritesCount(deviceId);
    return { data: { count } };
  }
}

