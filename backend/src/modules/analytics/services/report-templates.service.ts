import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ReportTemplate, ReportTemplateDocument } from '../schemas/report-template.schema';
import { CreateReportTemplateDto, UpdateReportTemplateDto } from '../dto/report-builder.dto';

@Injectable()
export class ReportTemplatesService {
  constructor(
    @InjectModel(ReportTemplate.name)
    private reportTemplateModel: Model<ReportTemplateDocument>,
  ) {}

  async findAll(category?: string): Promise<ReportTemplateDocument[]> {
    const query: Record<string, unknown> = {};
    if (category) query.category = category;
    return this.reportTemplateModel.find(query).sort({ category: 1, name: 1 }).exec();
  }

  async findByKey(key: string): Promise<ReportTemplateDocument> {
    const template = await this.reportTemplateModel.findOne({ key }).exec();
    if (!template) {
      throw new NotFoundException(`Report template "${key}" not found`);
    }
    return template;
  }

  async create(dto: CreateReportTemplateDto): Promise<ReportTemplateDocument> {
    const existing = await this.reportTemplateModel.findOne({ key: dto.key }).exec();
    if (existing) {
      throw new Error(`Template with key "${dto.key}" already exists`);
    }
    const template = new this.reportTemplateModel(dto);
    return template.save();
  }

  async update(key: string, dto: UpdateReportTemplateDto): Promise<ReportTemplateDocument> {
    const template = await this.reportTemplateModel.findOneAndUpdate(
      { key },
      { $set: dto },
      { new: true, runValidators: true },
    ).exec();
    if (!template) {
      throw new NotFoundException(`Report template "${key}" not found`);
    }
    return template;
  }

