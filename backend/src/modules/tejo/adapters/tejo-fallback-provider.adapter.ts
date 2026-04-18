import { Injectable } from '@nestjs/common';
import {
  TejoChatRequest,
  TejoChatResponse,
  TejoEmbedRequest,
  TejoEmbedResponse,
  TejoProviderAdapter,
} from '../tejo.types';

@Injectable()
export class TejoFallbackProviderAdapter implements TejoProviderAdapter {
  readonly name = 'provider-b';

  async chat(request: TejoChatRequest): Promise<TejoChatResponse> {
    const message = request.messages[request.messages.length - 1]?.content || '';
    const isArabic = request.locale.toLowerCase().startsWith('ar');

    return {
      outputText: isArabic
        ? `Tejo (Fallback): تم استلام طلبك "${message.slice(0, 80)}" وسأتابع معك خطوة بخطوة.`
        : `Tejo (Fallback): Received your request "${message.slice(0, 80)}" and I will guide you step by step.`,
      confidence: 0.7,
      model: 'provider-b-chat-v1',
      raw: { provider: this.name },
    };
  }

  async embed(request: TejoEmbedRequest): Promise<TejoEmbedResponse> {
    const vectors = request.texts.map((text) => this.toVector(text));
    return {
      vectors,
      model: 'provider-b-embed-v1',
    };
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }

  private toVector(text: string): number[] {
    const dims = 16;
    const values = new Array<number>(dims).fill(0);
    for (let i = 0; i < text.length; i += 1) {
      values[i % dims] += (text.charCodeAt(i) * (i + 1)) % 113;
    }
    const norm = Math.sqrt(values.reduce((acc, n) => acc + n * n, 0)) || 1;
    return values.map((n) => Number((n / norm).toFixed(6)));
  }
}

