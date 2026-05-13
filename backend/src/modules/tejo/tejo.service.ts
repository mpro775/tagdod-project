import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SearchService } from '../search/search.service';
import { ProductSortBy, SortOrder } from '../search/dto/search.dto';
import { SupportService } from '../support/support.service';
import { MessageType } from '../support/schemas/support-message.schema';
import {
  SupportAiStatus,
  SupportCategory,
  SupportChannel,
  SupportPriority,
  SupportStatus,
  SupportTicketSource,
} from '../support/schemas/support-ticket.schema';
import { TejoQueryDto } from './dto/tejo-query.dto';
import { TejoConversation, TejoConversationDocument } from './schemas/tejo-conversation.schema';
import { TejoKbEmbedding, TejoKbEmbeddingDocument } from './schemas/tejo-kb-embedding.schema';
import {
  TejoProductEmbedding,
  TejoProductEmbeddingDocument,
} from './schemas/tejo-product-embedding.schema';
import { TejoSession, TejoSessionDocument, TejoSessionStatus } from './schemas/tejo-session.schema';
import { TejoMessage, TejoMessageRole } from './schemas/tejo-message.schema';
import { TejoPromptService } from './tejo-prompt.service';
import { TejoSettingsService } from './tejo-settings.service';
import { TejoSessionService } from './tejo-session.service';
import { TejoMessageService } from './tejo-message.service';
import { TejoAction, TejoCard, TejoIntent, TejoQueryResponse } from './tejo.types';
import { TejoLlmRouterService } from './adapters/tejo-llm-router.service';
import { TejoVectorStoreService } from './tejo-vector-store.service';

interface ProductCandidate {
  id?: string;
  _id?: string;
  name?: string;
  nameEn?: string;
  title?: string;
  mainImageUrl?: string;
  image?: string;
  relevanceScore?: number;
  rating?: number;
  isFeatured?: boolean;
  priceRangeByCurrency?: Record<string, { minPrice?: number; maxPrice?: number }>;
  discountedPriceByCurrency?: Record<string, number>;
  priceByCurrency?: Record<string, number>;
}

interface RetrievalResult {
  products: ProductCandidate[];
  cards: TejoCard[];
  knowledgeSnippets: string[];
  retrievalFailed: boolean;
  lexicalCount: number;
  vectorMatchedCount: number;
}

export interface KnowledgeRetrievalHit {
  score?: number;
  sourceType: 'kb';
  sourceId: string;
  text: string;
}

export interface TejoRetrievalTestResult {
  status: 'OK';
  question: string;
  provider: string;
  model: string;
  dimension: number;
  latencyMs: number;
  vectorResults: KnowledgeRetrievalHit[];
  lexicalResults: KnowledgeRetrievalHit[];
  results: KnowledgeRetrievalHit[];
}

@Injectable()
export class TejoService {
  private readonly logger = new Logger(TejoService.name);

  constructor(
    private readonly supportService: SupportService,
    private readonly searchService: SearchService,
    private readonly promptService: TejoPromptService,
    private readonly settingsService: TejoSettingsService,
    private readonly llmRouterService: TejoLlmRouterService,
    private readonly vectorStore: TejoVectorStoreService,
    private readonly sessionService: TejoSessionService,
    private readonly messageService: TejoMessageService,
    @InjectModel(TejoConversation.name)
    private readonly conversationModel: Model<TejoConversationDocument>,
    @InjectModel(TejoProductEmbedding.name)
    private readonly productEmbeddingModel: Model<TejoProductEmbeddingDocument>,
    @InjectModel(TejoKbEmbedding.name)
    private readonly kbEmbeddingModel: Model<TejoKbEmbeddingDocument>,
  ) {}

