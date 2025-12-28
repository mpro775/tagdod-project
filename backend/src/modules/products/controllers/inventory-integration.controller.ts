// src/inventory/inventory-integration.controller.ts
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { InventoryIntegrationService } from '../services/inventory-integration.service';

@Controller('inventory/integration')
export class InventoryIntegrationController {
  constructor(private integrationService: InventoryIntegrationService) { }

  // 1. استقبال الدفعات من السكربت المحلي
  @Post('sync-batch')
  async syncBatch(@Body() body: { items: any[] }) {
    return this.integrationService.processBatchPayload(body.items);
  }

  // 2. بيانات لوحة التحكم (الداشبورد)
  @Get('dashboard')
  async getDashboard() {
    return this.integrationService.getIntegrationDashboardStats();
  }

  // 3. قائمة المنتجات غير المربوطة (فرص الإضافة)
  @Get('unlinked')
  async getUnlinkedItems(@Query('limit') limit: number, @Query('page') page: number) {
    return this.integrationService.getUnlinkedOpportunities(Number(limit) || 50, Number(page) || 1);
  }
  @Get('linked')
  async getLinkedProducts(@Query('limit') limit: number, @Query('page') page: number) {
    return this.integrationService.getLinkedProducts(Number(limit) || 50, Number(page) || 1);
  }
  // 4. فحص SKU سريع (عند تعبئة الفورم)
  @Get('check-sku/:sku')
  async checkSku(@Param('sku') sku: string) {
    return this.integrationService.checkSkuStatus(sku);
  }
}