import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PromotionsService } from './promotions.service';
import { PricingQueryDto } from './dto/price-rule.dto';

@ApiTags('promotions-public')
@Controller('pricing')
export class PromotionsPublicController {
  constructor(private svc: PromotionsService) {}

  @Get('variant')
  async getVariantPrice(@Query() query: PricingQueryDto) {
    const result = await this.svc.calculateEffectivePrice(query);
    return { data: result };
  }
}
