import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PromotionsService } from './promotions.service';
import { CreatePriceRuleDto, UpdatePriceRuleDto, PreviewPriceRuleDto } from './dto/price-rule.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from '../../shared/guards/admin.guard';

@ApiTags('promotions-admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/promotions')
export class PromotionsAdminController {
  constructor(private svc: PromotionsService) {}

  @Post('rules')
  async createRule(@Body() dto: CreatePriceRuleDto) {
    const rule = await this.svc.createPriceRule(dto);
    return { data: rule };
  }

  @Patch('rules/:id')
  async updateRule(@Param('id') id: string, @Body() dto: UpdatePriceRuleDto) {
    const rule = await this.svc.updatePriceRule(id, dto);
    return { data: rule };
  }

  @Get('rules')
  async listRules() {
    const rules = await this.svc.listPriceRules();
    return { data: rules };
  }

  @Post('rules/:id/toggle')
  async toggleRule(@Param('id') id: string) {
    const rule = await this.svc.togglePriceRule(id);
    return { data: rule };
  }

  @Post('preview')
  async previewRule(@Body() dto: PreviewPriceRuleDto) {
    const result = await this.svc.previewPriceRule(dto);
    return { data: result };
  }
}
