import { Body, Controller, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { UserRole } from '../users/schemas/user.schema';
import { AdminGuard } from '../../shared/guards/admin.guard';
import { RequirePermissions } from '../../shared/decorators/permissions.decorator';
import { AdminPermission } from '../../shared/constants/permissions';
import { CreateTejoPromptDto, UpdateTejoPromptDto } from './dto/tejo-prompt.dto';
import {
  CreateTejoKnowledgeDto,
  ListTejoKnowledgeQueryDto,
  UpdateTejoKnowledgeDto,
} from './dto/tejo-knowledge.dto';
import { TejoReindexDto, TejoReindexScope } from './dto/tejo-reindex.dto';
import { UpdateTejoSettingsDto } from './dto/tejo-settings.dto';
import { TejoPromptService } from './tejo-prompt.service';
import { TejoAnalyticsService } from './tejo-analytics.service';
import { TejoQueueService } from './queue/tejo-queue.service';
import { TejoSettingsService } from './tejo-settings.service';
import { TejoKnowledgeService } from './tejo-knowledge.service';
import { TejoLlmRouterService } from './adapters/tejo-llm-router.service';
import { TejoVectorStoreService } from './tejo-vector-store.service';

interface RequestWithUser {
  user: {
    sub: string;
  };
}

@ApiTags('admin-tejo')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, AdminGuard)
@Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
@Controller('admin/tejo')
export class TejoAdminController {
  constructor(
    private readonly promptService: TejoPromptService,
    private readonly analyticsService: TejoAnalyticsService,
    private readonly queueService: TejoQueueService,
    private readonly settingsService: TejoSettingsService,
    private readonly knowledgeService: TejoKnowledgeService,
    private readonly llmRouterService: TejoLlmRouterService,
    private readonly vectorStore: TejoVectorStoreService,
  ) {}

  @Get('prompts')
  @RequirePermissions(AdminPermission.TEJO_READ, AdminPermission.ADMIN_ACCESS)
  @ApiOperation({ summary: 'List Tejo prompts' })
  async listPrompts() {
    return this.promptService.listPrompts();
  }

  @Post('prompts')
  @RequirePermissions(AdminPermission.TEJO_MANAGE, AdminPermission.ADMIN_ACCESS)
  @ApiOperation({ summary: 'Create Tejo prompt' })
  async createPrompt(@Req() req: RequestWithUser, @Body() dto: CreateTejoPromptDto) {
    return this.promptService.createPrompt(dto, req.user.sub);
  }

  @Patch('prompts/:id')
  @RequirePermissions(AdminPermission.TEJO_MANAGE, AdminPermission.ADMIN_ACCESS)
  @ApiOperation({ summary: 'Update Tejo prompt' })
  async updatePrompt(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateTejoPromptDto,
  ) {
    return this.promptService.updatePrompt(id, dto, req.user.sub);
  }

  @Get('knowledge')
  @RequirePermissions(AdminPermission.TEJO_READ, AdminPermission.ADMIN_ACCESS)
  @ApiOperation({ summary: 'List Tejo knowledge base entries' })
  async listKnowledge(@Query() query: ListTejoKnowledgeQueryDto) {
    return this.knowledgeService.listKnowledge(query.page, query.limit, query.q);
  }

  @Get('knowledge/:key')
  @RequirePermissions(AdminPermission.TEJO_READ, AdminPermission.ADMIN_ACCESS)
  @ApiOperation({ summary: 'Get Tejo knowledge entry by key' })
  async getKnowledgeByKey(@Param('key') key: string) {
    return this.knowledgeService.getKnowledgeByKey(key);
  }

  @Post('knowledge')
  @RequirePermissions(AdminPermission.TEJO_MANAGE, AdminPermission.ADMIN_ACCESS)
  @ApiOperation({ summary: 'Create Tejo knowledge entry' })
  async createKnowledge(@Req() req: RequestWithUser, @Body() dto: CreateTejoKnowledgeDto) {
    return this.knowledgeService.createKnowledge(dto, req.user.sub);
  }

