import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supportApi } from '../api/supportApi';
import { ErrorHandler } from '@/core/error/ErrorHandler';
import toast from 'react-hot-toast';
import type {
  ListTicketsParams,
  UpdateSupportTicketDto,
  AddSupportMessageDto,
} from '../types/support.types';

const SUPPORT_KEY = 'support';

export const useSupportTickets = (params: ListTicketsParams) => {
  return useQuery({
    queryKey: [SUPPORT_KEY, 'tickets', params],
    queryFn: () => supportApi.list(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useSupportTicket = (id: string) => {
  return useQuery({
    queryKey: [SUPPORT_KEY, 'tickets', id],
    queryFn: () => supportApi.getById(id),
    enabled: !!id,
  });
};

export const useUpdateTicket = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSupportTicketDto }) =>
      supportApi.update(id, data),
    onSuccess: () => {
      toast.success('تم تحديث التذكرة بنجاح');
      queryClient.invalidateQueries({ queryKey: [SUPPORT_KEY] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useTicketMessages = (ticketId: string, page = 1, limit = 50) => {
  return useQuery({
    queryKey: [SUPPORT_KEY, 'messages', ticketId, page, limit],
    queryFn: () => supportApi.getMessages(ticketId, page, limit),
    enabled: !!ticketId,
    refetchInterval: 5000, // Auto-refresh every 5 seconds
  });
};

export const useAddMessage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, data }: { ticketId: string; data: AddSupportMessageDto }) =>
      supportApi.addMessage(ticketId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SUPPORT_KEY, 'messages'] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useSupportStats = () => {
  return useQuery({
    queryKey: [SUPPORT_KEY, 'stats'],
    queryFn: () => supportApi.getStats(),
  });
};

