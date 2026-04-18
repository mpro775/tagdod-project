import { api } from './api'
import type {
  CreateTicketRequest,
  SendMessageRequest,
  SupportMessage,
  SupportTicket,
  TejoQueryRequest,
  TejoQueryResponse,
} from '../types/support'
import type { ApiResponse, PaginatedResponse, PaginationParams } from '../types/common'

const normalizeStatus = (status: unknown): SupportTicket['status'] => {
  if (status === 'in_progress') return 'inProgress'
  if (status === 'waiting_for_user') return 'waitingForUser'
  if (status === 'open' || status === 'resolved' || status === 'closed') return status
  if (status === 'inProgress' || status === 'waitingForUser') return status
  return 'open'
}

const normalizeMessageType = (messageType: unknown): SupportMessage['type'] => {
  if (typeof messageType !== 'string') return 'systemMessage'

  const map: Record<string, SupportMessage['type']> = {
    userMessage: 'userMessage',
    adminReply: 'adminReply',
    systemMessage: 'systemMessage',
    user_message: 'userMessage',
    admin_reply: 'adminReply',
    system_message: 'systemMessage',
    ai_reply: 'ai_reply',
    ai_action: 'ai_action',
    ai_handoff: 'ai_handoff',
  }

  return map[messageType] || 'systemMessage'
}

const normalizeTicket = (ticket: Record<string, unknown>): SupportTicket => {
  const id = String(ticket.id || ticket._id || '')
  const lastMessageObj = (ticket.lastMessage || null) as Record<string, unknown> | null

  return {
    ...(ticket as unknown as SupportTicket),
    id,
    _id: String(ticket._id || id),
    title: String(ticket.title || ''),
    status: normalizeStatus(ticket.status),
    lastMessage:
      typeof ticket.lastMessage === 'string'
        ? ticket.lastMessage
        : typeof lastMessageObj?.content === 'string'
          ? lastMessageObj.content
          : undefined,
    lastMessageAt:
      (ticket.lastMessageAt as string | undefined) ||
      (typeof lastMessageObj?.createdAt === 'string' ? (lastMessageObj.createdAt as string) : undefined),
    createdAt: String(ticket.createdAt || new Date().toISOString()),
    updatedAt: String(ticket.updatedAt || ticket.createdAt || new Date().toISOString()),
  }
}

const normalizeMessage = (message: Record<string, unknown>): SupportMessage => {
  const id = String(message.id || message._id || '')

  return {
    ...(message as unknown as SupportMessage),
    id,
    _id: String(message._id || id),
    ticketId: String(message.ticketId || ''),
    content: String(message.content || ''),
    type: normalizeMessageType(message.type || message.messageType),
    messageType: normalizeMessageType(message.type || message.messageType),
    senderName:
      typeof message.senderName === 'string'
        ? message.senderName
        : typeof message.senderId === 'object' && message.senderId !== null
          ? String((message.senderId as Record<string, unknown>).name || '')
          : undefined,
    payload:
      typeof message.payload === 'object' && message.payload !== null
        ? (message.payload as Record<string, unknown>)
        : null,
    createdAt: String(message.createdAt || new Date().toISOString()),
    updatedAt: typeof message.updatedAt === 'string' ? message.updatedAt : undefined,
  }
}

const normalizeTicketListResponse = (
  raw: Record<string, unknown>,
): PaginatedResponse<SupportTicket> => {
  const dataNode = (raw.data || raw) as Record<string, unknown>
  const meta = (dataNode.meta || {}) as Record<string, unknown>
  const tickets = (dataNode.tickets || dataNode.data || []) as Array<Record<string, unknown>>
  const total = Number(dataNode.total || 0)
  const page = Number(dataNode.page || 1)
  const limit = Number(dataNode.limit || meta.limit || 10)
  const totalPages = Number(dataNode.totalPages || Math.ceil(total / Math.max(limit, 1)))

  return {
    data: tickets.map(normalizeTicket),
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  }
}

const normalizeMessageListResponse = (
  raw: Record<string, unknown>,
): PaginatedResponse<SupportMessage> => {
  const dataNode = (raw.data || raw) as Record<string, unknown>
  const meta = (dataNode.meta || {}) as Record<string, unknown>
  const messages = (dataNode.messages || dataNode.data || []) as Array<Record<string, unknown>>
  const total = Number(dataNode.total || 0)
  const page = Number(dataNode.page || 1)
  const limit = Number(dataNode.limit || meta.limit || 50)
  const totalPages = Number(dataNode.totalPages || Math.ceil(total / Math.max(limit, 1)))

  return {
    data: messages.map(normalizeMessage),
    meta: {
      page,
      limit,
      total,
      totalPages,
    },
  }
}

export async function createTicket(body: CreateTicketRequest): Promise<SupportTicket> {
  const payload = {
    title: body.title,
    description: body.message,
    category: body.category,
    priority: body.priority,
    channel: body.channel || 'web',
  }

  const { data } = await api.post<ApiResponse<Record<string, unknown>>>('/support/tickets', payload)
  return normalizeTicket((data.data || {}) as Record<string, unknown>)
}

export async function getMyTickets(params?: PaginationParams): Promise<PaginatedResponse<SupportTicket>> {
  const { data } = await api.get<Record<string, unknown>>('/support/tickets/my', { params })
  return normalizeTicketListResponse(data)
}

export async function getTicket(ticketId: string): Promise<SupportTicket> {
  const { data } = await api.get<ApiResponse<Record<string, unknown>>>(`/support/tickets/${ticketId}`)
  return normalizeTicket((data.data || {}) as Record<string, unknown>)
}

export async function getTicketMessages(
  ticketId: string,
  params?: PaginationParams,
): Promise<PaginatedResponse<SupportMessage>> {
  const { data } = await api.get<Record<string, unknown>>(`/support/tickets/${ticketId}/messages`, { params })
  return normalizeMessageListResponse(data)
}

export async function sendMessage(ticketId: string, body: SendMessageRequest): Promise<SupportMessage> {
  const { data } = await api.post<ApiResponse<Record<string, unknown>>>(`/support/tickets/${ticketId}/messages`, body)
  return normalizeMessage((data.data || {}) as Record<string, unknown>)
}

export async function queryTejo(body: TejoQueryRequest): Promise<TejoQueryResponse> {
  const { data } = await api.post<ApiResponse<TejoQueryResponse>>('/tejo/query', body)
  return data.data
}

export async function archiveTicket(ticketId: string): Promise<void> {
  await api.put(`/support/tickets/${ticketId}/archive`)
}