  async handleQuery(userId: string, dto: TejoQueryDto): Promise<TejoQueryResponse> {
    const startedAt = Date.now();
    const traceId = this.createTraceId();
    const locale = (dto.locale || 'ar').toLowerCase();
    const isArabic = locale.startsWith('ar');

    const enabled = await this.settingsService.isTejoEnabled();
    if (!enabled) {
      throw new ForbiddenException('Tejo is disabled');
    }

    const webPilotEnabled = await this.settingsService.isWebPilotEnabled();
    if (dto.channel === SupportChannel.WEB && !webPilotEnabled) {
      throw new ForbiddenException('Tejo web pilot is currently disabled');
    }

    let sessionId = dto.context?.sessionId as string | undefined;
    let session: TejoSessionDocument | null = null;

    if (sessionId) {
      session = await this.sessionService.findById(sessionId);
      if (!session || session.userId !== userId) {
        session = null;
        sessionId = undefined;
      }
    }

    if (!session) {
      session = await this.sessionService.findByUserId(userId, dto.channel);
    }

    if (!session) {
      session = await this.sessionService.create({
        userId,
        channel: dto.channel,
        locale,
        storefrontHost: dto.context?.storefrontHost as string | undefined,
      });
    }

    sessionId = session._id.toString();

    if (session.status === TejoSessionStatus.ESCALATED && session.supportTicketId) {
      return this.handleEscalatedSession(session, dto, traceId, locale, isArabic);
    }

    await this.messageService.create({
      sessionId,
      userId,
      role: TejoMessageRole.USER,
      content: dto.message,
      metadata: { traceId, locale },
    });

    await this.sessionService.incrementMessageCount(sessionId);

    const intent = this.detectIntent(dto.message);
    const entities = this.extractEntities(dto.message);
    const retrieval = await this.retrieveContext(dto.message, locale, isArabic);
    const cards = retrieval.cards;

    const activePrompt = await this.promptService.getActivePrompt();
    const promptBody = activePrompt?.body || this.defaultSystemPrompt(isArabic);

    const { response: modelResponse, provider } = await this.llmRouterService.chat({
      locale,
      modelHint: activePrompt?.modelHint,
      messages: [
        {
          role: 'system',
          content: this.assembleSystemPrompt(
            promptBody,
            intent,
            entities,
            cards,
            retrieval.knowledgeSnippets,
            locale,
          ),
        },
        {
          role: 'user',
          content: dto.message,
        },
      ],
    });

    let confidence = Number((modelResponse.confidence || 0.5).toFixed(4));
    if (cards.length > 0) {
      confidence = Math.min(1, Number((confidence + 0.08).toFixed(4)));
    }

    const threshold = await this.settingsService.getHandoffThreshold();
    if (retrieval.retrievalFailed) {
      confidence = Math.min(confidence, Math.max(0, threshold - 0.05));
    }

    const handoffRequestedByIntent = intent === 'human_handoff';
    const internalVerificationRequired = this.requiresInternalVerification(dto.message);
    const previousRetrievalFailures = retrieval.retrievalFailed
      ? await this.countPreviousRetrievalFailuresSession(sessionId)
      : 0;
    const repeatedRetrievalFailure = retrieval.retrievalFailed && previousRetrievalFailures >= 1;
    const handoffSuggested =
      handoffRequestedByIntent || internalVerificationRequired || repeatedRetrievalFailure;

    const suggestions =
      retrieval.retrievalFailed && !handoffSuggested
        ? this.buildNoKnowledgeSuggestions(isArabic)
        : this.buildSuggestions(intent, handoffSuggested, isArabic);
    const actions = this.buildActions(cards, handoffSuggested, isArabic);

    const finalReply = handoffSuggested
      ? this.buildHandoffReply(isArabic, handoffRequestedByIntent)
      : retrieval.retrievalFailed
        ? this.buildNoKnowledgeReply(isArabic)
        : modelResponse.outputText;

    const handoffReason = handoffSuggested
      ? this.buildHandoffReason(
          intent,
          confidence,
          threshold,
          retrieval.retrievalFailed,
          internalVerificationRequired,
          repeatedRetrievalFailure,
        )
      : undefined;

    const aiMessagePayload = {
      cards,
      suggestions,
      actions,
      knowledge: retrieval.knowledgeSnippets,
    };

    await this.messageService.create({
      sessionId,
      userId,
      role: TejoMessageRole.ASSISTANT,
      content: finalReply,
      metadata: {
        source: 'tejo',
        traceId,
        provider,
        model: modelResponse.model,
        confidence,
        intent,
        entities,
        threshold,
        retrievalFailed: retrieval.retrievalFailed,
        lexicalCount: retrieval.lexicalCount,
        vectorMatchedCount: retrieval.vectorMatchedCount,
        handoffSuggested,
        handoffReason,
      },
      payload: aiMessagePayload,
    });

    if (handoffSuggested && !handoffRequestedByIntent) {
      await this.sessionService.update(sessionId, {
        status: TejoSessionStatus.ESCALATION_SUGGESTED,
        handoffSuggested: true,
      });
    }

    const latencyMs = Date.now() - startedAt;

    await this.conversationModel.create({
      ticketId: sessionId,
      userId,
      userMessage: dto.message,
      reply: finalReply,
      intent,
      entities,
      confidence,
      handoffSuggested,
      handoffTriggered: false,
      latencyMs,
      provider,
      model: modelResponse.model,
      cards,
      suggestions,
      actions,
      metadata: {
        locale,
        traceId,
        sessionId,
        context: dto.context || {},
        retrieval: {
          retrievalFailed: retrieval.retrievalFailed,
          lexicalCount: retrieval.lexicalCount,
          vectorMatchedCount: retrieval.vectorMatchedCount,
          knowledgeCount: retrieval.knowledgeSnippets.length,
        },
      },
    });

    this.logger.log(
      `Tejo query completed traceId=${traceId} sessionId=${sessionId} confidence=${confidence.toFixed(
        3,
      )} handoff=${String(handoffSuggested)} latencyMs=${latencyMs}`,
    );

    return {
      reply: finalReply,
      cards,
      suggestions,
      actions,
      confidence,
      handoffSuggested,
      sessionId,
      ticketId: sessionId,
      messageId: `tejo-msg-${Date.now()}`,
      latencyMs,
      status: session.status,
    };
  }

