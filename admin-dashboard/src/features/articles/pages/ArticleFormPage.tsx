import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Grid, TextField, MenuItem, FormControlLabel, Switch, Autocomplete, Chip, CircularProgress } from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useArticle, useCreateArticle, useUpdateArticle } from '../hooks/useArticles';
import type { ArticleType, ArticleStatus } from '../types/article.types';

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

  const [formData, setFormData] = useState({ titleAr: '', titleEn: '', slug: '', excerptAr: '', excerptEn: '', contentAr: '', contentEn: '', coverImage: '', type: 'article' as ArticleType, category: '', tags: [] as string[], authorName: '', publishDate: '', status: 'draft' as ArticleStatus, isFeatured: false, showOnLanding: false, landingOrder: 0, readTime: 0 });

  useEffect(() => { if (article) { setFormData({ titleAr: article.titleAr || '', titleEn: article.titleEn || '', slug: article.slug || '', excerptAr: article.excerptAr || '', excerptEn: article.excerptEn || '', contentAr: article.contentAr || '', contentEn: article.contentEn || '', coverImage: article.coverImage || '', type: article.type, category: article.category || '', tags: article.tags || [], authorName: article.authorName || '', publishDate: article.publishDate ? new Date(article.publishDate).toISOString().split('T')[0] : '', status: article.status, isFeatured: article.isFeatured, showOnLanding: article.showOnLanding, landingOrder: article.landingOrder, readTime: article.readTime || 0 }); } }, [article]);

  const handleChange = (field: string, value: any) => setFormData((prev) => ({ ...prev, [field]: value }));
  const handleSave = async () => { try { const data = { ...formData, publishDate: formData.publishDate ? new Date(formData.publishDate) : undefined }; if (isEdit && id) { await updateMutation.mutateAsync({ id, data: data as any }); } else { await createMutation.mutateAsync(data as any); } navigate('/website/articles'); } catch {} };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}><Button startIcon={<ArrowBack />} onClick={() => navigate('/website/articles')}>رجوع</Button><Typography variant="h4">{isEdit ? 'تعديل المقال' : 'إضافة مقال جديد'}</Typography></Box>
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label={t('form.titleAr')} value={formData.titleAr} onChange={(e) => handleChange('titleAr', e.target.value)} margin="normal" required /></Grid>
          <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label={t('form.titleEn')} value={formData.titleEn} onChange={(e) => handleChange('titleEn', e.target.value)} margin="normal" /></Grid>
          <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth select label={t('form.type')} value={formData.type} onChange={(e) => handleChange('type', e.target.value)} margin="normal">{ARTICLE_TYPES.map((type) => (<MenuItem key={type} value={type}>{t(`types.${type}`)}</MenuItem>))}</TextField></Grid>
          <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth select label={t('form.status')} value={formData.status} onChange={(e) => handleChange('status', e.target.value)} margin="normal">{ARTICLE_STATUSES.map((status) => (<MenuItem key={status} value={status}>{t(`status.${status}`)}</MenuItem>))}</TextField></Grid>
          <Grid size={{ xs: 12 }}><TextField fullWidth label={t('form.excerptAr')} value={formData.excerptAr} onChange={(e) => handleChange('excerptAr', e.target.value)} margin="normal" multiline rows={2} /></Grid>
          <Grid size={{ xs: 12 }}><TextField fullWidth label={t('form.contentAr')} value={formData.contentAr} onChange={(e) => handleChange('contentAr', e.target.value)} margin="normal" multiline rows={8} /></Grid>
          <Grid size={{ xs: 12 }}><TextField fullWidth label={t('form.coverImage')} value={formData.coverImage} onChange={(e) => handleChange('coverImage', e.target.value)} margin="normal" placeholder="https://..." /></Grid>
          <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label={t('form.category')} value={formData.category} onChange={(e) => handleChange('category', e.target.value)} margin="normal" /></Grid>
          <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label={t('form.authorName')} value={formData.authorName} onChange={(e) => handleChange('authorName', e.target.value)} margin="normal" /></Grid>
          <Grid size={{ xs: 12 }}><Autocomplete multiple freeSolo options={[]} value={formData.tags} onChange={(_, v) => handleChange('tags', v)} renderTags={(value, getTagProps) => value.map((option, index) => (<Chip label={option} {...getTagProps({ index })} />))} renderInput={(params) => (<TextField {...params} label={t('form.tags')} placeholder="أضف وسماً واضغط Enter" />)} /></Grid>
          <Grid size={{ xs: 12, md: 4 }}><FormControlLabel control={<Switch checked={formData.showOnLanding} onChange={(e) => handleChange('showOnLanding', e.target.checked)} />} label={t('form.showOnLanding')} /></Grid>
          <Grid size={{ xs: 12, md: 4 }}><FormControlLabel control={<Switch checked={formData.isFeatured} onChange={(e) => handleChange('isFeatured', e.target.checked)} />} label={t('form.isFeatured')} /></Grid>
          <Grid size={{ xs: 12, md: 4 }}><TextField fullWidth type="number" label={t('form.readTime')} value={formData.readTime} onChange={(e) => handleChange('readTime', parseInt(e.target.value) || 0)} margin="normal" /></Grid>
        </Grid>
        <Box mt={3} display="flex" gap={2} justifyContent="flex-end">
          <Button variant="outlined" onClick={() => navigate('/website/articles')}>إلغاء</Button>
          <Button variant="contained" startIcon={<Save />} onClick={handleSave} disabled={!formData.titleAr || !formData.contentAr || createMutation.isPending || updateMutation.isPending}>{isEdit ? 'حفظ' : 'إنشاء'}</Button>
        </Box>
      </Paper>
    </Box>
  );
};
