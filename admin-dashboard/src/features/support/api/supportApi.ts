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
  createTicket: async (data: CreateSupportTicketDto): Promise<SupportTicket> => {
    const response = await apiClient.post<ApiResponse<SupportTicket>>(
      '/support/tickets',
      data
    );
    return response.data.data;
  },

  /**
   * List all tickets (Admin only) - includes lastMessage
   */
  getTickets: async (params: ListTicketsParams): Promise<PaginatedResponse<SupportTicket>> => {
    const response = await apiClient.get<ApiResponse<{
      tickets: SupportTicket[];
      total: number;
      page: number;
      totalPages: number;
      limit?: number;
      skip?: number;
      hasMore?: boolean;
    }>>(
      '/admin/support/tickets',
      { params }
    );
    
    const responseData = response.data.data;
    
    return {
      data: responseData.tickets,
      meta: {
        page: responseData.page || (responseData.skip !== undefined && responseData.limit 
          ? Math.floor(responseData.skip / responseData.limit) + 1 
          : 1),
        limit: responseData.limit || params.limit || 20,
        total: responseData.total,
        totalPages: responseData.totalPages || (responseData.limit 
          ? Math.ceil(responseData.total / responseData.limit) 
          : 1),
      },
    };
  },

  /**
   * Get ticket by ID (Admin only)
   */
  getTicketById: async (id: string): Promise<SupportTicket> => {
    const response = await apiClient.get<ApiResponse<SupportTicket>>(
      `/admin/support/tickets/${id}`
    );
    return response.data.data;
  },

  /**
   * Update ticket (Admin only)
   */
  updateTicket: async (id: string, data: UpdateSupportTicketDto): Promise<SupportTicket> => {
    const response = await apiClient.patch<ApiResponse<SupportTicket>>(
      `/admin/support/tickets/${id}`,
      data
    );
    return response.data.data;
  },

  // ==================== Support Messages ====================
  
  /**
   * Get ticket messages (Admin only)
   */
  getTicketMessages: async (
    ticketId: string, 
    page = 1, 
    limit = 50
  ): Promise<PaginatedResponse<SupportMessage>> => {
    const response = await apiClient.get<ApiResponse<{
      messages: SupportMessage[];
      total: number;
      page: number;
      totalPages: number;
      limit?: number;
      skip?: number;
      hasMore?: boolean;
    }>>(
      `/admin/support/tickets/${ticketId}/messages`,
      { params: { page, limit } }
    );
    
    const responseData = response.data.data;
    
    return {
      data: responseData.messages,
      meta: {
        page: responseData.page || (responseData.skip !== undefined && responseData.limit 
          ? Math.floor(responseData.skip / responseData.limit) + 1 
          : page),
        limit: responseData.limit || limit,
        total: responseData.total,
        totalPages: responseData.totalPages || (responseData.limit 
          ? Math.ceil(responseData.total / responseData.limit) 
          : 1),
      },
    };
  },

  /**
   * Add message to ticket (Admin only)
   */
  addMessageToTicket: async (
    ticketId: string, 
    data: AddSupportMessageDto
  ): Promise<SupportMessage> => {
    const response = await apiClient.post<ApiResponse<SupportMessage>>(
      `/admin/support/tickets/${ticketId}/messages`,
      data
    );
    return response.data.data;
  },

  // ==================== Support Statistics ====================
  
  /**
   * Get support statistics (Admin only)
   */
  getSupportStats: async (): Promise<SupportStats> => {
    const response = await apiClient.get<ApiResponse<SupportStats>>('/admin/support/stats');
    return response.data.data;
  },

  // ==================== SLA Management ====================
  
  /**
   * Get tickets with breached SLA (Admin only)
   */
  getBreachedSLATickets: async (): Promise<BreachedSLATicketsResponse> => {
    const response = await apiClient.get<ApiResponse<BreachedSLATicketsResponse>>(
      '/admin/support/sla/breached'
    );
    return response.data.data;
  },

  /**
   * Check SLA status for a specific ticket (Admin only)
   */
  checkSLAStatus: async (ticketId: string): Promise<SLAStatusResponse> => {
    const response = await apiClient.post<ApiResponse<SLAStatusResponse>>(
      `/admin/support/sla/${ticketId}/check`
    );
    return response.data.data;
  },

  // ==================== Canned Responses ====================
  
  /**
   * Create canned response (Admin only)
   */
  createCannedResponse: async (data: CreateCannedResponseDto): Promise<CannedResponse> => {
    const response = await apiClient.post<ApiResponse<CannedResponse>>(
      '/admin/support/canned-responses',
      data
    );
    return response.data.data;
  },

  /**
   * Get all canned responses (Admin only)
   */
  getCannedResponses: async (
    params: ListCannedResponsesParams
  ): Promise<PaginatedResponse<CannedResponse>> => {
    const response = await apiClient.get<ApiResponse<{
      responses: CannedResponse[];
      total: number;
      limit: number;
      skip: number;
      hasMore: boolean;
    }>>(
      '/admin/support/canned-responses',
      { params }
    );
    return {
      data: response.data.data.responses,
      meta: {
        page: Math.floor(response.data.data.skip / response.data.data.limit) + 1,
        limit: response.data.data.limit,
        total: response.data.data.total,
        totalPages: Math.ceil(response.data.data.total / response.data.data.limit),
      },
    };
  },

  /**
   * Get canned response by ID (Admin only)
   */
  getCannedResponseById: async (id: string): Promise<CannedResponse> => {
    const response = await apiClient.get<ApiResponse<CannedResponse>>(
      `/admin/support/canned-responses/${id}`
    );
    return response.data.data;
  },

  /**
   * Update canned response (Admin only)
   */
  updateCannedResponse: async (
    id: string, 
    data: UpdateCannedResponseDto
  ): Promise<CannedResponse> => {
    const response = await apiClient.patch<ApiResponse<CannedResponse>>(
      `/admin/support/canned-responses/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Use canned response (increment usage count) (Admin only)
   */
  useCannedResponse: async (id: string): Promise<CannedResponse> => {
    const response = await apiClient.post<ApiResponse<CannedResponse>>(
      `/admin/support/canned-responses/${id}/use`
    );
    return response.data.data;
  },

  /**
   * Get canned response by shortcut (Admin only)
   */
  getCannedResponseByShortcut: async (shortcut: string): Promise<CannedResponse> => {
    const response = await apiClient.get<ApiResponse<CannedResponse>>(
      `/admin/support/canned-responses/shortcut/${shortcut}`
    );
    return response.data.data;
  },
};

