import React, { useState } from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { Add, Article } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageShell, PageHeader, usePageTitle } from '@/shared/design-system';

import { ArticleFilters } from '../components/ArticleFilters';
import { ArticleCard } from '../components/ArticleCard';
import { useArticles, useDeleteArticle, usePublishArticle, useArchiveArticle, useToggleArticleLanding, useToggleArticleFeatured } from '../hooks/useArticles';
import type { Article as ArticleType, ListArticlesParams } from '../types/article.types';

export const ArticlesListPage: React.FC = () => {
  const { t } = useTranslation('articles');
  const navigate = useNavigate();
  
  usePageTitle(t('title', 'المقالات'));
  const [filters, setFilters] = useState<ListArticlesParams>({ page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  const { data: articlesResponse, isLoading, refetch } = useArticles({ ...filters, page: currentPage, limit: pageSize });
  const deleteMutation = useDeleteArticle();
  const publishMutation = usePublishArticle();
  const archiveMutation = useArchiveArticle();
  const toggleLanding = useToggleArticleLanding();
  const toggleFeatured = useToggleArticleFeatured();

  const articles = articlesResponse?.data || [];

  const handleFiltersChange = (newFilters: ListArticlesParams) => { setFilters(newFilters); setCurrentPage(1); };
  const handleFiltersReset = () => { setFilters({ page: 1, limit: 20, sortBy: 'createdAt', sortOrder: 'desc' }); setCurrentPage(1); };
  const handleAdd = () => navigate('/website/articles/new');
  const handleEdit = (article: ArticleType) => navigate(`/website/articles/${article._id}`);
  const handleDelete = (article: ArticleType) => { if (window.confirm(t('messages.deleteConfirm'))) { deleteMutation.mutate(article._id, { onSuccess: () => refetch() }); } };

  return (
    <PageShell fullHeight>
      <PageHeader
        title={t('pageTitle')}
        description="إدارة المقالات والأخبار المنشورة"
        breadcrumbs={[
          { label: 'لوحة التحكم', to: '/dashboard' },
          { label: t('pageTitle') },
        ]}
        actions={[
          { label: t('table.addButton'), icon: <Add />, onClick: handleAdd, variant: 'primary' },
        ]}
      />
      <ArticleFilters filters={filters} onFiltersChange={handleFiltersChange} onReset={handleFiltersReset} loading={isLoading} />
      {isLoading ? (<Grid container spacing={2}>{[...Array(6)].map((_, i) => (<Grid size={{ xs: 12, sm: 6, md: 4 }} key={i} sx={{ minWidth: 0 }}><Box sx={{ height: 280, borderRadius: 2, bgcolor: 'grey.100' }} /></Grid>))}</Grid>) : articles.length === 0 ? (<Box textAlign="center" py={8}><Article sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} /><Typography variant="h6" color="text.secondary">{t('messages.noArticles')}</Typography><Typography variant="body2" color="text.secondary">{t('messages.noArticlesDesc')}</Typography></Box>) : (<Grid container spacing={2}>{articles.map((a) => (<Grid size={{ xs: 12, sm: 6, md: 4 }} key={a._id} sx={{ minWidth: 0 }}><ArticleCard article={a} onEdit={handleEdit} onDelete={handleDelete} onPublish={() => publishMutation.mutate(a._id)} onArchive={() => archiveMutation.mutate(a._id)} onToggleLanding={() => toggleLanding.mutate(a._id)} onToggleFeatured={() => toggleFeatured.mutate(a._id)} /></Grid>))}</Grid>)}
    </PageShell>
  );
};
