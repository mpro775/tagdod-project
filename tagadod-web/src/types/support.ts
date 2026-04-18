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
  ticketId?: string
  message: string
  channel: string
  locale?: string
  context?: Record<string, unknown>
}

export interface TejoQueryResponse {
  reply: string
  cards: Array<Record<string, unknown>>
  suggestions: string[]
  actions: Array<Record<string, unknown>>
  confidence: number
  handoffSuggested: boolean
  ticketId: string
  messageId: string
  latencyMs: number
}
