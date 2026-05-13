import type { SupportCategory, SupportPriority, SupportStatus, MessageType } from './enums'

export interface SupportTicket {
  id: string
  _id?: string
  title: string
  category?: SupportCategory
  priority?: SupportPriority
  status: SupportStatus
  channel?: string
  isAiHandled?: boolean
  aiStatus?: string
  handoffReason?: string
  lastMessage?: string
  lastMessageAt?: string
  unreadCount?: number
  createdAt: string
  updatedAt: string
}

export interface SupportMessage {
  id: string
  _id?: string
  ticketId: string
  content: string
  type: MessageType
  messageType?: MessageType
  payload?: Record<string, unknown> | null
  senderName?: string
  createdAt: string
  updatedAt?: string
}

export interface CreateTicketRequest {
  title: string
  message: string
  channel?: string
  category?: SupportCategory
  priority?: SupportPriority
}

export interface SendMessageRequest {
  content: string
  payload?: Record<string, unknown>
}

export interface TejoQueryRequest {
  sessionId?: string
  message: string
  channel: 'web' | 'mobile' | 'whatsapp' | 'messenger' | 'instagram'
  locale?: string
  context?: Record<string, unknown>
}

export interface TejoAction {
  type: string
  label: string
}

export interface TejoQueryResponse {
  reply: string
  cards: Array<Record<string, unknown>>
  suggestions: string[]
  actions: TejoAction[]
  confidence: number
  handoffSuggested: boolean
  sessionId: string
  ticketId?: string | null
  messageId: string
  latencyMs: number
  status?: string
}

export interface TejoSession {
  id: string
  _id?: string
  userId: string
  channel: string
  status: 'active' | 'resolved' | 'escalation_suggested' | 'escalated' | 'closed'
  locale: string
  title?: string
  lastMessagePreview?: string
  supportTicketId?: string | null
  lastMessageAt?: string
  messageCount: number
  handoffSuggested: boolean
  handoffTriggered: boolean
  createdAt: string
  updatedAt: string
}

export interface TejoMessage {
  id: string
  sessionId: string
  userId: string
  role: 'user' | 'assistant' | 'system'
  content: string
  metadata?: Record<string, unknown>
  payload?: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}