  private async handleEscalatedSession(
    session: TejoSessionDocument,
    dto: TejoQueryDto,
    traceId: string,
    locale: string,
    isArabic: boolean,
  ): Promise<TejoQueryResponse> {
    const ticketId = session.supportTicketId!;

    await this.supportService.addMessage(ticketId, session.userId, {
      content: dto.message,
      metadata: {
        source: 'tejo_escalated',
        locale,
        traceId,
        ...dto.context,
      },
    });

    const reply = isArabic
      ? 'تم تحويل محادثتك لموظف دعم. سيتم الرد عليك قريبًا.'
      : 'Your conversation has been handed off to a support agent. You will receive a reply soon.';

    return {
      reply,
      cards: [],
      suggestions: [],
      actions: [],
      confidence: 0,
      handoffSuggested: false,
      sessionId: session._id.toString(),
      ticketId,
      messageId: `tejo-escalated-${Date.now()}`,
      latencyMs: 0,
      status: session.status,
    };
  }

  async triggerHandoff(sessionId: string, userId: string): Promise<{
    ticketId: string;
    sessionId: string;
    status: string;
  }> {
    const session = await this.sessionService.findById(sessionId);
    if (!session || session.userId !== userId) {
      throw new ForbiddenException('Session not found or unauthorized');
    }

    if (session.status === TejoSessionStatus.ESCALATED) {
      return {
        ticketId: session.supportTicketId!,
        sessionId,
        status: session.status,
      };
    }

    const messages = await this.messageService.findBySessionIdRecent(sessionId, 20);
    const recentMessages = messages.reverse();

    const conversationSummary = recentMessages
      .map((m) => `${m.role === 'user' ? 'User' : 'Tejo'}: ${m.content}`)
      .join('\n');

    const firstUserMessage = recentMessages.find((m) => m.role === 'user')?.content || 'تصعيد من تيجو';

    const ticket = await this.supportService.createTicket(userId, {
      title: `تصعيد من تيجو: ${firstUserMessage.slice(0, 50)}`,
      description: conversationSummary.slice(0, 2000),
      category: SupportCategory.OTHER,
      channel: session.channel as SupportChannel,
      source: SupportTicketSource.TEJO_HANDOFF,
      metadata: {
        sessionId,
        locale: session.locale,
      },
    });

    await this.supportService.updateTicketAiState(ticket._id.toString(), {
      isAiHandled: true,
      aiStatus: SupportAiStatus.HANDED_OFF,
    });

    await this.sessionService.update(sessionId, {
      status: TejoSessionStatus.ESCALATED,
      supportTicketId: ticket._id.toString(),
      handoffTriggered: true,
    });

    await this.supportService.addAutomatedMessage(ticket._id.toString(), {
      content: 'تم تصعيد هذه المحادثة من تيجو. سياق المحادثة موضح أعلاه.',
      messageType: MessageType.SYSTEM_MESSAGE,
      metadata: { sessionId },
    });

    this.logger.log(`Tejo handoff triggered sessionId=${sessionId} ticketId=${ticket._id}`);

    return {
      ticketId: ticket._id.toString(),
      sessionId,
      status: TejoSessionStatus.ESCALATED,
    };
  }

  async getSessionMessages(sessionId: string, userId: string, page = 1, limit = 50) {
    const session = await this.sessionService.findById(sessionId);
    if (!session || session.userId !== userId) {
      throw new ForbiddenException('Session not found or unauthorized');
    }

    return this.messageService.findBySessionId(sessionId, page, limit);
  }

  async getUserSessions(userId: string, page = 1, limit = 20) {
    return this.sessionService.findByUserIdPaginated(userId, page, limit);
  }

  private detectIntent(message: string): TejoIntent {
    const normalized = message.toLowerCase();

    if (
      /(human|agent|representative|موظف|بشري|إنسان|انسان|أكلم الدعم|اكلم الدعم|أكلم موظف|اكلم موظف|حولني لموظف|حوّلني لموظف|تواصل معي|اكلم شخص)/i.test(
        normalized,
      )
    ) {
      return 'human_handoff';
    }

    if (/(order|shipment|delivery|tracking|طلب|طلبي|طلبات|شحنة|شحن|توصيل|تتبع)/i.test(normalized)) {
      return 'order_help';
    }

    if (
      /(product|kit|battery|solar|inverter|panel|منتج|منتجات|بطارية|طاقة|انفرتر|لوح|ألواح|سعر|متوفر)/i.test(
        normalized,
      )
    ) {
      return 'product_search';
    }

    if (/(دفع|الدفع|حوالة|تحويل|استلام|كاش|payment|cash|transfer)/i.test(normalized)) {
      return 'general_support';
    }

    if (/(human|agent|representative|موظف|بشري|تواصل معي|تحويل|اكلم شخص)/i.test(normalized)) {
      return 'human_handoff';
    }

    if (/(order|shipment|delivery|tracking|طلب|شحنة|توصيل|تتبع)/i.test(normalized)) {
      return 'order_help';
    }

    if (
      /(product|kit|battery|solar|inverter|panel|منتج|بطارية|طاقة|انفرتر|لوح)/i.test(normalized)
    ) {
      return 'product_search';
    }

    return 'general_support';
  }

  private extractEntities(message: string): string[] {
    const tokens = message
      .split(/[\s,.;:\-!?()]+/)
      .map((token) => token.trim())
      .filter((token) => token.length > 2);

    return Array.from(new Set(tokens)).slice(0, 8);
  }

