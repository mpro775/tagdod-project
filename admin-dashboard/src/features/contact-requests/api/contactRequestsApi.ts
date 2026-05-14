import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/shared/types/common.types';
import type {
  ContactRequest,
  UpdateContactRequestStatusDto,
  AssignContactRequestDto,
  AddNoteDto,
  ListContactRequestsParams,
} from '../types/contact-request.types';

export const contactRequestsApi = {
  list: async (params: ListContactRequestsParams = {}): Promise<{ data: ContactRequest[]; meta: any }> => {
    const response = await apiClient.get<ApiResponse<{ requests: ContactRequest[]; pagination: any }>>('/admin/contact-requests', { params });
    return { data: response.data.data.requests, meta: response.data.data.pagination };
  },
  getById: async (id: string): Promise<ContactRequest> => {
    const response = await apiClient.get<ApiResponse<ContactRequest>>(`/admin/contact-requests/${id}`);
    return response.data.data;
  },
  updateStatus: async (id: string, data: UpdateContactRequestStatusDto): Promise<ContactRequest> => {
    const response = await apiClient.patch<ApiResponse<ContactRequest>>(`/admin/contact-requests/${id}/status`, data);
    return response.data.data;
  },
  assign: async (id: string, data: AssignContactRequestDto): Promise<ContactRequest> => {
    const response = await apiClient.patch<ApiResponse<ContactRequest>>(`/admin/contact-requests/${id}/assign`, data);
    return response.data.data;
  },
  addNote: async (id: string, data: AddNoteDto): Promise<ContactRequest> => {
    const response = await apiClient.patch<ApiResponse<ContactRequest>>(`/admin/contact-requests/${id}/note`, data);
    return response.data.data;
  },
  delete: async (id: string): Promise<void> => { await apiClient.delete(`/admin/contact-requests/${id}`); },
};
