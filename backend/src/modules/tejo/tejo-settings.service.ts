import { Injectable } from '@nestjs/common';
import { SystemSettingsService } from '../system-settings/system-settings.service';

const parseBoolean = (value: string | undefined, defaultValue: boolean): boolean => {
  if (value === undefined) {
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'on'].includes(normalized)) {
    return true;
  }
  if (['0', 'false', 'no', 'off'].includes(normalized)) {
    return false;
  }
  return defaultValue;
};

@Injectable()
export class TejoSettingsService {
  constructor(private readonly systemSettingsService: SystemSettingsService) {}

  async isTejoEnabled(): Promise<boolean> {
    const envDefault = parseBoolean(process.env.TEJO_ENABLED, true);
    const setting = await this.systemSettingsService.getSettingValue('tejo.enabled', envDefault);
    return Boolean(setting);
  }

  async isWebPilotEnabled(): Promise<boolean> {
    const envDefault = parseBoolean(process.env.TEJO_WEB_PILOT_ENABLED, false);
    const setting = await this.systemSettingsService.getSettingValue(
      'tejo.web_pilot_enabled',
      envDefault,
    );
    return Boolean(setting);
  }

  async getProviderOrder(): Promise<string[]> {
    return this.getChatProviderOrder();
  }

  async getChatProviderOrder(): Promise<string[]> {
    const envOrder = this.parseCsv(
      process.env.TEJO_CHAT_PROVIDER_ORDER || process.env.TEJO_PROVIDER_ORDER,
      ['gemini', 'provider-a', 'provider-b'],
    );

    const setting = await this.systemSettingsService.getSettingValue(
      'tejo.chat_provider_order',
      await this.systemSettingsService.getSettingValue('tejo.provider_order', envOrder),
    );
    if (!Array.isArray(setting)) {
      return envOrder;
    }

    const values = setting.map((value) => String(value).trim()).filter(Boolean);
    return values.length > 0 ? values : envOrder;
  }

  async getEmbeddingProviderOrder(): Promise<string[]> {
    const envOrder = this.parseCsv(process.env.TEJO_EMBEDDING_PROVIDER_ORDER, [
      'external-embedding',
    ]);
    const setting = await this.systemSettingsService.getSettingValue(
      'tejo.embedding_provider_order',
      envOrder,
    );

    if (!Array.isArray(setting)) {
      return envOrder;
    }

    const values = setting.map((value) => String(value).trim()).filter(Boolean);
    return values.length > 0 ? values : envOrder;
  }

  async getTenantId(): Promise<string> {
    const envValue = process.env.TEJO_TENANT_ID?.trim() || 'tajaddod';
    const setting = await this.systemSettingsService.getSettingValue('tejo.tenant_id', envValue);
    return String(setting || envValue).trim() || envValue;
  }

  async getHandoffThreshold(): Promise<number> {
    const envThreshold = Number(process.env.TEJO_HANDOFF_THRESHOLD || 0.55);
    const setting = await this.systemSettingsService.getSettingValue(
      'tejo.handoff_threshold',
      Number.isFinite(envThreshold) ? envThreshold : 0.55,
    );
    const threshold = Number(setting);
    if (Number.isNaN(threshold)) {
      return 0.55;
    }

    return Math.min(1, Math.max(0, threshold));
  }

  async getGeminiApiKey(): Promise<string> {
    const envValue =
      process.env.GEMINI_API_KEY?.trim() || process.env.TEJO_GEMINI_API_KEY?.trim() || '';
    const setting = await this.systemSettingsService.getSettingValue(
      'tejo.gemini_api_key',
      envValue,
    );
    return String(setting || '').trim();
  }

  async getGeminiBaseUrl(): Promise<string> {
    const envValue =
      process.env.GEMINI_BASE_URL?.trim() ||
      process.env.TEJO_GEMINI_BASE_URL?.trim() ||
      'https://generativelanguage.googleapis.com/v1beta';
    const setting = await this.systemSettingsService.getSettingValue(
      'tejo.gemini_base_url',
      envValue,
    );
    return String(setting || envValue).trim() || envValue;
  }

