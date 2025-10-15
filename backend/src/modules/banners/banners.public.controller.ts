import { 
  Controller, 
  Get, 
  Param,
  Post,
  Query
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BannersService } from './banners.service';
import { BannerLocation } from './schemas/banner.schema';
 
@ApiTags('banners')
@Controller('banners')
export class BannersPublicController {
  constructor(private readonly bannersService: BannersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active banners (Public endpoint - no auth required)' })
  async getActiveBanners(@Query('location') location?: BannerLocation) {
    const banners = await this.bannersService.getActiveBanners(location);
    
    return {
      success: true,
      data: banners,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get banner by ID (Public endpoint)' })
  async getBannerById(@Param('id') id: string) {
    const banner = await this.bannersService.getBannerById(id);
    return {
      success: true,
      data: banner,
    };
  }

  @Post(':id/view')
  @ApiOperation({ summary: 'Increment banner view count' })
  async incrementViewCount(@Param('id') id: string) {
    await this.bannersService.incrementViewCount(id);
    return {
      success: true,
      message: 'View count incremented',
    };
  }

  @Post(':id/click')
  @ApiOperation({ summary: 'Increment banner click count' })
  async incrementClickCount(@Param('id') id: string) {
    await this.bannersService.incrementClickCount(id);
    return {
      success: true,
      message: 'Click count incremented',
    };
  }

  @Get(':id/promotion')
  @ApiOperation({ summary: 'Get banner with linked promotion details' })
  async getBannerWithPromotion(@Param('id') id: string) {
    const banner = await this.bannersService.getBannerWithPromotion(id);
    return {
      success: true,
      data: banner,
    };
  }
}

