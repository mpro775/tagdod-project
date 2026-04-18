import { Injectable } from '@nestjs/common';
import {
  TejoChatRequest,
  TejoChatResponse,
  TejoEmbedRequest,
  TejoEmbedResponse,
  TejoProviderAdapter,
} from '../tejo.types';

@Injectable()
export class TejoPrimaryProviderAdapter implements TejoProviderAdapter {
  readonly name = 'provider-a';

  async chat(request: TejoChatRequest): Promise<TejoChatResponse> {
    const lastMessage = request.messages[request.messages.length - 1]?.content || '';
    const isArabic = request.locale.toLowerCase().startsWith('ar');
    const reply = isArabic
      ? `مساعد Tejo: فهمت طلبك بخصوص "${lastMessage.slice(0, 80)}" وسأعطيك أفضل الخيارات المتاحة الآن.`
      : `Tejo assistant: I understood your request about "${lastMessage.slice(0, 80)}" and I will provide the best available options now.`;

    return {
      outputText: reply,
      confidence: 0.82,
      model: 'provider-a-chat-v1',
      raw: { provider: this.name },
    };
  }

  async embed(request: TejoEmbedRequest): Promise<TejoEmbedResponse> {
    const vectors = request.texts.map((text) => this.toVector(text));
    return {
      vectors,
      model: 'provider-a-embed-v1',
    };
  }

  async healthCheck(): Promise<boolean> {
    return true;
  }

  private toVector(text: string): number[] {
    const dims = 16;
    const values = new Array<number>(dims).fill(0);
    for (let i = 0; i < text.length; i += 1) {
      values[i % dims] += text.charCodeAt(i) % 97;
    }
    const norm = Math.sqrt(values.reduce((acc, n) => acc + n * n, 0)) || 1;
    return values.map((n) => Number((n / norm).toFixed(6)));
  }
}

