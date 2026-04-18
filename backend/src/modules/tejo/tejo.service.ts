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
} from '../support/schemas/support-ticket.schema';
import { TejoQueryDto } from './dto/tejo-query.dto';
import { TejoConversation, TejoConversationDocument } from './schemas/tejo-conversation.schema';
import { TejoKbEmbedding, TejoKbEmbeddingDocument } from './schemas/tejo-kb-embedding.schema';
import {
  TejoProductEmbedding,
  TejoProductEmbeddingDocument,
} from './schemas/tejo-product-embedding.schema';
import { TejoPromptService } from './tejo-prompt.service';
import { TejoSettingsService } from './tejo-settings.service';
import { TejoAction, TejoCard, TejoIntent, TejoQueryResponse } from './tejo.types';
import { TejoLlmRouterService } from './adapters/tejo-llm-router.service';

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

@Injectable()
export class TejoService {
  private readonly logger = new Logger(TejoService.name);

  constructor(
    private readonly supportService: SupportService,
    private readonly searchService: SearchService,
    private readonly promptService: TejoPromptService,
    private readonly settingsService: TejoSettingsService,
    private readonly llmRouterService: TejoLlmRouterService,
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

    let ticketId = dto.ticketId;

    if (ticketId) {
      await this.supportService.getTicket(ticketId, userId, false);
      await this.supportService.addMessage(ticketId, userId, {
        content: dto.message,
        metadata: {
          source: 'tejo',
          locale,
          traceId,
          ...dto.context,
        },
      });
    } else {
      const ticket = await this.supportService.createTicket(userId, {
        title: this.buildTicketTitle(dto.message, isArabic),
        description: dto.message,
        category: SupportCategory.OTHER,
        channel: dto.channel,
        metadata: {
          source: 'tejo',
          locale,
          traceId,
          ...dto.context,
        },
      });

      ticketId = ticket._id.toString();
    }

    await this.supportService.updateTicketAiState(ticketId, {
      isAiHandled: true,
      aiStatus: SupportAiStatus.ACTIVE,
      channel: dto.channel,
    });

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
    const handoffSuggested =
      handoffRequestedByIntent || retrieval.retrievalFailed || confidence < threshold;

    const suggestions = this.buildSuggestions(intent, handoffSuggested, isArabic);
    const actions = this.buildActions(cards, handoffSuggested, isArabic);

    const finalReply = handoffSuggested
      ? this.buildHandoffReply(isArabic, retrieval.retrievalFailed)
      : modelResponse.outputText;

    const handoffReason = handoffSuggested
      ? this.buildHandoffReason(intent, confidence, threshold, retrieval.retrievalFailed)
      : undefined;

    const savedAiMessage = await this.supportService.addAutomatedMessage(ticketId, {
      content: finalReply,
      messageType: handoffSuggested ? MessageType.AI_HANDOFF : MessageType.AI_REPLY,
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
      },
      payload: {
        cards,
        suggestions,
        actions,
        knowledge: retrieval.knowledgeSnippets,
      },
      handoffReason,
    });

    if (handoffSuggested) {
      await this.supportService.updateTicketAiState(ticketId, {
        isAiHandled: true,
        aiStatus: SupportAiStatus.HANDED_OFF,
        handoffReason,
      });
    }

    const latencyMs = Date.now() - startedAt;

    await this.conversationModel.create({
      ticketId,
      userId,
      userMessage: dto.message,
      reply: finalReply,
      intent,
      entities,
      confidence,
      handoffSuggested,
      handoffTriggered: handoffSuggested,
      latencyMs,
      provider,
      model: modelResponse.model,
      cards,
      suggestions,
      actions,
      metadata: {
        locale,
        traceId,
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
      `Tejo query completed traceId=${traceId} ticketId=${ticketId} confidence=${confidence.toFixed(
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
      ticketId,
      messageId: savedAiMessage._id.toString(),
      latencyMs,
    };
  }

  private detectIntent(message: string): TejoIntent {
    const normalized = message.toLowerCase();

    if (/(human|agent|representative|موظف|بشري|تواصل معي|تحويل|اكلم شخص)/i.test(normalized)) {
      return 'human_handoff';
    }

    if (/(order|shipment|delivery|tracking|طلب|شحنة|توصيل|تتبع)/i.test(normalized)) {
      return 'order_help';
    }

    if (/(product|kit|battery|solar|inverter|panel|منتج|بطارية|طاقة|انفرتر|لوح)/i.test(normalized)) {
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

    const lexicalResult = await this.searchService.advancedProductSearch({
      q: message,
      lang,
      limit: 12,
      sortBy: ProductSortBy.RELEVANCE,
      sortOrder: SortOrder.DESC,
      status: 'active',
    });

    const lexicalProducts = (Array.isArray(lexicalResult.results)
      ? lexicalResult.results
      : []) as ProductCandidate[];

    if (lexicalProducts.length === 0) {
      return {
        products: [],
        cards: [],
        knowledgeSnippets: [],
        retrievalFailed: true,
        lexicalCount: 0,
        vectorMatchedCount: 0,
      };
    }

    const productIds = lexicalProducts
      .map((product) => this.getProductId(product))
      .filter((id): id is string => Boolean(id));

    let queryVector: number[] | null = null;
    try {
      const { response } = await this.llmRouterService.embed({ texts: [message] });
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

    const knowledgeSnippets = await this.retrieveKnowledgeSnippets(queryVector, 2);

    return {
      products: topProducts,
      cards,
      knowledgeSnippets,
      retrievalFailed: cards.length === 0,
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

  private async retrieveKnowledgeSnippets(
    queryVector: number[] | null,
    limit: number,
  ): Promise<string[]> {
    if (!queryVector || queryVector.length === 0 || limit <= 0) {
      return [];
    }

    const rows = await this.kbEmbeddingModel.find().select('text vector').limit(50).lean();
    if (rows.length === 0) {
      return [];
    }

    const scored = rows
      .map((row) => ({
        text: String(row.text || ''),
        score: this.cosineSimilarity(queryVector, Array.isArray(row.vector) ? row.vector : []),
      }))
      .filter((entry) => entry.text.length > 0 && entry.score > 0.08)
      .sort((left, right) => right.score - left.score)
      .slice(0, limit);

    return scored.map((entry) => entry.text);
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

  private buildHandoffReply(isArabic: boolean, retrievalFailed: boolean): string {
    if (retrievalFailed) {
      return isArabic
        ? 'تعذر جلب معلومات كافية الآن، لذلك تم تحويل طلبك مباشرة إلى موظف دعم بشري داخل نفس التذكرة.'
        : 'I could not retrieve enough reliable information right now, so your request was handed off to a human support agent in the same ticket.';
    }

    return isArabic
      ? 'تم تحويل طلبك إلى موظف دعم بشري داخل نفس التذكرة، وسيتم متابعتك بأقرب وقت.'
      : 'Your request has been handed off to a human support agent in the same ticket, and you will be contacted shortly.';
  }

  private buildHandoffReason(
    intent: TejoIntent,
    confidence: number,
    threshold: number,
    retrievalFailed: boolean,
  ): string {
    if (intent === 'human_handoff') {
      return 'user_requested_human';
    }

    if (retrievalFailed) {
      return 'retrieval_failed';
    }

    if (confidence < threshold) {
      return `low_confidence_${confidence.toFixed(2)}`;
    }

    return 'policy_handoff';
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
