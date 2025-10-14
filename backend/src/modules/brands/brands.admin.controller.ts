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
import { BrandsService } from './brands.service';
import { CreateBrandDto, UpdateBrandDto, ListBrandsDto } from './dto/brand.dto';

@ApiTags('admin-brands')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.MODERATOR)
@Controller('admin/brands')
export class BrandsAdminController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new brand' })
  async createBrand(@Body() dto: CreateBrandDto) {
    const brand = await this.brandsService.createBrand(dto);
    return {
      success: true,
      message: 'Brand created successfully',
      data: brand,
    };
  }

  @Get()
  @ApiOperation({ summary: 'List all brands with filters and pagination' })
  async listBrands(@Query() dto: ListBrandsDto) {
    const result = await this.brandsService.listBrands(dto);
    return {
      success: true,
      data: result.brands,
      pagination: result.pagination,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get brand by ID' })
  async getBrand(@Param('id') id: string) {
    const brand = await this.brandsService.getBrandById(id);
    return {
      success: true,
      data: brand,
    };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update brand' })
  async updateBrand(
    @Param('id') id: string,
    @Body() dto: UpdateBrandDto,
  ) {
    const brand = await this.brandsService.updateBrand(id, dto);
    return {
      success: true,
      message: 'Brand updated successfully',
      data: brand,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete brand' })
  async deleteBrand(@Param('id') id: string) {
    await this.brandsService.deleteBrand(id);
    return {
      success: true,
      message: 'Brand deleted successfully',
    };
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Toggle brand active status' })
  async toggleBrandStatus(@Param('id') id: string) {
    const brand = await this.brandsService.toggleBrandStatus(id);
    return {
      success: true,
      message: `Brand ${brand.isActive ? 'activated' : 'deactivated'} successfully`,
      data: brand,
    };
  }
}

