export type TejoPromptStatus = 'draft' | 'active' | 'archived';

export interface TejoPrompt {
  _id: string;
  name: string;
  body: string;
  modelHint?: string;
  status: TejoPromptStatus;
  version: number;
  metadata: Record<string, unknown>;
  activatedBy?: string;
  activatedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TejoConversation {
  _id: string;
  ticketId: string;
  userId: string;
  userMessage: string;
  reply: string;
  intent: string;
  entities: string[];
  confidence: number;
  handoffSuggested: boolean;
  handoffTriggered: boolean;
  latencyMs: number;
  provider: string;
  model: string;
  cards: Array<Record<string, unknown>>;
  suggestions: string[];
  actions: Array<Record<string, unknown>>;
  createdAt: string;
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

export interface TejoSettings {
  enabled: boolean;
  webPilotEnabled: boolean;
  providerOrder: string[];
  threshold: number;
  geminiChatModel: string;
  geminiEmbeddingModel: string;
  geminiBaseUrl: string;
  hasGeminiApiKey: boolean;
  queue?: Record<string, number>;
}

export interface TejoKnowledge {
  _id: string;
  key: string;
  text: string;
  locale: string;
  model: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface TejoKnowledgeList {
  data: TejoKnowledge[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateTejoPromptRequest {
  name: string;
  body: string;
  modelHint?: string;
  metadata?: Record<string, unknown>;
  activate?: boolean;
}

export interface UpdateTejoPromptRequest {
  name?: string;
  body?: string;
  modelHint?: string;
  metadata?: Record<string, unknown>;
  status?: TejoPromptStatus;
  activate?: boolean;
}

export interface CreateTejoKnowledgeRequest {
  key: string;
  text: string;
  locale?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateTejoKnowledgeRequest {
  text?: string;
  locale?: string;
  metadata?: Record<string, unknown>;
}
