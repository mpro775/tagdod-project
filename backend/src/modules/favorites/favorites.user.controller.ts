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
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { AddFavoriteDto, RemoveFavoriteDto, UpdateFavoriteDto, SyncFavoritesDto } from './dto/favorite.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('favorites-user')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesUserController {
  constructor(private favoritesService: FavoritesService) {}

  // ==================== قائمة المفضلات ====================
  @Get()
  async listFavorites(@Req() req: { user: { sub: string } }) {
    const data = await this.favoritesService.listUserFavorites(req.user.sub);
    return { data };
  }

  // ==================== إضافة للمفضلة ====================
  @Post()
  async addFavorite(
    @Req() req: { user: { sub: string } },
    @Body() dto: AddFavoriteDto
  ) {
    const favorite = await this.favoritesService.addUserFavorite(req.user.sub, dto);
    return { data: favorite };
  }

  // ==================== إزالة من المفضلة ====================
  @Delete()
  async removeFavorite(
    @Req() req: { user: { sub: string } },
    @Body() dto: RemoveFavoriteDto
  ) {
    const result = await this.favoritesService.removeUserFavorite(req.user.sub, dto);
    return { data: result };
  }

  // ==================== تحديث مفضلة ====================
  @Patch(':id')
  async updateFavorite(
    @Req() req: { user: { sub: string } },
    @Param('id') id: string,
    @Body() dto: UpdateFavoriteDto
  ) {
    const favorite = await this.favoritesService.updateUserFavorite(req.user.sub, id, dto);
    return { data: favorite };
  }

  // ==================== حذف جميع المفضلات ====================
  @Delete('clear/all')
  async clearFavorites(@Req() req: { user: { sub: string } }) {
    const result = await this.favoritesService.clearUserFavorites(req.user.sub);
    return { data: result };
  }

  // ==================== عدد المفضلات ====================
  @Get('count')
  async getCount(@Req() req: { user: { sub: string } }) {
    const count = await this.favoritesService.getUserFavoritesCount(req.user.sub);
    return { data: { count } };
  }

  // ==================== المفضلات حسب الوسوم ====================
  @Get('by-tags')
  async getFavoritesByTags(
    @Req() req: { user: { sub: string } },
    @Query('tags') tags: string
  ) {
    const tagArray = tags.split(',');
    const favorites = await this.favoritesService.getUserFavoritesByTags(req.user.sub, tagArray);
    return { data: favorites };
  }

  // ==================== مزامنة من الزائر ====================
  @Post('sync')
  async syncFromGuest(
    @Req() req: { user: { sub: string } },
    @Body() dto: SyncFavoritesDto
  ) {
    const result = await this.favoritesService.syncGuestToUser(dto.deviceId, req.user.sub);
    return { data: result };
  }

  // ==================== زيادة عداد المشاهدات ====================
  @Post(':id/view')
  async incrementView(@Param('id') id: string) {
    await this.favoritesService.incrementViews(id);
    return { data: { viewed: true } };
  }
}

