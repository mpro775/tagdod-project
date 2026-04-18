export type TejoIntent =
  | 'product_search'
  | 'order_help'
  | 'human_handoff'
  | 'general_support';

export interface TejoCard {
  id: string;
  title: string;
  subtitle?: string;
  image?: string;
  metadata?: Record<string, unknown>;
}

export interface TejoAction {
  type: string;
  label: string;
  value?: string;
  payload?: Record<string, unknown>;
}

export interface TejoQueryResponse {
  reply: string;
  cards: TejoCard[];
  suggestions: string[];
  actions: TejoAction[];
  confidence: number;
  handoffSuggested: boolean;
  ticketId: string;
  messageId: string;
  latencyMs: number;
}

export interface TejoPromptContext {
  locale: string;
  message: string;
  intent: TejoIntent;
  entities: string[];
  retrievedProducts: Array<Record<string, unknown>>;
}

export interface TejoChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface TejoChatRequest {
  messages: TejoChatMessage[];
  locale: string;
  modelHint?: string;
}

export interface TejoChatResponse {
  outputText: string;
  confidence: number;
  model: string;
  raw?: Record<string, unknown>;
}

export interface TejoEmbedRequest {
  texts: string[];
}

export interface TejoEmbedResponse {
  vectors: number[][];
  model: string;
}

export interface TejoProviderAdapter {
  readonly name: string;
  chat(request: TejoChatRequest): Promise<TejoChatResponse>;
  embed(request: TejoEmbedRequest): Promise<TejoEmbedResponse>;
  healthCheck(): Promise<boolean>;
}

export interface TejoAnalyticsSummary {
  totalQueries: number;
  handoffCount: number;
  handoffRate: number;
  avgLatencyMs: number;
  latencyP50Ms: number;
  latencyP95Ms: number;
  avgConfidence: number;
  successRate: number;
  deflectionRate: number;
  errorRate: number;
  confidenceDistribution: {
    low: number;
    medium: number;
    high: number;
  };
}