  @Patch('knowledge/:key')
  @RequirePermissions(AdminPermission.TEJO_MANAGE, AdminPermission.ADMIN_ACCESS)
  @ApiOperation({ summary: 'Update Tejo knowledge entry' })
  async updateKnowledge(
    @Req() req: RequestWithUser,
    @Param('key') key: string,
    @Body() dto: UpdateTejoKnowledgeDto,
  ) {
    return this.knowledgeService.updateKnowledge(key, dto, req.user.sub);
  }

  @Post('knowledge/:key/delete')
  @RequirePermissions(AdminPermission.TEJO_MANAGE, AdminPermission.ADMIN_ACCESS)
  @ApiOperation({ summary: 'Delete Tejo knowledge entry' })
  async deleteKnowledge(@Param('key') key: string) {
    return this.knowledgeService.deleteKnowledge(key);
  }

  @Post('reindex')
  @RequirePermissions(AdminPermission.TEJO_MANAGE, AdminPermission.ADMIN_ACCESS)
  @ApiOperation({ summary: 'Start embeddings reindex job' })
  async reindex(@Req() req: RequestWithUser, @Body() dto: TejoReindexDto) {
    const job = await this.queueService.enqueueReindex({
      scope: dto.scope || TejoReindexScope.ALL,
      full: dto.full || false,
      reason: dto.reason,
      triggeredBy: req.user.sub,
    });

    return {
      jobId: job.id,
      scope: dto.scope || TejoReindexScope.ALL,
      full: dto.full || false,
    };
  }

  @Get('analytics/overview')
  @RequirePermissions(AdminPermission.TEJO_ANALYTICS, AdminPermission.ADMIN_ACCESS)
  @ApiOperation({ summary: 'Get Tejo analytics summary' })
  async analyticsOverview() {
    return this.analyticsService.getSummary();
  }

  @Get('analytics/quality')
  @RequirePermissions(AdminPermission.TEJO_ANALYTICS, AdminPermission.ADMIN_ACCESS)
  @ApiOperation({ summary: 'Get quality metrics' })
  async analyticsQuality() {
    const summary = await this.analyticsService.getSummary();
    return {
      avgConfidence: summary.avgConfidence,
      successRate: summary.successRate,
      handoffRate: summary.handoffRate,
      errorRate: summary.errorRate,
      confidenceDistribution: summary.confidenceDistribution,
    };
  }

  @Get('analytics/volume')
  @RequirePermissions(AdminPermission.TEJO_ANALYTICS, AdminPermission.ADMIN_ACCESS)
  @ApiOperation({ summary: 'Get volume metrics' })
  async analyticsVolume() {
    const summary = await this.analyticsService.getSummary();
    return {
      totalQueries: summary.totalQueries,
      handoffCount: summary.handoffCount,
      avgLatencyMs: summary.avgLatencyMs,
      latencyP50Ms: summary.latencyP50Ms,
      latencyP95Ms: summary.latencyP95Ms,
      deflectionRate: summary.deflectionRate,
    };
  }

  @Get('conversations')
  @RequirePermissions(AdminPermission.TEJO_READ, AdminPermission.ADMIN_ACCESS)
  @ApiOperation({ summary: 'List Tejo conversations' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'limit', required: false })
  async listConversations(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.analyticsService.listConversations(Number(page), Number(limit));
  }

  @Get('conversations/:id')
  @RequirePermissions(AdminPermission.TEJO_READ, AdminPermission.ADMIN_ACCESS)
  @ApiOperation({ summary: 'Get Tejo conversation details' })
  async getConversationById(@Param('id') id: string) {
    return this.analyticsService.getConversationById(id);
  }

  @Get('settings')
  @RequirePermissions(AdminPermission.TEJO_READ, AdminPermission.ADMIN_ACCESS)
  @ApiOperation({ summary: 'Get Tejo settings snapshot' })
  async getSettings() {
    const [settings, queueStats] = await Promise.all([
      this.settingsService.getSettingsSnapshot(),
      this.queueService.getQueueStats(),
    ]);

    return {
      ...settings,
      queue: queueStats,
    };
  }

