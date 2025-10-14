import { 
  Body, 
  Controller, 
  Delete, 
  Get, 
  Param, 
  Patch,
  Post, 
  Query, 
  UseGuards 
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { BannersService } from './banners.service';
import { CreateBannerDto, UpdateBannerDto, ListBannersDto } from './dto/banner.dto';

@ApiTags('admin-banners')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR)
@Controller('admin/banners')
export class BannersAdminController {
  constructor(private readonly bannersService: BannersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new banner' })
  async createBanner(@Body() dto: CreateBannerDto) {
    const banner = await this.bannersService.createBanner(dto);
    return {
      success: true,
      message: 'Banner created successfully',
      data: banner,
    };
  }

  @Get()
  @ApiOperation({ summary: 'List all banners with filters and pagination' })
  async listBanners(@Query() dto: ListBannersDto) {
    const result = await this.bannersService.listBanners(dto);
    return {
      success: true,
      data: result.banners,
      pagination: result.pagination,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get banner by ID' })
  async getBanner(@Param('id') id: string) {
    const banner = await this.bannersService.getBannerById(id);
    return {
      success: true,
      data: banner,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update banner' })
  async updateBanner(
    @Param('id') id: string,
    @Body() dto: UpdateBannerDto,
  ) {
    const banner = await this.bannersService.updateBanner(id, dto);
    return {
      success: true,
      message: 'Banner updated successfully',
      data: banner,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete banner' })
  async deleteBanner(@Param('id') id: string) {
    await this.bannersService.deleteBanner(id);
    return {
      success: true,
      message: 'Banner deleted successfully',
    };
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Toggle banner active status' })
  async toggleBannerStatus(@Param('id') id: string) {
    const banner = await this.bannersService.toggleBannerStatus(id);
    return {
      success: true,
      message: `Banner ${banner.isActive ? 'activated' : 'deactivated'} successfully`,
      data: banner,
    };
  }
}

