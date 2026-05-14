import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { contactRequestsApi } from '../api/contactRequestsApi';
import { ErrorHandler } from '@/core/error/ErrorHandler';
import toast from 'react-hot-toast';
import type { ListContactRequestsParams, UpdateContactRequestStatusDto, AssignContactRequestDto, AddNoteDto } from '../types/contact-request.types';

const CONTACT_REQUESTS_KEY = 'contact-requests';

export const useContactRequests = (params: ListContactRequestsParams = {}) => {
  return useQuery({ queryKey: [CONTACT_REQUESTS_KEY, 'list', params], queryFn: () => contactRequestsApi.list(params), staleTime: 2 * 60 * 1000, retry: 2 });
};
export const useContactRequest = (id: string) => {
  return useQuery({ queryKey: [CONTACT_REQUESTS_KEY, 'single', id], queryFn: () => contactRequestsApi.getById(id), enabled: !!id });
};
export const useUpdateContactRequestStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: UpdateContactRequestStatusDto }) => contactRequestsApi.updateStatus(id, data), onSuccess: () => { toast.success('تم تحديث حالة الطلب'); queryClient.invalidateQueries({ queryKey: [CONTACT_REQUESTS_KEY] }); }, onError: (error) => { ErrorHandler.showError(error); } });
};
export const useAssignContactRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: AssignContactRequestDto }) => contactRequestsApi.assign(id, data), onSuccess: () => { toast.success('تم إسناد الطلب'); queryClient.invalidateQueries({ queryKey: [CONTACT_REQUESTS_KEY] }); }, onError: (error) => { ErrorHandler.showError(error); } });
};
export const useAddContactRequestNote = () => {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: ({ id, data }: { id: string; data: AddNoteDto }) => contactRequestsApi.addNote(id, data), onSuccess: () => { toast.success('تم إضافة الملاحظة'); queryClient.invalidateQueries({ queryKey: [CONTACT_REQUESTS_KEY] }); }, onError: (error) => { ErrorHandler.showError(error); } });
};
export const useDeleteContactRequest = () => {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn: (id: string) => contactRequestsApi.delete(id), onSuccess: () => { toast.success('تم حذف الطلب'); queryClient.invalidateQueries({ queryKey: [CONTACT_REQUESTS_KEY] }); }, onError: (error) => { ErrorHandler.showError(error); } });
};
