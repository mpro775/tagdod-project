import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ErrorHandler } from '@/core/error/ErrorHandler';
import { tejoApi } from '../api/tejoApi';
import type {
  CreateTejoKnowledgeRequest,
  CreateTejoPromptRequest,
  UpdateTejoKnowledgeRequest,
  UpdateTejoPromptRequest,
} from '../types/tejo.types';

const TEJO_KEY = 'tejo';

export const useTejoPrompts = () => {
  return useQuery({
    queryKey: [TEJO_KEY, 'prompts'],
    queryFn: tejoApi.getPrompts,
  });
};

export const useCreateTejoPrompt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTejoPromptRequest) => tejoApi.createPrompt(payload),
    onSuccess: () => {
      toast.success('Tejo prompt created');
      queryClient.invalidateQueries({ queryKey: [TEJO_KEY, 'prompts'] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useUpdateTejoPrompt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTejoPromptRequest }) =>
      tejoApi.updatePrompt(id, payload),
    onSuccess: () => {
      toast.success('Tejo prompt updated');
      queryClient.invalidateQueries({ queryKey: [TEJO_KEY, 'prompts'] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useTejoTriggerReindex = () => {
  return useMutation({
    mutationFn: ({ scope, full }: { scope: 'products' | 'kb' | 'all'; full: boolean }) =>
      tejoApi.triggerReindex(scope, full),
    onSuccess: () => {
      toast.success('Reindex job started');
    },
    onError: ErrorHandler.showError,
  });
};

export const useTejoAnalyticsOverview = () => {
  return useQuery({
    queryKey: [TEJO_KEY, 'analytics', 'overview'],
    queryFn: tejoApi.getAnalyticsOverview,
  });
};

export const useTejoAnalyticsQuality = () => {
  return useQuery({
    queryKey: [TEJO_KEY, 'analytics', 'quality'],
    queryFn: tejoApi.getAnalyticsQuality,
  });
};

export const useTejoAnalyticsVolume = () => {
  return useQuery({
    queryKey: [TEJO_KEY, 'analytics', 'volume'],
    queryFn: tejoApi.getAnalyticsVolume,
  });
};

export const useTejoConversations = (page = 1, limit = 20) => {
  return useQuery({
    queryKey: [TEJO_KEY, 'conversations', page, limit],
    queryFn: () => tejoApi.getConversations(page, limit),
    placeholderData: (prev) => prev,
  });
};

export const useTejoConversation = (id: string) => {
  return useQuery({
    queryKey: [TEJO_KEY, 'conversations', id],
    queryFn: () => tejoApi.getConversationById(id),
    enabled: Boolean(id),
  });
};

export const useTejoKnowledge = (page = 1, limit = 20, q?: string) => {
  return useQuery({
    queryKey: [TEJO_KEY, 'knowledge', page, limit, q || ''],
    queryFn: () => tejoApi.getKnowledge(page, limit, q),
    placeholderData: (prev) => prev,
  });
};

export const useCreateTejoKnowledge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTejoKnowledgeRequest) => tejoApi.createKnowledge(payload),
    onSuccess: () => {
      toast.success('Knowledge entry created');
      queryClient.invalidateQueries({ queryKey: [TEJO_KEY, 'knowledge'] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useUpdateTejoKnowledge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, payload }: { key: string; payload: UpdateTejoKnowledgeRequest }) =>
      tejoApi.updateKnowledge(key, payload),
    onSuccess: () => {
      toast.success('Knowledge entry updated');
      queryClient.invalidateQueries({ queryKey: [TEJO_KEY, 'knowledge'] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useDeleteTejoKnowledge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (key: string) => tejoApi.deleteKnowledge(key),
    onSuccess: () => {
      toast.success('Knowledge entry deleted');
      queryClient.invalidateQueries({ queryKey: [TEJO_KEY, 'knowledge'] });
    },
    onError: ErrorHandler.showError,
  });
};

export const useTejoSettings = () => {
  return useQuery({
    queryKey: [TEJO_KEY, 'settings'],
    queryFn: tejoApi.getSettings,
  });
};

export const useUpdateTejoSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: tejoApi.updateSettings,
    onSuccess: () => {
      toast.success('Tejo settings updated');
      queryClient.invalidateQueries({ queryKey: [TEJO_KEY, 'settings'] });
    },
    onError: ErrorHandler.showError,
  });
};
