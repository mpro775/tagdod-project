import { Injectable, Logger } from '@nestjs/common';
import { SystemSettingsService } from '../../system-settings/system-settings.service';
import {
  TejoChatRequest,
  TejoChatResponse,
  TejoEmbedRequest,
  TejoEmbedResponse,
  TejoProviderAdapter,
} from '../tejo.types';
import { TejoGeminiProviderAdapter } from './tejo-gemini-provider.adapter';
import { TejoFallbackProviderAdapter } from './tejo-fallback-provider.adapter';
import { TejoPrimaryProviderAdapter } from './tejo-primary-provider.adapter';
import { TejoExternalEmbeddingProviderAdapter } from './tejo-external-embedding-provider.adapter';

@Injectable()
export class TejoLlmRouterService {
  private readonly logger = new Logger(TejoLlmRouterService.name);

  constructor(
    private readonly geminiProvider: TejoGeminiProviderAdapter,
    private readonly primaryProvider: TejoPrimaryProviderAdapter,
    private readonly fallbackProvider: TejoFallbackProviderAdapter,
    private readonly externalEmbeddingProvider: TejoExternalEmbeddingProviderAdapter,
    private readonly systemSettingsService: SystemSettingsService,
  ) {}

  async chat(request: TejoChatRequest): Promise<{ response: TejoChatResponse; provider: string }> {
    const providers = await this.getOrderedProviders('chat');

    let lastError: unknown;
    for (const provider of providers) {
      try {
        const healthy = await provider.healthCheck();
        if (!healthy) {
          this.logger.warn(`Tejo provider ${provider.name} is unhealthy, skipping`);
          continue;
        }

        const response = await provider.chat(request);
        return {
          response,
          provider: provider.name,
        };
      } catch (error) {
        lastError = error;
        this.logger.warn(
          `Tejo provider ${provider.name} failed in chat: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    throw lastError || new Error('No Tejo providers available for chat');
  }

  async embed(
    request: TejoEmbedRequest,
  ): Promise<{ response: TejoEmbedResponse; provider: string }> {
    const providers = await this.getOrderedProviders('embed');

    let lastError: unknown;
    for (const provider of providers) {
      try {
        const healthy = await provider.healthCheck();
        if (!healthy) {
          continue;
        }

        const response = await provider.embed(request);
        return {
          response,
          provider: provider.name,
        };
      } catch (error) {
        lastError = error;
        this.logger.warn(
          `Tejo provider ${provider.name} failed in embed: ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }

    throw lastError || new Error('No Tejo providers available for embeddings');
  }

  async getOrderedProviderNames(): Promise<string[]> {
    const ordered = await this.getOrderedProviders('chat');
    return ordered.map((provider) => provider.name);
  }

  private async getOrderedProviders(mode: 'chat' | 'embed'): Promise<TejoProviderAdapter[]> {
    const envKey = mode === 'chat' ? 'TEJO_CHAT_PROVIDER_ORDER' : 'TEJO_EMBEDDING_PROVIDER_ORDER';

    const envOrder = process.env[envKey]
      ?.split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const fallbackOrder =
      mode === 'chat'
        ? ['gemini', 'provider-a', 'provider-b']
        : ['external-embedding', 'gemini', 'provider-a', 'provider-b'];

    const normalized =
      envOrder && envOrder.length > 0 ? envOrder.map((item) => item.toLowerCase()) : fallbackOrder;

    const registry = new Map<string, TejoProviderAdapter>([
      [this.geminiProvider.name, this.geminiProvider],
      [this.primaryProvider.name, this.primaryProvider],
      [this.fallbackProvider.name, this.fallbackProvider],
      [this.externalEmbeddingProvider.name, this.externalEmbeddingProvider],
    ]);

    const ordered: TejoProviderAdapter[] = [];

    for (const providerName of normalized) {
      const provider = registry.get(providerName);
      if (provider && !ordered.includes(provider)) {
        ordered.push(provider);
      }
    }

    return ordered;
  }
}