  async getGeminiChatModel(): Promise<string> {
    const envValue =
      process.env.GEMINI_CHAT_MODEL?.trim() ||
      process.env.TEJO_GEMINI_CHAT_MODEL?.trim() ||
      'gemini-2.0-flash';
    const setting = await this.systemSettingsService.getSettingValue(
      'tejo.gemini_chat_model',
      envValue,
    );
    return String(setting || envValue).trim() || envValue;
  }

  async getGeminiEmbeddingModel(): Promise<string> {
    const envValue = process.env.TEJO_GEMINI_EMBEDDING_MODEL?.trim() || 'gemini-embedding-001';
    const setting = await this.systemSettingsService.getSettingValue(
      'tejo.gemini_embedding_model',
      envValue,
    );
    return String(setting || envValue).trim() || envValue;
  }

  async getRetrievalSettings(): Promise<{
    topK: number;
    minScore: number;
    contextMaxChars: number;
    includeProducts: boolean;
    includeKb: boolean;
  }> {
    const topK = Number(
      await this.systemSettingsService.getSettingValue(
        'tejo.retrieval_top_k',
        Number(process.env.TEJO_RETRIEVAL_TOP_K || 8),
      ),
    );
    const minScore = Number(
      await this.systemSettingsService.getSettingValue(
        'tejo.retrieval_min_score',
        Number(process.env.TEJO_RETRIEVAL_MIN_SCORE || 0.45),
      ),
    );
    const contextMaxChars = Number(
      await this.systemSettingsService.getSettingValue(
        'tejo.context_max_chars',
        Number(process.env.TEJO_CONTEXT_MAX_CHARS || 6000),
      ),
    );
    const includeProducts = Boolean(
      await this.systemSettingsService.getSettingValue(
        'tejo.include_products',
        parseBoolean(process.env.TEJO_INCLUDE_PRODUCTS, true),
      ),
    );
    const includeKb = Boolean(
      await this.systemSettingsService.getSettingValue(
        'tejo.include_kb',
        parseBoolean(process.env.TEJO_INCLUDE_KB, true),
      ),
    );

    return {
      topK: Number.isFinite(topK) ? Math.max(1, Math.min(50, topK)) : 8,
      minScore: Number.isFinite(minScore) ? Math.max(0, Math.min(1, minScore)) : 0.45,
      contextMaxChars: Number.isFinite(contextMaxChars)
        ? Math.max(500, Math.min(20000, contextMaxChars))
        : 6000,
      includeProducts,
      includeKb,
    };
  }

  async getSettingsSnapshot(): Promise<{
    enabled: boolean;
    webPilotEnabled: boolean;
    providerOrder: string[];
    chatProviderOrder: string[];
    embeddingProviderOrder: string[];
    threshold: number;
    tenantId: string;
    geminiChatModel: string;
    geminiEmbeddingModel: string;
    geminiBaseUrl: string;
    hasGeminiApiKey: boolean;
    embeddingUrl: string;
    embeddingProvider: string;
    embeddingModel: string;
    embeddingDimension: number;
    embeddingTimeoutMs: number;
    vectorStoreProvider: 'qdrant';
    qdrantUrl: string;
    qdrantCollection: string;
    qdrantVectorSize: number;
    hasQdrantApiKey: boolean;
    retrieval: {
      topK: number;
      minScore: number;
      contextMaxChars: number;
      includeProducts: boolean;
      includeKb: boolean;
    };
  }> {
    const [
      enabled,
      webPilotEnabled,
      chatProviderOrder,
      embeddingProviderOrder,
      threshold,
      tenantId,
      geminiApiKey,
      geminiChatModel,
      geminiEmbeddingModel,
      geminiBaseUrl,
      retrieval,
    ] = await Promise.all([
      this.isTejoEnabled(),
      this.isWebPilotEnabled(),
      this.getChatProviderOrder(),
      this.getEmbeddingProviderOrder(),
      this.getHandoffThreshold(),
      this.getTenantId(),
      this.getGeminiApiKey(),
      this.getGeminiChatModel(),
      this.getGeminiEmbeddingModel(),
      this.getGeminiBaseUrl(),
      this.getRetrievalSettings(),
    ]);

    return {
      enabled,
      webPilotEnabled,
      providerOrder: chatProviderOrder,
      chatProviderOrder,
      embeddingProviderOrder,
      threshold,
      tenantId,
      geminiChatModel,
      geminiEmbeddingModel,
      geminiBaseUrl,
      hasGeminiApiKey: Boolean(geminiApiKey),
      embeddingUrl: process.env.TEJO_EMBEDDING_URL?.trim() || '',
      embeddingProvider: embeddingProviderOrder[0] || 'external-embedding',
      embeddingModel:
        process.env.TEJO_EMBEDDING_MODEL?.trim() ||
        'sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2',
      embeddingDimension: Number(process.env.TEJO_EMBEDDING_DIMENSION || 384),
      embeddingTimeoutMs: Number(process.env.TEJO_EMBEDDING_TIMEOUT_MS || 120000),
      vectorStoreProvider: 'qdrant',
      qdrantUrl: process.env.QDRANT_URL?.trim() || '',
      qdrantCollection: process.env.QDRANT_COLLECTION?.trim() || 'tejo_knowledge',
      qdrantVectorSize: Number(process.env.QDRANT_VECTOR_SIZE || 384),
      hasQdrantApiKey: Boolean(process.env.QDRANT_API_KEY?.trim()),
      retrieval,
    };
  }

