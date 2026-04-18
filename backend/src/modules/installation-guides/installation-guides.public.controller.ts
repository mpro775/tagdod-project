import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { InstallationGuidesService } from './installation-guides.service';

@ApiTags('طرق-التركيب-العامة')
@Controller('installation-guides')
export class InstallationGuidesPublicController {
  constructor(private readonly guidesService: InstallationGuidesService) {}

  @Get('public')
  @ApiOperation({ summary: 'Public list of active installation guides' })
  @ApiResponse({ status: 200, description: 'Guides fetched successfully' })
  async list() {
    return this.guidesService.listForPublic();
  }

  @Get('public/:id')
  @ApiOperation({ summary: 'Public installation guide details' })
  @ApiResponse({ status: 200, description: 'Guide details fetched successfully' })
  @ApiResponse({ status: 404, description: 'Guide not found' })
  async getById(@Param('id') id: string) {
    return this.guidesService.getByIdForPublic(id);
  }
}