  @Patch('settings')
  @RequirePermissions(AdminPermission.TEJO_MANAGE, AdminPermission.ADMIN_ACCESS)
  @ApiOperation({ summary: 'Update Tejo settings' })
  async updateSettings(@Req() req: RequestWithUser, @Body() dto: UpdateTejoSettingsDto) {
    await this.settingsService.updateSettings(req.user.sub, {
      enabled: dto.enabled,
      webPilotEnabled: dto.webPilotEnabled,
      providerOrder: dto.providerOrder,
      chatProviderOrder: dto.chatProviderOrder,
      embeddingProviderOrder: dto.embeddingProviderOrder,
      threshold: dto.threshold,
      tenantId: dto.tenantId,
      geminiApiKey: dto.geminiApiKey,
      geminiChatModel: dto.geminiChatModel,
      geminiEmbeddingModel: dto.geminiEmbeddingModel,
      geminiBaseUrl: dto.geminiBaseUrl,
      retrievalTopK: dto.retrievalTopK,
      retrievalMinScore: dto.retrievalMinScore,
      contextMaxChars: dto.contextMaxChars,
      includeProducts: dto.includeProducts,
      includeKb: dto.includeKb,
    });

    return this.settingsService.getSettingsSnapshot();
  }

  @Post('settings/test-gemini')
  @RequirePermissions(AdminPermission.TEJO_MANAGE, AdminPermission.ADMIN_ACCESS)
  @ApiOperation({ summary: 'Test Gemini chat provider' })
  async testGemini() {
    const startedAt = Date.now();
    const result = await this.llmRouterService.chat({
      locale: 'ar',
      messages: [
        { role: 'system', content: 'Reply with a short health-check response.' },
        { role: 'user', content: 'اختبار Tejo Gemini' },
      ],
    });

    return {
      status: 'OK',
      provider: result.provider,
      model: result.response.model,
      latencyMs: Date.now() - startedAt,
    };
  }

  @Post('settings/test-embedding')
  @RequirePermissions(AdminPermission.TEJO_MANAGE, AdminPermission.ADMIN_ACCESS)
  @ApiOperation({ summary: 'Test embedding provider' })
  async testEmbedding() {
    const startedAt = Date.now();
    const result = await this.llmRouterService.embed({
      texts: ['اختبار توليد المتجهات'],
    });
    const vector = result.response.vectors[0] || [];

    return {
      status: 'OK',
      provider: result.provider,
      model: result.response.model,
      dimension: vector.length,
      latencyMs: Date.now() - startedAt,
    };
  }

  @Post('settings/test-qdrant')
  @RequirePermissions(AdminPermission.TEJO_MANAGE, AdminPermission.ADMIN_ACCESS)
  @ApiOperation({ summary: 'Test Qdrant vector store' })
  async testQdrant() {
    const startedAt = Date.now();
    const status = await this.vectorStore.getCollectionStatus();

    return {
      status: 'OK',
      ...status,
      latencyMs: Date.now() - startedAt,
    };
  }

  @Post('settings/test-retrieval')
  @RequirePermissions(AdminPermission.TEJO_MANAGE, AdminPermission.ADMIN_ACCESS)
  @ApiOperation({ summary: 'Test full Tejo retrieval path' })
  async testRetrieval(@Body() body: { question?: string } = {}) {
    const question = body.question?.trim() || 'كيف يتم توزيع طلبات الصيانة؟';
    const tenantId = await this.settingsService.getTenantId();
    const retrieval = await this.settingsService.getRetrievalSettings();
    const startedAt = Date.now();

    const embedding = await this.llmRouterService.embed({ texts: [question] });
    const vector = embedding.response.vectors[0] || [];
    const results = await this.vectorStore.search({
      tenantId,
      vector,
      limit: retrieval.topK,
    });

    return {
      status: 'OK',
      question,
      provider: embedding.provider,
      model: embedding.response.model,
      dimension: vector.length,
      latencyMs: Date.now() - startedAt,
      results: results
        .filter((item) => item.score >= retrieval.minScore)
        .map((item) => ({
          score: item.score,
          sourceType: item.payload.sourceType,
          sourceId: item.payload.sourceId,
          text: String(item.payload.text || '').slice(0, 500),
        })),
    };
  }

  @Post('settings/rebuild-qdrant')
  @RequirePermissions(AdminPermission.TEJO_MANAGE, AdminPermission.ADMIN_ACCESS)
  @ApiOperation({ summary: 'Clear and rebuild Qdrant collection' })
  async rebuildQdrant() {
    await this.vectorStore.rebuildCollection();
    return this.vectorStore.getCollectionStatus();
  }
}