  async delete(key: string): Promise<void> {
    const result = await this.reportTemplateModel.deleteOne({ key }).exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException(`Report template "${key}" not found`);
    }
  }

  async incrementUsage(key: string): Promise<void> {
    await this.reportTemplateModel.updateOne(
      { key },
      { $inc: { usageCount: 1 } },
    ).exec();
  }

  async seedDefaultTemplates(): Promise<void> {
    const count = await this.reportTemplateModel.countDocuments();
    if (count > 0) return;

    const templates: CreateReportTemplateDto[] = [
      {
        key: 'sales_report',
        name: 'تقرير المبيعات',
        nameEn: 'Sales Report',
        description: 'تحليل شامل للمبيعات والإيرادات',
        descriptionEn: 'Comprehensive sales and revenue analysis',
        category: 'sales',
        availableSections: ['summary', 'kpis', 'salesTrend', 'topProducts', 'salesByCategory', 'salesByRegion', 'paymentMethods', 'recommendations'],
        availableMetrics: ['totalSales', 'totalOrders', 'totalRevenue', 'averageOrderValue', 'netRevenue', 'totalDiscount', 'growthRate'],
        availableCharts: ['line', 'bar', 'pie', 'area'],
        availableFilters: ['dateRange', 'categories', 'brands', 'regions', 'paymentMethods', 'orderStatus'],
        defaultSections: ['summary', 'kpis', 'salesTrend', 'topProducts', 'salesByCategory', 'recommendations'],
        defaultMetrics: ['totalSales', 'totalOrders', 'totalRevenue', 'averageOrderValue'],
        defaultCharts: ['line', 'bar', 'pie'],

      },
      {
        key: 'orders_report',
        name: 'تقرير الطلبات',
        nameEn: 'Orders Report',
        description: 'تحليل شامل للطلبات وأدائها',
        descriptionEn: 'Comprehensive orders analysis',
        category: 'orders',
        availableSections: ['summary', 'kpis', 'ordersTrend', 'ordersByStatus', 'ordersBySource', 'fulfillment', 'cancellations', 'recommendations'],
        availableMetrics: ['totalOrders', 'completedOrders', 'pendingOrders', 'cancelledOrders', 'averageProcessingTime', 'cancellationRate'],
        availableCharts: ['line', 'bar', 'pie', 'doughnut'],
        availableFilters: ['dateRange', 'orderStatus', 'paymentStatus', 'orderSource', 'deliveryCity'],
        defaultSections: ['summary', 'kpis', 'ordersTrend', 'ordersByStatus', 'recommendations'],
        defaultMetrics: ['totalOrders', 'completedOrders', 'pendingOrders', 'cancelledOrders'],
        defaultCharts: ['line', 'pie', 'bar'],

      },
      {
        key: 'products_report',
        name: 'تقرير المنتجات',
        nameEn: 'Products Report',
        description: 'تحليل أداء المنتجات والمخزون',
        descriptionEn: 'Product performance and inventory analysis',
        category: 'products',
        availableSections: ['summary', 'kpis', 'topPerformers', 'underPerformers', 'categoryBreakdown', 'brandBreakdown', 'inventoryValue', 'recommendations'],
        availableMetrics: ['totalProducts', 'activeProducts', 'outOfStock', 'lowStock', 'inventoryValue', 'averageRating'],
        availableCharts: ['bar', 'pie', 'table'],
        availableFilters: ['dateRange', 'categories', 'brands', 'stockStatus', 'priceRange'],
        defaultSections: ['summary', 'kpis', 'topPerformers', 'underPerformers', 'categoryBreakdown', 'recommendations'],
        defaultMetrics: ['totalProducts', 'activeProducts', 'outOfStock', 'lowStock'],
        defaultCharts: ['bar', 'pie'],

      },
      {
        key: 'customers_report',
        name: 'تقرير العملاء',
        nameEn: 'Customers Report',
        description: 'تحليل سلوك العملاء وشرائحهم',
        descriptionEn: 'Customer behavior and segmentation analysis',
        category: 'customers',
        availableSections: ['summary', 'kpis', 'customerSegments', 'topCustomers', 'newVsReturning', 'churnAnalysis', 'lifetimeValue', 'recommendations'],
        availableMetrics: ['totalCustomers', 'newCustomers', 'activeCustomers', 'returningCustomers', 'retentionRate', 'averageLifetimeValue', 'churnRate'],
        availableCharts: ['pie', 'bar', 'line', 'scatter'],
        availableFilters: ['dateRange', 'customerType', 'region', 'segment', 'accountType'],
        defaultSections: ['summary', 'kpis', 'customerSegments', 'topCustomers', 'newVsReturning', 'recommendations'],
        defaultMetrics: ['totalCustomers', 'newCustomers', 'retentionRate', 'averageLifetimeValue'],
        defaultCharts: ['pie', 'bar', 'line'],

      },
      {
        key: 'inventory_report',
        name: 'تقرير المخزون',
        nameEn: 'Inventory Report',
        description: 'تحليل المخزون والتنبيهات',
        descriptionEn: 'Inventory analysis and alerts',
        category: 'inventory',
        availableSections: ['summary', 'kpis', 'stockLevels', 'lowStockAlerts', 'outOfStockAlerts', 'categoryBreakdown', 'turnoverRate', 'recommendations'],
        availableMetrics: ['totalProducts', 'inStock', 'lowStock', 'outOfStock', 'inventoryValue', 'turnoverRate', 'stockoutRate'],
        availableCharts: ['bar', 'pie', 'table'],
        availableFilters: ['categories', 'brands', 'stockStatus', 'warehouse'],
        defaultSections: ['summary', 'kpis', 'stockLevels', 'lowStockAlerts', 'outOfStockAlerts', 'recommendations'],
        defaultMetrics: ['totalProducts', 'lowStock', 'outOfStock', 'inventoryValue'],
        defaultCharts: ['bar', 'pie'],

      },
      {
        key: 'financial_report',
        name: 'التقرير المالي',
        nameEn: 'Financial Report',
        description: 'تحليل مالي شامل للإيرادات والمصروفات',
        descriptionEn: 'Comprehensive financial analysis',
        category: 'financial',
        availableSections: ['summary', 'kpis', 'revenueBreakdown', 'profitAnalysis', 'cashFlow', 'projections', 'recommendations'],
        availableMetrics: ['grossRevenue', 'netRevenue', 'grossProfit', 'grossMargin', 'totalCosts', 'totalDiscounts', 'totalRefunds'],
        availableCharts: ['line', 'bar', 'area', 'pie'],
        availableFilters: ['dateRange', 'currency', 'revenueChannel', 'groupBy'],
        defaultSections: ['summary', 'kpis', 'revenueBreakdown', 'profitAnalysis', 'cashFlow', 'recommendations'],
        defaultMetrics: ['grossRevenue', 'netRevenue', 'grossProfit', 'grossMargin'],
        defaultCharts: ['line', 'bar', 'area'],

      },
      {
        key: 'marketing_report',
        name: 'تقرير التسويق',
        nameEn: 'Marketing Report',
        description: 'تحليل أداء الحملات التسويقية والكوبونات',
        descriptionEn: 'Marketing campaigns and coupons analysis',
        category: 'marketing',
        availableSections: ['summary', 'kpis', 'campaignPerformance', 'couponAnalysis', 'trafficSources', 'emailMarketing', 'recommendations'],
        availableMetrics: ['totalCampaigns', 'activeCampaigns', 'totalCouponsUsed', 'conversionRate', 'roi', 'totalDiscountGiven'],
        availableCharts: ['bar', 'line', 'pie'],
        availableFilters: ['dateRange', 'campaignType', 'couponStatus'],
        defaultSections: ['summary', 'kpis', 'campaignPerformance', 'couponAnalysis', 'recommendations'],
        defaultMetrics: ['totalCampaigns', 'totalCouponsUsed', 'conversionRate', 'roi'],
        defaultCharts: ['bar', 'line', 'pie'],

      },
      {
        key: 'support_report',
        name: 'تقرير الدعم',
        nameEn: 'Support Report',
        description: 'تحليل أداء الدعم الفني والتذاكر',
        descriptionEn: 'Support performance and tickets analysis',
        category: 'support',
        availableSections: ['summary', 'kpis', 'ticketsByStatus', 'ticketsByPriority', 'resolutionTime', 'satisfaction', 'recommendations'],
        availableMetrics: ['totalTickets', 'openTickets', 'resolvedTickets', 'averageResolutionTime', 'customerSatisfaction'],
        availableCharts: ['bar', 'pie', 'line'],
        availableFilters: ['dateRange', 'ticketStatus', 'ticketPriority', 'category'],
        defaultSections: ['summary', 'kpis', 'ticketsByStatus', 'resolutionTime', 'satisfaction', 'recommendations'],
        defaultMetrics: ['totalTickets', 'resolvedTickets', 'averageResolutionTime', 'customerSatisfaction'],
        defaultCharts: ['bar', 'pie', 'line'],

      },
      {
        key: 'system_report',
        name: 'تقرير النظام',
        nameEn: 'System Report',
        description: 'تحليل أداء النظام والصحة العامة',
        descriptionEn: 'System performance and health analysis',
        category: 'system',
        availableSections: ['summary', 'kpis', 'apiPerformance', 'errorRates', 'resourceUsage', 'uptime', 'recommendations'],
        availableMetrics: ['apiResponseTime', 'errorRate', 'uptime', 'cpuUsage', 'memoryUsage', 'diskUsage'],
        availableCharts: ['line', 'area', 'gauge'],
        availableFilters: ['dateRange', 'metricType'],
        defaultSections: ['summary', 'kpis', 'apiPerformance', 'errorRates', 'resourceUsage', 'recommendations'],
        defaultMetrics: ['apiResponseTime', 'errorRate', 'uptime'],
        defaultCharts: ['line', 'area'],

      },
      {
        key: 'custom_report',
        name: 'تقرير مخصص',
        nameEn: 'Custom Report',
        description: 'إنشاء تقرير مخصص بالكامل',
        descriptionEn: 'Create a fully custom report',
        category: 'custom',
        availableSections: ['summary', 'kpis', 'salesTrend', 'topProducts', 'customerSegments', 'inventory', 'financial', 'recommendations'],
        availableMetrics: ['totalSales', 'totalOrders', 'totalRevenue', 'totalCustomers', 'totalProducts', 'grossProfit'],
        availableCharts: ['line', 'bar', 'pie', 'area', 'table'],
        availableFilters: ['dateRange', 'categories', 'brands', 'regions', 'status', 'custom'],
        defaultSections: ['summary', 'kpis', 'recommendations'],
        defaultMetrics: ['totalSales', 'totalOrders', 'totalRevenue'],
        defaultCharts: ['line', 'bar'],

      },
    ];

    for (const template of templates) {
      const existing = await this.reportTemplateModel.findOne({ key: template.key }).exec();
      if (!existing) {
        await this.reportTemplateModel.create(template);
      }
    }
  }
}
