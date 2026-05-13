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
  chatProviderOrder: string[];
  embeddingProviderOrder: string[];
  threshold: number;
  tenantId: string;
  geminiChatModel: string;
  geminiEmbeddingModel: string;
  geminiBaseUrl: string;
  hasGeminiApiKey: boolean;
  embeddingProvider: string;
  embeddingUrl: string;
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
  queue?: Record<string, number>;
}

export interface TejoDiagnosticsResult {
  status: string;
  provider?: string;
  model?: string;
  dimension?: number;
  latencyMs?: number;
  collection?: string;
  exists?: boolean;
  vectorSize?: number;
  results?: Array<{
    score: number;
    sourceType?: unknown;
    sourceId?: unknown;
    text: string;
  }>;
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

export type TejoSessionStatus = 'active' | 'resolved' | 'escalation_suggested' | 'escalated' | 'closed';

export interface TejoSession {
  _id: string;
  userId: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  } | string;
  channel: string;
  status: TejoSessionStatus;
  locale: string;
  storefrontHost?: string;
  supportTicketId?: {
    _id: string;
    title?: string;
    status?: string;
  } | string | null;
  lastMessageAt?: string;
  messageCount: number;
  handoffSuggested: boolean;
  handoffTriggered: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface TejoSessionStats {
  total: number;
  active: number;
  escalated: number;
  escalationSuggested: number;
  resolved: number;
  closed: number;
}

export interface TejoSessionMessage {
  _id: string;
  sessionId: string;
  userId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, unknown>;
  payload?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}
