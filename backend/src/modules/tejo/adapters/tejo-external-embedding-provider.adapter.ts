import { Injectable } from '@nestjs/common';
import axios from 'axios';
import {
  TejoChatRequest,
  TejoChatResponse,
  TejoEmbedRequest,
  TejoEmbedResponse,
  TejoProviderAdapter,
} from '../tejo.types';

@Injectable()
export class TejoExternalEmbeddingProviderAdapter implements TejoProviderAdapter {
  readonly name = 'external-embedding';

  async chat(_request: TejoChatRequest): Promise<TejoChatResponse> {
    throw new Error('external-embedding provider does not support chat');
  }

  async embed(request: TejoEmbedRequest): Promise<TejoEmbedResponse> {
    const url = process.env.TEJO_EMBEDDING_URL;

    if (!url) {
      throw new Error('TEJO_EMBEDDING_URL is missing');
    }

    const response = await axios.post(
      url,
      {
        texts: request.texts,
      },
      {
        timeout: Number(process.env.TEJO_EMBEDDING_TIMEOUT_MS || 120000),
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    return {
      vectors: response.data.vectors || [],
      model: response.data.model || 'external-embedding',
    };
  }

  async healthCheck(): Promise<boolean> {
    return Boolean(process.env.TEJO_EMBEDDING_URL);
  }
}
