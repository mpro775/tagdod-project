import { apiClient } from '@/core/api/client';
import type { ApiResponse } from '@/shared/types/common.types';
import type {
  Project,
  CreateProjectDto,
  UpdateProjectDto,
  ListProjectsParams,
  ProjectStats,
} from '../types/project.types';

export const projectsApi = {
  create: async (data: CreateProjectDto): Promise<Project> => {
    const response = await apiClient.post<ApiResponse<Project>>('/admin/projects', data);
    return response.data.data;
  },

  list: async (params: ListProjectsParams = {}): Promise<{ data: Project[]; meta: any }> => {
    const response = await apiClient.get<ApiResponse<{ projects: Project[]; pagination: any }>>('/admin/projects', { params });
    return {
      data: response.data.data.projects,
      meta: response.data.data.pagination,
    };
  },

  getById: async (id: string): Promise<Project> => {
    const response = await apiClient.get<ApiResponse<Project>>(`/admin/projects/${id}`);
    return response.data.data;
  },

  update: async (id: string, data: UpdateProjectDto): Promise<Project> => {
    const response = await apiClient.patch<ApiResponse<Project>>(`/admin/projects/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/projects/${id}`);
  },

  togglePublish: async (id: string): Promise<Project> => {
    const response = await apiClient.patch<ApiResponse<Project>>(`/admin/projects/${id}/toggle-publish`);
    return response.data.data;
  },

  toggleLanding: async (id: string): Promise<Project> => {
    const response = await apiClient.patch<ApiResponse<Project>>(`/admin/projects/${id}/toggle-landing`);
    return response.data.data;
  },

  toggleFeatured: async (id: string): Promise<Project> => {
    const response = await apiClient.patch<ApiResponse<Project>>(`/admin/projects/${id}/toggle-featured`);
    return response.data.data;
  },

  reorder: async (projects: { id: string; landingOrder: number }[]): Promise<Project[]> => {
    const response = await apiClient.patch<ApiResponse<Project[]>>('/admin/projects/reorder', { projects });
    return response.data.data;
  },

  getStats: async (): Promise<ProjectStats> => {
    const response = await apiClient.get<ApiResponse<ProjectStats>>('/admin/projects/stats');
    return response.data.data;
  },
};
