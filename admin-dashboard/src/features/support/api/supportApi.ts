import { apiClient } from '@/core/api/client';
import type {
  SupportTicket,
  SupportMessage,
  CannedResponse,
  ListTicketsParams,
  ListCannedResponsesParams,
  CreateSupportTicketDto,
  UpdateSupportTicketDto,
  AddSupportMessageDto,
  CreateCannedResponseDto,
  UpdateCannedResponseDto,
  SupportStats,
  SLAStatusResponse,
  BreachedSLATicketsResponse,
} from '../types/support.types';
import type { PaginatedResponse, ApiResponse } from '@/shared/types/common.types';

export const supportApi = {
  // ==================== Support Tickets ====================
  
  /**
   * Create new support ticket
   */
  createTicket: async (data: CreateSupportTicketDto): Promise<ApiResponse<SupportTicket>> => {
    const response = await apiClient.post<ApiResponse<SupportTicket>>(
      '/support/tickets',
      data
    );
    return response.data;
  },

  /**
   * List all tickets (Admin only)
   */
  getTickets: async (params: ListTicketsParams): Promise<ApiResponse<PaginatedResponse<SupportTicket>>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<SupportTicket>>>(
      '/admin/support/tickets',
      { params }
    );
    return response.data;
  },

  /**
   * Get ticket by ID (Admin only)
   */
  getTicketById: async (id: string): Promise<ApiResponse<SupportTicket>> => {
    const response = await apiClient.get<ApiResponse<SupportTicket>>(
      `/admin/support/tickets/${id}`
    );
    return response.data;
  },

  /**
   * Update ticket (Admin only)
   */
  updateTicket: async (id: string, data: UpdateSupportTicketDto): Promise<ApiResponse<SupportTicket>> => {
    const response = await apiClient.patch<ApiResponse<SupportTicket>>(
      `/admin/support/tickets/${id}`,
      data
    );
    return response.data;
  },

  // ==================== Support Messages ====================
  
  /**
   * Get ticket messages (Admin only)
   */
  getTicketMessages: async (
    ticketId: string, 
    page = 1, 
    limit = 50
  ): Promise<ApiResponse<PaginatedResponse<SupportMessage>>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<SupportMessage>>>(
      `/admin/support/tickets/${ticketId}/messages`,
      { params: { page, limit } }
    );
    return response.data;
  },

  /**
   * Add message to ticket (Admin only)
   */
  addMessageToTicket: async (
    ticketId: string, 
    data: AddSupportMessageDto
  ): Promise<ApiResponse<SupportMessage>> => {
    const response = await apiClient.post<ApiResponse<SupportMessage>>(
      `/admin/support/tickets/${ticketId}/messages`,
      data
    );
    return response.data;
  },

  // ==================== Support Statistics ====================
  
  /**
   * Get support statistics (Admin only)
   */
  getSupportStats: async (): Promise<ApiResponse<SupportStats>> => {
    const response = await apiClient.get<ApiResponse<SupportStats>>('/admin/support/stats');
    return response.data;
  },

  // ==================== SLA Management ====================
  
  /**
   * Get tickets with breached SLA (Admin only)
   */
  getBreachedSLATickets: async (): Promise<ApiResponse<BreachedSLATicketsResponse>> => {
    const response = await apiClient.get<ApiResponse<BreachedSLATicketsResponse>>(
      '/admin/support/sla/breached'
    );
    return response.data;
  },

  /**
   * Check SLA status for a specific ticket (Admin only)
   */
  checkSLAStatus: async (ticketId: string): Promise<ApiResponse<SLAStatusResponse>> => {
    const response = await apiClient.post<ApiResponse<SLAStatusResponse>>(
      `/admin/support/sla/${ticketId}/check`
    );
    return response.data;
  },

  // ==================== Canned Responses ====================
  
  /**
   * Create canned response (Admin only)
   */
  createCannedResponse: async (data: CreateCannedResponseDto): Promise<ApiResponse<CannedResponse>> => {
    const response = await apiClient.post<ApiResponse<CannedResponse>>(
      '/admin/support/canned-responses',
      data
    );
    return response.data;
  },

  /**
   * Get all canned responses (Admin only)
   */
  getCannedResponses: async (
    params: ListCannedResponsesParams
  ): Promise<ApiResponse<PaginatedResponse<CannedResponse>>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<CannedResponse>>>(
      '/admin/support/canned-responses',
      { params }
    );
    return response.data;
  },

  /**
   * Get canned response by ID (Admin only)
   */
  getCannedResponseById: async (id: string): Promise<ApiResponse<CannedResponse>> => {
    const response = await apiClient.get<ApiResponse<CannedResponse>>(
      `/admin/support/canned-responses/${id}`
    );
    return response.data;
  },

  /**
   * Update canned response (Admin only)
   */
  updateCannedResponse: async (
    id: string, 
    data: UpdateCannedResponseDto
  ): Promise<ApiResponse<CannedResponse>> => {
    const response = await apiClient.patch<ApiResponse<CannedResponse>>(
      `/admin/support/canned-responses/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Use canned response (increment usage count) (Admin only)
   */
  useCannedResponse: async (id: string): Promise<ApiResponse<CannedResponse>> => {
    const response = await apiClient.post<ApiResponse<CannedResponse>>(
      `/admin/support/canned-responses/${id}/use`
    );
    return response.data;
  },

  /**
   * Get canned response by shortcut (Admin only)
   */
  getCannedResponseByShortcut: async (shortcut: string): Promise<ApiResponse<CannedResponse>> => {
    const response = await apiClient.get<ApiResponse<CannedResponse>>(
      `/admin/support/canned-responses/shortcut/${shortcut}`
    );
    return response.data;
  },
};

