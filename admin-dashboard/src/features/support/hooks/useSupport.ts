import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supportApi } from '../api/supportApi';
import { ErrorHandler } from '@/core/error/ErrorHandler';
import toast from 'react-hot-toast';
import type {
  ListTicketsParams,
  ListCannedResponsesParams,
  CreateSupportTicketDto,
  UpdateSupportTicketDto,
  AddSupportMessageDto,
  CreateCannedResponseDto,
  UpdateCannedResponseDto,
} from '../types/support.types';

const SUPPORT_KEY = 'support';

// ==================== Support Tickets Hooks ====================

export const useCreateSupportTicket = () => {
  return useMutation({
    mutationFn: (data: CreateSupportTicketDto) => supportApi.createTicket(data),
    onSuccess: () => {
      toast.success('تم إرسال طلب الدعم بنجاح');
    },
    onError: ErrorHandler.showError,
  });
};

export const useSupportTickets = (params: ListTicketsParams) => {
  return useQuery({
    queryKey: [SUPPORT_KEY, 'tickets', params],
    queryFn: () => supportApi.getTickets(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useUnreadSupportCount = (refetchInterval = 60000) => {
  return useQuery({
    queryKey: [SUPPORT_KEY, 'unread-count'],
    queryFn: () => supportApi.getUnreadSupportCount(),
    refetchInterval,
  });
};

export const useMarkTicketMessagesAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ticketId: string) => supportApi.markTicketMessagesAsRead(ticketId),
    onSuccess: (_, ticketId) => {
      queryClient.invalidateQueries({ queryKey: [SUPPORT_KEY, 'unread-count'] });
      queryClient.invalidateQueries({ queryKey: [SUPPORT_KEY, 'messages', ticketId] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useSupportTicket = (id: string) => {
  return useQuery({
    queryKey: [SUPPORT_KEY, 'tickets', id],
    queryFn: () => supportApi.getTicketById(id),
    enabled: !!id,
  });
};

export const useUpdateSupportTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSupportTicketDto }) =>
      supportApi.updateTicket(id, data),
    onSuccess: () => {
      toast.success('تم تحديث التذكرة بنجاح');
      queryClient.invalidateQueries({ queryKey: [SUPPORT_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

// ==================== Support Messages Hooks ====================

export const useTicketMessages = (ticketId: string, page = 1, limit = 50) => {
  return useQuery({
    queryKey: [SUPPORT_KEY, 'messages', ticketId, page, limit],
    queryFn: () => supportApi.getTicketMessages(ticketId, page, limit),
    enabled: !!ticketId,
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });
};

export const useAddMessageToTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, data }: { ticketId: string; data: AddSupportMessageDto }) =>
      supportApi.addMessageToTicket(ticketId, data),
    onSuccess: () => {
      toast.success('تم إرسال الرسالة بنجاح');
      queryClient.invalidateQueries({ queryKey: [SUPPORT_KEY, 'messages'] });
    },
    onError: ErrorHandler.showError,
  });
};

// ==================== Support Statistics Hooks ====================

export const useSupportStats = () => {
  return useQuery({
    queryKey: [SUPPORT_KEY, 'stats'],
    queryFn: () => supportApi.getSupportStats(),
  });
};

// ==================== SLA Management Hooks ====================

export const useBreachedSLATickets = () => {
  return useQuery({
    queryKey: [SUPPORT_KEY, 'sla', 'breached'],
    queryFn: () => supportApi.getBreachedSLATickets(),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

export const useCheckSLAStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ticketId: string) => supportApi.checkSLAStatus(ticketId),
    onSuccess: () => {
      toast.success('تم فحص حالة SLA بنجاح');
      queryClient.invalidateQueries({ queryKey: [SUPPORT_KEY, 'sla'] });
    },
    onError: ErrorHandler.showError,
  });
};

// ==================== Canned Responses Hooks ====================

export const useCannedResponses = (params: ListCannedResponsesParams) => {
  return useQuery({
    queryKey: [SUPPORT_KEY, 'canned-responses', params],
    queryFn: () => supportApi.getCannedResponses(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useCannedResponse = (id: string) => {
  return useQuery({
    queryKey: [SUPPORT_KEY, 'canned-responses', id],
    queryFn: () => supportApi.getCannedResponseById(id),
    enabled: !!id,
  });
};

export const useCreateCannedResponse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCannedResponseDto) => supportApi.createCannedResponse(data),
    onSuccess: () => {
      toast.success('تم إنشاء الرد الجاهز بنجاح');
      queryClient.invalidateQueries({ queryKey: [SUPPORT_KEY, 'canned-responses'] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useUpdateCannedResponse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCannedResponseDto }) =>
      supportApi.updateCannedResponse(id, data),
    onSuccess: () => {
      toast.success('تم تحديث الرد الجاهز بنجاح');
      queryClient.invalidateQueries({ queryKey: [SUPPORT_KEY, 'canned-responses'] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useUseCannedResponse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => supportApi.useCannedResponse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUPPORT_KEY, 'canned-responses'] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useCannedResponseByShortcut = (shortcut: string) => {
  return useQuery({
    queryKey: [SUPPORT_KEY, 'canned-responses', 'shortcut', shortcut],
    queryFn: () => supportApi.getCannedResponseByShortcut(shortcut),
    enabled: !!shortcut,
  });
};

