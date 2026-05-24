import React, { useEffect, useState } from 'react';
import {
  Autocomplete,
  Chip,
  FormControlLabel,
  Grid,
  MenuItem,
  Switch,
  TextField,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useArticle, useCreateArticle, useUpdateArticle } from '../hooks/useArticles';
import type { ArticleStatus, ArticleType } from '../types/article.types';
import {
  FormActionBar,
  LoadingState,
  PageHeader,
  PageShell,
  SectionCard,
  usePageTitle,
} from '@/shared/design-system';

const ARTICLE_TYPES: ArticleType[] = ['news', 'article'];
const ARTICLE_STATUSES: ArticleStatus[] = ['draft', 'published', 'archived'];

export const ArticleFormPage: React.FC = () => {
  const { t } = useTranslation('articles');
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { data: article, isLoading } = useArticle(id || '');
  const createMutation = useCreateArticle();
  const updateMutation = useUpdateArticle();
  const pageTitle = isEdit ? 'تعديل المقال' : 'إضافة مقال جديد';
  const isSaving = createMutation.isPending || updateMutation.isPending;

  usePageTitle(pageTitle);

  const [formData, setFormData] = useState({
    titleAr: '',
    titleEn: '',
    slug: '',
    excerptAr: '',
    excerptEn: '',
    contentAr: '',
    contentEn: '',
    coverImage: '',
    type: 'article' as ArticleType,
    category: '',
    tags: [] as string[],
    authorName: '',
    publishDate: '',
    status: 'draft' as ArticleStatus,
    isFeatured: false,
    showOnLanding: false,
    landingOrder: 0,
    readTime: 0,
  });

  useEffect(() => {
    if (!article) return;

    setFormData({
      titleAr: article.titleAr || '',
      titleEn: article.titleEn || '',
      slug: article.slug || '',
      excerptAr: article.excerptAr || '',
      excerptEn: article.excerptEn || '',
      contentAr: article.contentAr || '',
      contentEn: article.contentEn || '',
      coverImage: article.coverImage || '',
      type: article.type,
      category: article.category || '',
      tags: article.tags || [],
      authorName: article.authorName || '',
      publishDate: article.publishDate ? new Date(article.publishDate).toISOString().split('T')[0] : '',
      status: article.status,
      isFeatured: article.isFeatured,
      showOnLanding: article.showOnLanding,
      landingOrder: article.landingOrder,
      readTime: article.readTime || 0,
    });
  }, [article]);

  const handleChange = (field: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const data = {
        ...formData,
        publishDate: formData.publishDate ? new Date(formData.publishDate) : undefined,
      };

      if (isEdit && id) {
        await updateMutation.mutateAsync({ id, data: data as any });
      } else {
        await createMutation.mutateAsync(data as any);
      }

      navigate('/website/articles');
    } catch {
      // Mutation hooks own toast/error handling.
    }
  };

  if (isLoading) {
    return (
      <PageShell fullHeight>
        <PageHeader title={pageTitle} />
        <LoadingState variant="skeleton" rows={6} />
      </PageShell>
    );
  }

  return (
    <PageShell fullHeight maxWidth="xl">
      <PageHeader
        title={pageTitle}
        description="إدارة بيانات المقال ومحتواه العربي والإنجليزي وحالة النشر"
        breadcrumbs={[
          { label: 'لوحة التحكم', to: '/dashboard' },
          { label: 'المقالات', to: '/website/articles' },
          { label: pageTitle },
        ]}
        actions={[
          {
            label: 'رجوع',
            icon: <ArrowBack />,
            onClick: () => navigate('/website/articles'),
            variant: 'secondary',
          },
        ]}
      />

      <SectionCard>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label={t('form.titleAr')}
              value={formData.titleAr}
              onChange={(event) => handleChange('titleAr', event.target.value)}
              required
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label={t('form.titleEn')}
              value={formData.titleEn}
              onChange={(event) => handleChange('titleEn', event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              select
              label={t('form.type')}
              value={formData.type}
              onChange={(event) => handleChange('type', event.target.value)}
            >
              {ARTICLE_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {t(`types.${type}`)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              select
              label={t('form.status')}
              value={formData.status}
              onChange={(event) => handleChange('status', event.target.value)}
            >
              {ARTICLE_STATUSES.map((status) => (
                <MenuItem key={status} value={status}>
                  {t(`status.${status}`)}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label={t('form.excerptAr')}
              value={formData.excerptAr}
              onChange={(event) => handleChange('excerptAr', event.target.value)}
              multiline
              rows={2}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label={t('form.contentAr')}
              value={formData.contentAr}
              onChange={(event) => handleChange('contentAr', event.target.value)}
              multiline
              rows={8}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth
              label={t('form.coverImage')}
              value={formData.coverImage}
              onChange={(event) => handleChange('coverImage', event.target.value)}
              placeholder="https://..."
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label={t('form.category')}
              value={formData.category}
              onChange={(event) => handleChange('category', event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label={t('form.authorName')}
              value={formData.authorName}
              onChange={(event) => handleChange('authorName', event.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12 }}>
            <Autocomplete
              multiple
              freeSolo
              options={[]}
              value={formData.tags}
              onChange={(_, value) => handleChange('tags', value)}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip label={option} {...getTagProps({ index })} key={option} />
                ))
              }
              renderInput={(params) => (
                <TextField {...params} label={t('form.tags')} placeholder="أضف وسماً واضغط Enter" />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.showOnLanding}
                  onChange={(event) => handleChange('showOnLanding', event.target.checked)}
                />
              }
              label={t('form.showOnLanding')}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isFeatured}
                  onChange={(event) => handleChange('isFeatured', event.target.checked)}
                />
              }
              label={t('form.isFeatured')}
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              type="number"
              label={t('form.readTime')}
              value={formData.readTime}
              onChange={(event) => handleChange('readTime', parseInt(event.target.value, 10) || 0)}
            />
          </Grid>
        </Grid>
      </SectionCard>

      <FormActionBar
        onCancel={() => navigate('/website/articles')}
        onSubmit={handleSave}
        loading={isSaving}
        disabled={!formData.titleAr || !formData.contentAr}
        submitLabel={isEdit ? 'حفظ' : 'إنشاء'}
      />
    </PageShell>
  );
};
