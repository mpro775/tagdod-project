import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ListPublicInstallationGuidesDto } from './dto/installation-guide.dto';
import { InstallationGuidesService } from './installation-guides.service';

@ApiTags('طرق-التركيب-العامة')
@Controller('installation-guides')
export class InstallationGuidesPublicController {
  constructor(private readonly guidesService: InstallationGuidesService) {}

  @Get('public')
  @ApiOperation({ summary: 'Public list of active installation guides with pagination' })
  @ApiQuery({ type: ListPublicInstallationGuidesDto })
  @ApiResponse({ status: 200, description: 'Guides fetched successfully' })
  async list(@Query() query: ListPublicInstallationGuidesDto) {
    return this.guidesService.listForPublic(query);
  }

  @Get('public/:id')
  @ApiOperation({ summary: 'Public installation guide details' })
  @ApiResponse({ status: 200, description: 'Guide details fetched successfully' })
  @ApiResponse({ status: 404, description: 'Guide not found' })
  async getById(@Param('id') id: string) {
    return this.guidesService.getByIdForPublic(id);
  }
}

