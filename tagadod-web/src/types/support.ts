import type { SupportCategory, SupportPriority, SupportStatus, MessageType } from './enums'

export interface SupportTicket {
  id: string
  title: string
  category?: SupportCategory
  priority?: SupportPriority
  status: SupportStatus
  lastMessage?: string
  lastMessageAt?: string
  unreadCount?: number
  createdAt: string
  updatedAt: string
}

export interface SupportMessage {
  id: string
  ticketId: string
  content: string
  type: MessageType
  senderName?: string
  createdAt: string
}

export interface CreateTicketRequest {
  title: string
  message: string
  category?: SupportCategory
  priority?: SupportPriority
}

export interface SendMessageRequest {
  content: string
}
