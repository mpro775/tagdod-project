import { api } from '../lib/api';
import type {
  LandingHomeResponse,
  ContactRequestPayload,
  ContactRequestResponse,
  ProjectItem,
  ArticleItem,
} from '../types/landing';

export const landingService = {
  getLandingHome: () =>
    api.get<LandingHomeResponse>('/landing/home'),

  submitContactRequest: (payload: ContactRequestPayload) =>
    api.post<ContactRequestResponse>('/landing/contact', payload),

  getProjectBySlug: (slug: string) =>
    api.get<{ data: ProjectItem }>(`/projects/${slug}`),

  getArticleBySlug: (slug: string) =>
    api.get<{ data: ArticleItem }>(`/articles/${slug}`),
};