  async updateSettings(
    userId: string,
    settings: {
      enabled?: boolean;
      webPilotEnabled?: boolean;
      providerOrder?: string[];
      chatProviderOrder?: string[];
      embeddingProviderOrder?: string[];
      threshold?: number;
      tenantId?: string;
      geminiApiKey?: string;
      geminiChatModel?: string;
      geminiEmbeddingModel?: string;
      geminiBaseUrl?: string;
      retrievalTopK?: number;
      retrievalMinScore?: number;
      contextMaxChars?: number;
      includeProducts?: boolean;
      includeKb?: boolean;
    },
  ): Promise<void> {
    const updates: Record<string, unknown> = {};

    if (settings.enabled !== undefined) {
      updates['tejo.enabled'] = settings.enabled;
    }

    if (settings.webPilotEnabled !== undefined) {
      updates['tejo.web_pilot_enabled'] = settings.webPilotEnabled;
    }

    const chatProviderOrder = settings.chatProviderOrder || settings.providerOrder;
    if (chatProviderOrder !== undefined) {
      updates['tejo.chat_provider_order'] = chatProviderOrder;
      updates['tejo.provider_order'] = chatProviderOrder;
    }

    if (settings.embeddingProviderOrder !== undefined) {
      updates['tejo.embedding_provider_order'] = settings.embeddingProviderOrder;
    }

    if (settings.threshold !== undefined) {
      updates['tejo.handoff_threshold'] = settings.threshold;
    }

    if (settings.tenantId !== undefined) {
      updates['tejo.tenant_id'] = settings.tenantId.trim();
    }

    if (settings.geminiApiKey !== undefined) {
      updates['tejo.gemini_api_key'] = settings.geminiApiKey.trim();
    }

    if (settings.geminiChatModel !== undefined) {
      updates['tejo.gemini_chat_model'] = settings.geminiChatModel.trim();
    }

    if (settings.geminiEmbeddingModel !== undefined) {
      updates['tejo.gemini_embedding_model'] = settings.geminiEmbeddingModel.trim();
    }

    if (settings.geminiBaseUrl !== undefined) {
      updates['tejo.gemini_base_url'] = settings.geminiBaseUrl.trim();
    }

    if (settings.retrievalTopK !== undefined) {
      updates['tejo.retrieval_top_k'] = settings.retrievalTopK;
    }

    if (settings.retrievalMinScore !== undefined) {
      updates['tejo.retrieval_min_score'] = settings.retrievalMinScore;
    }

    if (settings.contextMaxChars !== undefined) {
      updates['tejo.context_max_chars'] = settings.contextMaxChars;
    }

    if (settings.includeProducts !== undefined) {
      updates['tejo.include_products'] = settings.includeProducts;
    }

    if (settings.includeKb !== undefined) {
      updates['tejo.include_kb'] = settings.includeKb;
    }

    if (Object.keys(updates).length === 0) {
      return;
    }

    await this.systemSettingsService.bulkUpdate({ settings: updates }, userId);
  }

  private parseCsv(value: string | undefined, fallback: string[]): string[] {
    const parsed = value
      ?.split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    return parsed && parsed.length > 0 ? parsed : fallback;
  }
}
