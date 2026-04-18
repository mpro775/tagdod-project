import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import {
  TejoChatRequest,
  TejoChatResponse,
  TejoEmbedRequest,
  TejoEmbedResponse,
  TejoProviderAdapter,
} from '../tejo.types';
import { TejoSettingsService } from '../tejo-settings.service';

interface GeminiContentPart {
  text: string;
}

interface GeminiContent {
  role?: 'user' | 'model';
  parts: GeminiContentPart[];
}

@Injectable()
export class TejoGeminiProviderAdapter implements TejoProviderAdapter {
  readonly name = 'gemini';
  private readonly logger = new Logger(TejoGeminiProviderAdapter.name);

  constructor(private readonly settingsService: TejoSettingsService) {}

  async chat(request: TejoChatRequest): Promise<TejoChatResponse> {
    const apiKey = await this.settingsService.getGeminiApiKey();
    if (!apiKey) {
      throw new Error('Gemini API key is missing');
    }

    const baseUrl = await this.settingsService.getGeminiBaseUrl();
    const model = this.resolveChatModel(request.modelHint, await this.settingsService.getGeminiChatModel());
    const { systemInstruction, contents } = this.toGeminiContents(request.messages);

    const endpoint = `${baseUrl}/models/${model}:generateContent`;
    const response = await axios.post(
      endpoint,
      {
        ...(systemInstruction ? { systemInstruction } : {}),
        contents,
        generationConfig: {
          temperature: 0.3,
          topP: 0.9,
        },
      },
      {
        params: { key: apiKey },
        timeout: 45000,
      },
    );

    const outputText = this.extractOutputText(response.data);
    if (!outputText) {
      throw new Error('Gemini returned an empty response');
    }

    return {
      outputText,
      confidence: 0.82,
      model,
      raw: {
        provider: this.name,
        usageMetadata: response.data?.usageMetadata || null,
      },
    };
  }

  async embed(request: TejoEmbedRequest): Promise<TejoEmbedResponse> {
    const apiKey = await this.settingsService.getGeminiApiKey();
    if (!apiKey) {
      throw new Error('Gemini API key is missing');
    }

    const baseUrl = await this.settingsService.getGeminiBaseUrl();
    const model = await this.settingsService.getGeminiEmbeddingModel();
    const endpoint = `${baseUrl}/models/${model}:embedContent`;

    const vectors: number[][] = [];
    for (const text of request.texts) {
      const response = await axios.post(
        endpoint,
        {
          content: {
            parts: [{ text }],
          },
          taskType: 'RETRIEVAL_DOCUMENT',
        },
        {
          params: { key: apiKey },
          timeout: 45000,
        },
      );

      const vector = this.extractEmbeddingVector(response.data);
      vectors.push(vector);
    }

    return {
      vectors,
      model,
    };
  }

  async healthCheck(): Promise<boolean> {
    const apiKey = await this.settingsService.getGeminiApiKey();
    return Boolean(apiKey);
  }

  private resolveChatModel(modelHint: string | undefined, defaultModel: string): string {
    if (!modelHint) {
      return defaultModel;
    }

    const normalized = modelHint.trim();
    if (!normalized) {
      return defaultModel;
    }

    if (normalized.startsWith('gemini:')) {
      const model = normalized.slice('gemini:'.length).trim();
      return model || defaultModel;
    }

    if (normalized.toLowerCase().includes('gemini')) {
      return normalized;
    }

    return defaultModel;
  }

  private toGeminiContents(messages: TejoChatRequest['messages']): {
    systemInstruction: GeminiContent | null;
    contents: GeminiContent[];
  } {
    const systemParts = messages
      .filter((message) => message.role === 'system')
      .map((message) => message.content.trim())
      .filter(Boolean)
      .map((text) => ({ text }));

    const contents: GeminiContent[] = [];
    for (const message of messages) {
      if (message.role === 'system') {
        continue;
      }

      contents.push({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: message.content }],
      });
    }

    if (contents.length === 0) {
      contents.push({
        role: 'user',
        parts: [{ text: 'Hello' }],
      });
    }

    return {
      systemInstruction: systemParts.length > 0 ? { parts: systemParts } : null,
      contents,
    };
  }

  private extractOutputText(raw: unknown): string {
    const candidates = (raw as { candidates?: Array<{ content?: GeminiContent }> })?.candidates || [];
    const parts = candidates[0]?.content?.parts || [];
    return parts
      .map((part) => part?.text || '')
      .filter(Boolean)
      .join('\n')
      .trim();
  }

  private extractEmbeddingVector(raw: unknown): number[] {
    const values = (raw as { embedding?: { values?: number[] } })?.embedding?.values;
    if (!Array.isArray(values) || values.length === 0) {
      this.logger.warn('Gemini embedding response did not include values; returning empty vector');
      return [];
    }
    return values.map((value) => Number(value));
  }
}
