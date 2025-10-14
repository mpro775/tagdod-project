import { 
  Controller, 
  Get, 
  Param,
  Query
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { BrandsService } from './brands.service';
import { ListBrandsDto } from './dto/brand.dto';

@ApiTags('brands')
@Controller('brands')
export class BrandsPublicController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all active brands (Public endpoint - no auth required)' })
  async getActiveBrands(@Query() dto: ListBrandsDto) {
    // For public endpoint, always filter active brands only
    const result = await this.brandsService.listBrands({
      ...dto,
      isActive: true,
    });
    
    return {
      success: true,
      data: result.brands,
      pagination: result.pagination,
    };
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get brand by slug (Public endpoint)' })
  async getBrandBySlug(@Param('slug') slug: string) {
    const brand = await this.brandsService.getBrandBySlug(slug);
    return {
      success: true,
      data: brand,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get brand by ID (Public endpoint)' })
  async getBrandById(@Param('id') id: string) {
    const brand = await this.brandsService.getBrandById(id);
    return {
      success: true,
      data: brand,
    };
  }
}

