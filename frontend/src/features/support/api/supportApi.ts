import { apiClient } from '@/core/api/client';
import type {
  SupportTicket,
  SupportMessage,
  ListTicketsParams,
  UpdateSupportTicketDto,
  AddSupportMessageDto,
  SupportStats,
} from '../types/support.types';
import type { PaginatedResponse } from '@/shared/types/common.types';

export const supportApi = {
  /**
   * List tickets
   */
  list: async (params: ListTicketsParams): Promise<PaginatedResponse<SupportTicket>> => {
    const response = await apiClient.get<{ data: PaginatedResponse<SupportTicket> }>(
      '/admin/support/tickets',
      { params }
    );
    return response.data.data;
  },

  /**
   * Get ticket by ID
   */
  getById: async (id: string): Promise<SupportTicket> => {
    const response = await apiClient.get<{ data: SupportTicket }>(
      `/admin/support/tickets/${id}`
    );
    return response.data.data;
  },

  /**
   * Update ticket
   */
  update: async (id: string, data: UpdateSupportTicketDto): Promise<SupportTicket> => {
    const response = await apiClient.put<{ data: SupportTicket }>(
      `/admin/support/tickets/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Get ticket messages
   */
  getMessages: async (ticketId: string, page = 1, limit = 50): Promise<PaginatedResponse<SupportMessage>> => {
    const response = await apiClient.get<{ data: PaginatedResponse<SupportMessage> }>(
      `/admin/support/tickets/${ticketId}/messages`,
      { params: { page, limit } }
    );
    return response.data.data;
  },

  /**
   * Add message to ticket
   */
  addMessage: async (ticketId: string, data: AddSupportMessageDto): Promise<SupportMessage> => {
    const response = await apiClient.post<{ data: SupportMessage }>(
      `/admin/support/tickets/${ticketId}/messages`,
      data
    );
    return response.data.data;
  },

  /**
   * Get statistics
   */
  getStats: async (): Promise<SupportStats> => {
    const response = await apiClient.get<{ data: SupportStats }>('/admin/support/stats');
    return response.data.data;
  },
};

