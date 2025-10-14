import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiQuery, ApiOperation } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchQueryDto, AdvancedProductSearchDto } from './dto/search.dto';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  // ==================== البحث الشامل ====================
  @Get()
  @ApiOperation({ summary: 'بحث شامل في المنتجات، الفئات، والبراندات' })
  @ApiQuery({ name: 'q', required: false, description: 'نص البحث' })
  @ApiQuery({ name: 'lang', required: false, enum: ['ar', 'en'], description: 'اللغة' })
  @ApiQuery({ name: 'entity', required: false, enum: ['products', 'categories', 'brands', 'all'], description: 'نوع الكيانات' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async universalSearch(@Query() dto: SearchQueryDto) {
    const data = await this.searchService.universalSearch(dto);
    return { data };
  }

  // ==================== بحث المنتجات المتقدم ====================
  @Get('products')
  @ApiOperation({ summary: 'بحث متقدم في المنتجات مع filters' })
  @ApiQuery({ name: 'q', required: false, description: 'نص البحث' })
  @ApiQuery({ name: 'lang', required: false, enum: ['ar', 'en'] })
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'brandId', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'isFeatured', required: false, type: Boolean })
  @ApiQuery({ name: 'isNew', required: false, type: Boolean })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'minRating', required: false, type: Number })
  @ApiQuery({ name: 'attributes', required: false, description: 'JSON string' })
  @ApiQuery({ name: 'tags', required: false, type: [String] })
  @ApiQuery({ name: 'sortBy', required: false, enum: ['name', 'price', 'rating', 'views', 'createdAt', 'relevance'] })
  @ApiQuery({ name: 'sortOrder', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({ name: 'includeFacets', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async advancedProductSearch(@Query() dto: AdvancedProductSearchDto) {
    const data = await this.searchService.advancedProductSearch(dto);
    return { data };
  }

  // ==================== الاقتراحات (Autocomplete) ====================
  @Get('suggestions')
  @ApiOperation({ summary: 'اقتراحات البحث (Autocomplete)' })
  @ApiQuery({ name: 'q', required: true, description: 'نص البحث' })
  @ApiQuery({ name: 'lang', required: false, enum: ['ar', 'en'] })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getSuggestions(
    @Query('q') query: string,
    @Query('lang') lang: 'ar' | 'en' = 'ar',
    @Query('limit') limit = 10,
  ) {
    const data = await this.searchService.getSearchSuggestions(query, lang, limit);
    return { data };
  }

  // ==================== Autocomplete (alias) ====================
  @Get('autocomplete')
  @ApiOperation({ summary: 'Autocomplete' })
  async autocomplete(
    @Query('q') query: string,
    @Query('lang') lang: 'ar' | 'en' = 'ar',
  ) {
    const data = await this.searchService.getSearchSuggestions(query, lang, 8);
    return { data };
  }
}