  private async retrieveContext(
    message: string,
    locale: string,
    isArabic: boolean,
  ): Promise<RetrievalResult> {
    const lang: 'ar' | 'en' = locale.startsWith('ar') ? 'ar' : 'en';
    const retrievalSettings = await this.settingsService.getRetrievalSettings();

    const lexicalResult = retrievalSettings.includeProducts
      ? await this.searchService.advancedProductSearch({
          q: message,
          lang,
          limit: 12,
          sortBy: ProductSortBy.RELEVANCE,
          sortOrder: SortOrder.DESC,
          status: 'active',
        })
      : { results: [] };

    const lexicalProducts = (
      Array.isArray(lexicalResult.results) ? lexicalResult.results : []
    ) as ProductCandidate[];

    const productIds = lexicalProducts
      .map((product) => this.getProductId(product))
      .filter((id): id is string => Boolean(id));

    let queryVector: number[] | null = null;
    try {
      const queryText = this.expandQueryForRetrieval(message, locale);
      const { response } = await this.llmRouterService.embed({ texts: [queryText] });
      queryVector = response.vectors[0] || null;
    } catch (error) {
      this.logger.warn(
        `Tejo embedding retrieval failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    const embeddingMap =
      queryVector && productIds.length > 0
        ? await this.getProductEmbeddingsMap(productIds)
        : new Map<string, number[]>();

    const rerankedProducts = this.rerankProducts(lexicalProducts, embeddingMap, queryVector);
    const topProducts = rerankedProducts.slice(0, 4);
    const cards = this.buildCards(topProducts, isArabic);

    const vectorMatchedCount = topProducts.reduce((count, product) => {
      const productId = this.getProductId(product);
      if (!productId) {
        return count;
      }

      return count + (embeddingMap.has(productId) ? 1 : 0);
    }, 0);

    const knowledgeResults = retrievalSettings.includeKb
      ? this.mergeKnowledgeHits(
          [
            ...(await this.retrieveKnowledgeHitsFromQdrant(
              queryVector,
              retrievalSettings.topK,
              retrievalSettings.minScore,
              retrievalSettings.contextMaxChars,
            )),
            ...(await this.retrieveKnowledgeLexical(
              message,
              locale,
              retrievalSettings.topK,
              retrievalSettings.contextMaxChars,
            )),
          ],
          retrievalSettings.topK,
          retrievalSettings.contextMaxChars,
        )
      : [];
    const knowledgeSnippets = knowledgeResults.map((item) => item.text);

    return {
      products: topProducts,
      cards,
      knowledgeSnippets,
      retrievalFailed: cards.length === 0 && knowledgeSnippets.length === 0,
      lexicalCount: lexicalProducts.length,
      vectorMatchedCount,
    };
  }

  private async getProductEmbeddingsMap(productIds: string[]): Promise<Map<string, number[]>> {
    if (productIds.length === 0) {
      return new Map<string, number[]>();
    }

    const rows = await this.productEmbeddingModel
      .find({ productId: { $in: productIds } })
      .select('productId vector')
      .lean();

    const map = new Map<string, number[]>();
    for (const row of rows) {
      const productId = String(row.productId || '');
      const vector = Array.isArray(row.vector) ? row.vector : [];
      if (productId && vector.length > 0) {
        map.set(productId, vector);
      }
    }

    return map;
  }

  private rerankProducts(
    products: ProductCandidate[],
    embeddingMap: Map<string, number[]>,
    queryVector: number[] | null,
  ): ProductCandidate[] {
    if (products.length === 0) {
      return [];
    }

    const denominator = Math.max(products.length, 1);
    const scored = products.map((product, index) => {
      const lexicalScore = 1 - index / denominator;
      const businessScore = this.computeBusinessScore(product);
      const productId = this.getProductId(product);
      const productVector = productId ? embeddingMap.get(productId) : undefined;
      const vectorScore =
        queryVector && productVector ? this.cosineSimilarity(queryVector, productVector) : 0;
      const finalScore = lexicalScore * 0.55 + vectorScore * 0.3 + businessScore * 0.15;

      return {
        product,
        score: finalScore,
      };
    });

    scored.sort((left, right) => right.score - left.score);
    return scored.map((item) => item.product);
  }

  private computeBusinessScore(product: ProductCandidate): number {
    const rating = this.toBounded(this.toFiniteNumber(product.rating) / 5, 0, 1);
    const featuredBoost = product.isFeatured ? 1 : 0;
    return this.toBounded(rating * 0.7 + featuredBoost * 0.3, 0, 1);
  }

  async testHybridRetrieval(question: string, locale = 'ar'): Promise<TejoRetrievalTestResult> {
    const retrievalSettings = await this.settingsService.getRetrievalSettings();
    const startedAt = Date.now();
    const queryText = this.expandQueryForRetrieval(question, locale);
    const embedding = await this.llmRouterService.embed({ texts: [queryText] });
    const vector = embedding.response.vectors[0] || [];

    const vectorResults = await this.retrieveKnowledgeHitsFromQdrant(
      vector,
      retrievalSettings.topK,
      retrievalSettings.minScore,
      retrievalSettings.contextMaxChars,
    );
    const lexicalResults = await this.retrieveKnowledgeLexical(
      question,
      locale,
      retrievalSettings.topK,
      retrievalSettings.contextMaxChars,
    );
    const results = this.mergeKnowledgeHits(
      [...vectorResults, ...lexicalResults],
      retrievalSettings.topK,
      retrievalSettings.contextMaxChars,
    );

    return {
      status: 'OK',
      question,
      provider: embedding.provider,
      model: embedding.response.model,
      dimension: vector.length,
      latencyMs: Date.now() - startedAt,
      vectorResults,
      lexicalResults,
      results,
    };
  }

  private async retrieveKnowledgeHitsFromQdrant(
    queryVector: number[] | null,
    limit: number,
    minScore: number,
    contextMaxChars: number,
  ): Promise<KnowledgeRetrievalHit[]> {
    if (!queryVector || queryVector.length === 0 || limit <= 0) {
      return [];
    }

    const tenantId = await this.settingsService.getTenantId();

    try {
      const results = await this.vectorStore.search({
        tenantId,
        vector: queryVector,
        limit,
        sourceType: 'kb',
      });

      return results
        .filter((item) => item.score >= minScore)
        .reduce<KnowledgeRetrievalHit[]>((hits, item) => {
          const text = String(item.payload.text || '').trim();
          if (!text) {
            return hits;
          }

          const usedChars = hits.reduce((total, hit) => total + hit.text.length, 0);
          if (usedChars >= contextMaxChars) {
            return hits;
          }

          hits.push({
            score: item.score,
            sourceType: 'kb',
            sourceId: String(item.payload.sourceId || item.payload.key || 'kb'),
            text: text.slice(0, Math.max(0, contextMaxChars - usedChars)),
          });
          return hits;
        }, []);
    } catch (error) {
      this.logger.warn(
        `Tejo Qdrant knowledge retrieval failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return [];
    }
  }

  private async retrieveKnowledgeLexical(
    message: string,
    locale: string,
    limit: number,
    contextMaxChars: number,
  ): Promise<KnowledgeRetrievalHit[]> {
    if (limit <= 0 || contextMaxChars <= 0) {
      return [];
    }

    const baseTerms = this.buildSearchTerms(message);
    const terms = this.expandTermsByIntent(message, baseTerms);

    if (!terms.length) {
      return [];
    }

    const regexes = terms.map((term) => new RegExp(this.escapeRegex(term), 'i'));
    const normalizedLocale = (locale || 'ar').toLowerCase();
    const localeRegex = new RegExp(`(^|,)${this.escapeRegex(normalizedLocale)}(,|$)`, 'i');

    const docs = (await this.kbEmbeddingModel
      .find({
        $and: [
          {
            $or: [
              { locale: normalizedLocale },
              { locale: 'ar' },
              { locale: 'ar,en' },
              { locale: localeRegex },
              { locale: '' },
              { locale: { $exists: false } },
            ],
          },
          {
            $or: [{ key: { $in: regexes } }, { text: { $in: regexes } }],
          },
        ],
      })
      .select('key text locale')
      .limit(limit * 4)
      .lean()) as Array<{ key?: unknown; text?: unknown; locale?: unknown }>;

    const hits: KnowledgeRetrievalHit[] = [];
    let usedChars = 0;

    for (const doc of docs) {
      const text = String(doc.text || '').trim();
      if (!text || hits.some((hit) => hit.text === text)) {
        continue;
      }

      if (usedChars >= contextMaxChars) {
        break;
      }

      const remaining = contextMaxChars - usedChars;
      const slice = text.slice(0, remaining);
      hits.push({
        sourceType: 'kb',
        sourceId: String(doc.key || 'kb'),
        text: slice,
      });
      usedChars += slice.length;
    }

    return hits.slice(0, limit);
  }

  private mergeKnowledgeHits(
    hits: KnowledgeRetrievalHit[],
    limit: number,
    contextMaxChars: number,
  ): KnowledgeRetrievalHit[] {
    const merged: KnowledgeRetrievalHit[] = [];
    const seen = new Set<string>();
    let usedChars = 0;

    for (const hit of hits) {
      const text = String(hit.text || '').trim();
      if (!text) {
        continue;
      }

      const textKey = this.normalizeForDedupe(text);
      const dedupeKey = `${hit.sourceId}:${textKey}`;
      if (seen.has(dedupeKey) || seen.has(textKey)) {
        continue;
      }

      if (usedChars >= contextMaxChars || merged.length >= limit) {
        break;
      }

      const remaining = contextMaxChars - usedChars;
      const nextHit = {
        ...hit,
        text: text.slice(0, remaining),
      };
      merged.push(nextHit);
      seen.add(dedupeKey);
      seen.add(textKey);
      usedChars += nextHit.text.length;
    }

    return merged;
  }

  private expandQueryForRetrieval(message: string, locale: string): string {
    const normalized = message.toLowerCase();
    const expansions: string[] = [message];

    const intentKeywords: Record<string, string[]> = {
      shipping: [
        'شحن',
        'الشحن',
        'توصيل',
        'التوصيل',
        'يوصل',
        'توصلوا',
        'ديليفري',
        'delivery',
        'shipping',
        'مدينة',
        'محافظة',
        'منطقة',
      ],
      warranty: [
        'ضمان',
        'الضمان',
        'كفالة',
        'استبدال',
        'استرجاع',
        'ترجيع',
        'refund',
        'return',
        'warranty',
      ],
      payment: [
        'دفع',
        'الدفع',
        'حوالة',
        'تحويل',
        'الدفع عند الاستلام',
        'كاش',
        'cash',
        'payment',
      ],
      order: ['طلب', 'طلبي', 'طلبات', 'حالة', 'تتبع', 'متابعة', 'order', 'tracking'],
      product: [
        'منتج',
        'منتجات',
        'سعر',
        'متوفر',
        'توفر',
        'بطارية',
        'ألواح',
        'لوح',
        'انفرتر',
        'طاقة',
        'product',
        'price',
      ],
      cart: [
        'سلة',
        'السلة',
        'إضافة',
        'اضافة',
        'حذف',
        'كمية',
        'شراء',
        'أشتري',
        'اشتري',
        'اطلب',
        'إتمام',
        'اتمام',
        'checkout',
        'cart',
      ],
      service: [
        'صيانة',
        'مهندس',
        'فني',
        'خدمة',
        'اصلاح',
        'إصلاح',
        'تركيب',
        'maintenance',
        'service',
      ],
      support: ['دعم', 'موظف', 'مساعدة', 'تواصل', 'support', 'agent'],
    };

    const hasAny = (words: string[]) =>
      words.some((word) => normalized.includes(word.toLowerCase()));

    if (hasAny(intentKeywords.shipping)) {
      expansions.push(
        'معلومات الشحن والتوصيل والمدن والمناطق والمحافظات المتاحة ومدة التوصيل وتكلفة الشحن',
      );
    }

    if (hasAny(intentKeywords.warranty)) {
      expansions.push('معلومات الضمان والكفالة والاستبدال والاسترجاع وسياسة المنتجات');
    }

    if (hasAny(intentKeywords.payment)) {
      expansions.push(
        'معلومات الدفع وطرق الدفع والدفع عند الاستلام والتحويل والحوالة وتأكيد الدفع',
      );
    }

    if (hasAny(intentKeywords.order)) {
      expansions.push('معلومات الطلبات وحالة الطلب وتتبع الطلب ومتابعة الطلب وتفاصيل الطلب');
    }

    if (hasAny(intentKeywords.product)) {
      expansions.push('معلومات المنتجات والأسعار والتوفر والتصنيفات والبراندات وتفاصيل المنتج');
    }

    if (hasAny(intentKeywords.cart)) {
      expansions.push('معلومات السلة وإضافة المنتجات وتعديل الكمية وحذف المنتجات وإتمام الشراء');
    }

    if (hasAny(intentKeywords.service)) {
      expansions.push(
        'معلومات خدمات الصيانة وطلب مهندس أو فني وإنشاء طلب خدمة واستقبال العروض وقبول عرض المهندس',
      );
    }

    if (hasAny(intentKeywords.support)) {
      expansions.push('معلومات الدعم الفني والتحويل إلى موظف بشري والتواصل مع فريق الدعم');
    }

    if (!locale.startsWith('ar')) {
      expansions.push('general knowledge base support policies products orders services');
    }

    return expansions.join('\n');
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private buildSearchTerms(message: string): string[] {
    const normalized = message
      .replace(/[؟?!.,،؛:()"'`]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();

    const stopWords = new Set([
      'هل',
      'في',
      'من',
      'على',
      'الى',
      'إلى',
      'عن',
      'كم',
      'ما',
      'ماذا',
      'كيف',
      'لديكم',
      'عندكم',
      'اريد',
      'أريد',
      'انا',
      'أنا',
      'هو',
      'هي',
      'هذا',
      'هذه',
      'ذلك',
      'توجد',
      'يوجد',
      'فيه',
      'فيها',
      'مع',
      'او',
      'أو',
      'do',
      'you',
      'have',
      'the',
      'is',
      'are',
      'how',
      'what',
    ]);

    const terms = normalized
      .split(' ')
      .map((token) => token.trim())
      .filter((token) => token.length >= 3)
      .filter((token) => !stopWords.has(token));

    return Array.from(new Set(terms)).slice(0, 15);
  }

  private expandTermsByIntent(message: string, terms: string[]): string[] {
    const normalized = message.toLowerCase();
    const expanded = new Set<string>(terms);

    const add = (...items: string[]) => {
      for (const item of items) {
        expanded.add(item);
      }
    };

    if (/شحن|توصيل|يوصل|توصل|توصلوا|ديليفري|delivery|shipping|مدينة|محافظة/i.test(normalized)) {
      add('شحن', 'الشحن', 'توصيل', 'التوصيل', 'محافظات', 'مدن', 'مناطق');
    }

    if (/ضمان|كفالة|استبدال|استرجاع|ترجيع|warranty|return|refund/i.test(normalized)) {
      add('ضمان', 'الضمان', 'كفالة', 'استبدال', 'استرجاع', 'ترجيع');
    }

    if (/دفع|الدفع|حوالة|تحويل|استلام|كاش|payment|cash/i.test(normalized)) {
      add('دفع', 'الدفع', 'حوالة', 'تحويل', 'استلام', 'الدفع عند الاستلام');
    }

    if (/طلب|طلبي|طلبات|حالة|تتبع|متابعة|order|tracking/i.test(normalized)) {
      add('طلب', 'طلبات', 'حالة الطلب', 'تتبع', 'متابعة');
    }

    if (/منتج|منتجات|سعر|متوفر|توفر|product|price/i.test(normalized)) {
      add('منتج', 'منتجات', 'سعر', 'متوفر', 'تفاصيل المنتج');
    }

    if (/سلة|السلة|إضافة|اضافة|حذف|كمية|شراء|أشتري|اشتري|اطلب|إتمام|اتمام|checkout|cart/i.test(normalized)) {
      add('سلة', 'السلة', 'إضافة', 'كمية', 'إتمام الطلب', 'إتمام الشراء', 'checkout');
    }

    if (/صيانة|مهندس|فني|خدمة|اصلاح|إصلاح|تركيب|maintenance|service/i.test(normalized)) {
      add('صيانة', 'خدمة', 'مهندس', 'فني', 'طلب خدمة', 'عروض المهندسين');
    }

    if (/دعم|موظف|مساعدة|تواصل|support|agent/i.test(normalized)) {
      add('دعم', 'الدعم', 'موظف', 'مساعدة', 'تواصل');
    }

    return Array.from(expanded).slice(0, 25);
  }

  private buildCards(products: ProductCandidate[], isArabic: boolean): TejoCard[] {
    return products.slice(0, 4).map((product) => {
      const id = this.getProductId(product) || '';
      const title = isArabic
        ? product.name || product.title || product.nameEn || 'منتج'
        : product.nameEn || product.title || product.name || 'Product';

      const image = product.mainImageUrl || product.image;
      const subtitle = this.extractPrice(product, isArabic);

      return {
        id,
        title,
        subtitle,
        image,
        metadata: {
          productId: id,
          featured: Boolean(product.isFeatured),
          rating: this.toFiniteNumber(product.rating),
        },
      };
    });
  }

  private extractPrice(product: ProductCandidate, isArabic: boolean): string {
    const priceByCurrency = product.discountedPriceByCurrency || product.priceByCurrency;

    if (priceByCurrency && typeof priceByCurrency === 'object') {
      const usd = priceByCurrency.USD;
      if (typeof usd === 'number') {
        return isArabic ? `السعر: ${usd.toFixed(2)} USD` : `Price: ${usd.toFixed(2)} USD`;
      }
    }

    const priceRangeUsd = product.priceRangeByCurrency?.USD;
    if (priceRangeUsd?.minPrice !== undefined && priceRangeUsd?.maxPrice !== undefined) {
      return isArabic
        ? `السعر: ${priceRangeUsd.minPrice.toFixed(2)} - ${priceRangeUsd.maxPrice.toFixed(2)} USD`
        : `Price: ${priceRangeUsd.minPrice.toFixed(2)} - ${priceRangeUsd.maxPrice.toFixed(2)} USD`;
    }

    return isArabic ? 'السعر عند الطلب' : 'Price on request';
  }

  private buildSuggestions(intent: TejoIntent, handoff: boolean, isArabic: boolean): string[] {
    if (handoff && isArabic) {
      return ['متابعة مع موظف', 'إضافة تفاصيل المشكلة', 'الشحن والتوصيل'];
    }

    if (handoff) {
      return isArabic
        ? ['أريد متابعة مع موظف', 'أحتاج شرح أكثر', 'هل يمكن تحديد وقت للاتصال؟']
        : ['I want a human agent', 'I need more details', 'Can we schedule a call?'];
    }

    if (intent === 'product_search') {
      return isArabic
        ? ['أريد خيارات بميزانية أقل', 'اعرض المنتجات الأعلى تقييما', 'قارن بين أفضل منتجين']
        : ['Show lower budget options', 'Show top rated products', 'Compare the best two products'];
    }

    return isArabic
      ? ['أرغب في المتابعة', 'أريد فتح تذكرة جديدة', 'أحتاج دعم فني مباشر']
      : ['I want to continue', 'Open a new ticket', 'I need direct technical support'];
  }

  private buildActions(cards: TejoCard[], handoff: boolean, isArabic: boolean): TejoAction[] {
    const actions: TejoAction[] = [];

    for (const card of cards) {
      actions.push({
        type: 'open_product',
        label: isArabic ? 'عرض المنتج' : 'Open product',
        value: card.id,
      });
    }

    if (handoff) {
      actions.push({
        type: 'request_handoff',
        label: isArabic ? 'التحويل لموظف بشري' : 'Request human handoff',
      });
    }

    return actions.slice(0, 5);
  }

  private assembleSystemPrompt(
    basePrompt: string,
    intent: TejoIntent,
    entities: string[],
    cards: TejoCard[],
    knowledgeSnippets: string[],
    locale: string,
  ): string {
    return [
      basePrompt,
      `Intent: ${intent}`,
      `Locale: ${locale}`,
      `Entities: ${entities.join(', ')}`,
      `RetrievedCards: ${cards.map((card) => card.title).join(' | ')}`,
      `KnowledgeSnippets: ${knowledgeSnippets.join(' | ') || 'none'}`,
      'Rules: Keep responses short, factual, safe, and never invent product availability.',
    ].join('\n');
  }

  private defaultSystemPrompt(isArabic: boolean): string {
    if (isArabic) {
      return 'أنت Tejo مساعد دعم ومتجر. قدم ردودا دقيقة ومختصرة، واعتمد على النتائج المتاحة فقط.';
    }

    return 'You are Tejo support and commerce assistant. Provide concise accurate answers and use only available retrieval results.';
  }

  private buildHandoffReply(isArabic: boolean, userRequestedHuman: boolean): string {
    if (userRequestedHuman) {
      return isArabic
        ? 'أكيد، تم تحويلك إلى موظف دعم بشري داخل نفس التذكرة. يمكنك كتابة تفاصيل المشكلة هنا وسيقوم الفريق بمتابعتها.'
        : 'Sure, you have been connected to a human support agent in the same ticket. You can share the issue details here and the team will follow up.';
    }

    return isArabic
      ? 'تم تحويل طلبك إلى موظف دعم بشري داخل نفس التذكرة حتى يتم التحقق من التفاصيل ومتابعتك.'
      : 'Your request has been handed off to a human support agent in the same ticket so the details can be verified.';
  }

  private buildHandoffReason(
    intent: TejoIntent,
    confidence: number,
    threshold: number,
    retrievalFailed: boolean,
    internalVerificationRequired = false,
    repeatedRetrievalFailure = false,
  ): string {
    if (intent === 'human_handoff') {
      return 'user_requested_human';
    }

    if (internalVerificationRequired) {
      return 'internal_verification_required';
    }

    if (repeatedRetrievalFailure) {
      return 'repeated_retrieval_failed';
    }

    if (retrievalFailed) {
      return 'retrieval_failed_after_retries';
    }

    if (confidence < threshold) {
      return `low_confidence_${confidence.toFixed(2)}`;
    }

    return 'policy_handoff';
  }

  private buildNoKnowledgeReply(isArabic: boolean): string {
    return isArabic
      ? 'لا أملك معلومة مؤكدة كافية عن هذا الموضوع حاليًا. هل تقصد الشحن، الضمان، الطلبات، المنتجات، أو خدمات الصيانة؟'
      : 'I do not have enough verified information about this topic right now. Do you mean shipping, warranty, orders, products, or maintenance services?';
  }

  private buildNoKnowledgeSuggestions(isArabic: boolean): string[] {
    return isArabic
      ? ['الشحن والتوصيل', 'الضمان والاستبدال', 'متابعة الطلب', 'خدمات الصيانة', 'التحدث مع موظف']
      : ['Shipping and delivery', 'Warranty and returns', 'Track an order', 'Maintenance services', 'Talk to an agent'];
  }

  private requiresInternalVerification(message: string): boolean {
    const normalized = message.toLowerCase();

    return /(رقم الطلب|طلب رقم|طلبي|طلباتي|حسابي|بياناتي|دفعتي|حوالتي|تحويلي|مدفوعاتي|فاتورتي|استرداد مبلغ|حالة الدفع|my order|my account|my payment|my invoice|refund status|order\s*#?\s*\d+)/i.test(
      normalized,
    );
  }

  private async countPreviousRetrievalFailuresSession(sessionId: string): Promise<number> {
    return this.messageService.countBySessionId(sessionId);
  }

  private async countPreviousRetrievalFailures(ticketId: string): Promise<number> {
    return await this.conversationModel.countDocuments({
      ticketId,
      'metadata.retrieval.retrievalFailed': true,
    });
  }

  private normalizeForDedupe(value: string): string {
    return value
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase()
      .slice(0, 500);
  }

  private buildTicketTitle(message: string, isArabic: boolean): string {
    const prefix = isArabic ? 'محادثة Tejo' : 'Tejo conversation';
    const snippet = message.trim().slice(0, 42);
    return `${prefix}: ${snippet}`;
  }

  private cosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length === 0 || vectorB.length === 0 || vectorA.length !== vectorB.length) {
      return 0;
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let index = 0; index < vectorA.length; index += 1) {
      const a = this.toFiniteNumber(vectorA[index]);
      const b = this.toFiniteNumber(vectorB[index]);
      dotProduct += a * b;
      normA += a * a;
      normB += b * b;
    }

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return this.toBounded(dotProduct / (Math.sqrt(normA) * Math.sqrt(normB)), 0, 1);
  }

  private toFiniteNumber(value: unknown): number {
    const num = Number(value);
    return Number.isFinite(num) ? num : 0;
  }

  private toBounded(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
  }

  private getProductId(product: ProductCandidate): string | undefined {
    if (product.id) {
      return String(product.id);
    }
    if (product._id) {
      return String(product._id);
    }
    return undefined;
  }

  private createTraceId(): string {
    const randomPart = Math.random().toString(36).slice(2, 8);
    return `tejo_${Date.now().toString(36)}_${randomPart}`;
  }
}
