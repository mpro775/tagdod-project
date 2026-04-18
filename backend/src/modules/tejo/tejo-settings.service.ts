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
    const envOrder =
      process.env.TEJO_PROVIDER_ORDER?.split(',').map((value) => value.trim()).filter(Boolean) || [
        'gemini',
        'provider-a',
        'provider-b',
      ];

    const setting = await this.systemSettingsService.getSettingValue('tejo.provider_order', envOrder);
    if (!Array.isArray(setting)) {
      return envOrder;
    }

    const values = setting.map((value) => String(value).trim()).filter(Boolean);
    return values.length > 0 ? values : envOrder;
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
    const envValue = process.env.TEJO_GEMINI_API_KEY?.trim() || '';
    const setting = await this.systemSettingsService.getSettingValue('tejo.gemini_api_key', envValue);
    return String(setting || '').trim();
  }

  async getGeminiBaseUrl(): Promise<string> {
    const envValue = process.env.TEJO_GEMINI_BASE_URL?.trim() || 'https://generativelanguage.googleapis.com/v1beta';
    const setting = await this.systemSettingsService.getSettingValue('tejo.gemini_base_url', envValue);
    return String(setting || envValue).trim() || envValue;
  }

  async getGeminiChatModel(): Promise<string> {
    const envValue = process.env.TEJO_GEMINI_CHAT_MODEL?.trim() || 'gemini-2.0-flash';
    const setting = await this.systemSettingsService.getSettingValue('tejo.gemini_chat_model', envValue);
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

  async getSettingsSnapshot(): Promise<{
    enabled: boolean;
    webPilotEnabled: boolean;
    providerOrder: string[];
    threshold: number;
    geminiChatModel: string;
    geminiEmbeddingModel: string;
    geminiBaseUrl: string;
    hasGeminiApiKey: boolean;
  }> {
    const [
      enabled,
      webPilotEnabled,
      providerOrder,
      threshold,
      geminiApiKey,
      geminiChatModel,
      geminiEmbeddingModel,
      geminiBaseUrl,
    ] = await Promise.all([
      this.isTejoEnabled(),
      this.isWebPilotEnabled(),
      this.getProviderOrder(),
      this.getHandoffThreshold(),
      this.getGeminiApiKey(),
      this.getGeminiChatModel(),
      this.getGeminiEmbeddingModel(),
      this.getGeminiBaseUrl(),
    ]);

    return {
      enabled,
      webPilotEnabled,
      providerOrder,
      threshold,
      geminiChatModel,
      geminiEmbeddingModel,
      geminiBaseUrl,
      hasGeminiApiKey: Boolean(geminiApiKey),
    };
  }

  async updateSettings(
    userId: string,
    settings: {
      enabled?: boolean;
      webPilotEnabled?: boolean;
      providerOrder?: string[];
      threshold?: number;
      geminiApiKey?: string;
      geminiChatModel?: string;
      geminiEmbeddingModel?: string;
      geminiBaseUrl?: string;
    },
  ): Promise<void> {
    const updates: Record<string, unknown> = {};

    if (settings.enabled !== undefined) {
      updates['tejo.enabled'] = settings.enabled;
    }

    if (settings.webPilotEnabled !== undefined) {
      updates['tejo.web_pilot_enabled'] = settings.webPilotEnabled;
    }

    if (settings.providerOrder !== undefined) {
      updates['tejo.provider_order'] = settings.providerOrder;
    }

    if (settings.threshold !== undefined) {
      updates['tejo.handoff_threshold'] = settings.threshold;
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

    if (Object.keys(updates).length === 0) {
      return;
    }

    await this.systemSettingsService.bulkUpdate({ settings: updates }, userId);
  }
}
