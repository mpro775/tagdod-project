import { api } from './api'
import type { SupportTicket, SupportMessage, CreateTicketRequest, SendMessageRequest } from '../types/support'
import type { ApiResponse, PaginatedResponse, PaginationParams } from '../types/common'

export async function createTicket(body: CreateTicketRequest): Promise<SupportTicket> {
  const { data } = await api.post<ApiResponse<SupportTicket>>('/support/tickets', body)
  return data.data
}

export async function getMyTickets(params?: PaginationParams): Promise<PaginatedResponse<SupportTicket>> {
  const { data } = await api.get<PaginatedResponse<SupportTicket>>('/support/tickets/my', { params })
  return data
}

export async function getTicket(ticketId: string): Promise<SupportTicket> {
  const { data } = await api.get<ApiResponse<SupportTicket>>(`/support/tickets/${ticketId}`)
  return data.data
}

export async function getTicketMessages(ticketId: string, params?: PaginationParams): Promise<PaginatedResponse<SupportMessage>> {
  const { data } = await api.get<PaginatedResponse<SupportMessage>>(`/support/tickets/${ticketId}/messages`, { params })
  return data
}

export async function sendMessage(ticketId: string, body: SendMessageRequest): Promise<SupportMessage> {
  const { data } = await api.post<ApiResponse<SupportMessage>>(`/support/tickets/${ticketId}/messages`, body)
  return data.data
}

export async function archiveTicket(ticketId: string): Promise<void> {
  await api.put(`/support/tickets/${ticketId}/archive`)
}
