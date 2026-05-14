import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, Grid, TextField, MenuItem, FormControlLabel, Switch, Autocomplete, Chip, CircularProgress } from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useProject, useCreateProject, useUpdateProject } from '../hooks/useProjects';
import type { ProjectType, ProjectStatus } from '../types/project.types';

const PROJECT_TYPES: ProjectType[] = ['system', 'contracting', 'maintenance', 'installation', 'supply', 'partnership', 'other'];
const PROJECT_STATUSES: ProjectStatus[] = ['planned', 'in_progress', 'completed'];

export const ProjectFormPage: React.FC = () => {
  const { t } = useTranslation('projects');
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { data: project, isLoading } = useProject(id || '');
  const createMutation = useCreateProject();
  const updateMutation = useUpdateProject();

  const [formData, setFormData] = useState({ titleAr: '', titleEn: '', slug: '', shortDescriptionAr: '', shortDescriptionEn: '', descriptionAr: '', descriptionEn: '', type: 'system' as ProjectType, status: 'planned' as ProjectStatus, clientName: '', location: '', city: '', coverImage: '', startDate: '', endDate: '', tags: [] as string[], isFeatured: false, showOnLanding: false, landingOrder: 0, isPublished: false });

  useEffect(() => { if (project) { setFormData({ titleAr: project.titleAr || '', titleEn: project.titleEn || '', slug: project.slug || '', shortDescriptionAr: project.shortDescriptionAr || '', shortDescriptionEn: project.shortDescriptionEn || '', descriptionAr: project.descriptionAr || '', descriptionEn: project.descriptionEn || '', type: project.type, status: project.status, clientName: project.clientName || '', location: project.location || '', city: project.city || '', coverImage: project.coverImage || '', startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '', endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '', tags: project.tags || [], isFeatured: project.isFeatured, showOnLanding: project.showOnLanding, landingOrder: project.landingOrder, isPublished: project.isPublished }); } }, [project]);

  const handleChange = (field: string, value: any) => setFormData((prev) => ({ ...prev, [field]: value }));
  const handleSave = async () => { try { const data = { ...formData, startDate: formData.startDate ? new Date(formData.startDate) : undefined, endDate: formData.endDate ? new Date(formData.endDate) : undefined }; if (isEdit && id) { await updateMutation.mutateAsync({ id, data: data as any }); } else { await createMutation.mutateAsync(data as any); } navigate('/website/projects'); } catch {} };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate('/website/projects')}>رجوع</Button>
        <Typography variant="h4">{isEdit ? 'تعديل المشروع' : 'إضافة مشروع جديد'}</Typography>
      </Box>
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label={t('form.titleAr')} value={formData.titleAr} onChange={(e) => handleChange('titleAr', e.target.value)} margin="normal" required /></Grid>
          <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label={t('form.titleEn')} value={formData.titleEn} onChange={(e) => handleChange('titleEn', e.target.value)} margin="normal" /></Grid>
          <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth select label={t('form.type')} value={formData.type} onChange={(e) => handleChange('type', e.target.value)} margin="normal">{PROJECT_TYPES.map((type) => (<MenuItem key={type} value={type}>{t(`types.${type}`)}</MenuItem>))}</TextField></Grid>
          <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth select label={t('form.status')} value={formData.status} onChange={(e) => handleChange('status', e.target.value)} margin="normal">{PROJECT_STATUSES.map((status) => (<MenuItem key={status} value={status}>{t(`status.${status}`)}</MenuItem>))}</TextField></Grid>
          <Grid size={{ xs: 12 }}><TextField fullWidth label={t('form.shortDescriptionAr')} value={formData.shortDescriptionAr} onChange={(e) => handleChange('shortDescriptionAr', e.target.value)} margin="normal" multiline rows={2} /></Grid>
          <Grid size={{ xs: 12 }}><TextField fullWidth label={t('form.descriptionAr')} value={formData.descriptionAr} onChange={(e) => handleChange('descriptionAr', e.target.value)} margin="normal" multiline rows={4} /></Grid>
          <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label={t('form.clientName')} value={formData.clientName} onChange={(e) => handleChange('clientName', e.target.value)} margin="normal" /></Grid>
          <Grid size={{ xs: 12, md: 6 }}><TextField fullWidth label={t('form.location')} value={formData.location} onChange={(e) => handleChange('location', e.target.value)} margin="normal" /></Grid>
          <Grid size={{ xs: 12 }}><TextField fullWidth label={t('form.coverImage')} value={formData.coverImage} onChange={(e) => handleChange('coverImage', e.target.value)} margin="normal" placeholder="https://..." /></Grid>
          <Grid size={{ xs: 12 }}><Autocomplete multiple freeSolo options={[]} value={formData.tags} onChange={(_, v) => handleChange('tags', v)} renderTags={(value, getTagProps) => value.map((option, index) => (<Chip label={option} {...getTagProps({ index })} />))} renderInput={(params) => (<TextField {...params} label={t('form.tags')} placeholder="أضف وسماً واضغط Enter" />)} /></Grid>
          <Grid size={{ xs: 12, md: 4 }}><FormControlLabel control={<Switch checked={formData.isPublished} onChange={(e) => handleChange('isPublished', e.target.checked)} />} label={t('form.isPublished')} /></Grid>
          <Grid size={{ xs: 12, md: 4 }}><FormControlLabel control={<Switch checked={formData.showOnLanding} onChange={(e) => handleChange('showOnLanding', e.target.checked)} />} label={t('form.showOnLanding')} /></Grid>
          <Grid size={{ xs: 12, md: 4 }}><FormControlLabel control={<Switch checked={formData.isFeatured} onChange={(e) => handleChange('isFeatured', e.target.checked)} />} label={t('form.isFeatured')} /></Grid>
        </Grid>
        <Box mt={3} display="flex" gap={2} justifyContent="flex-end">
          <Button variant="outlined" onClick={() => navigate('/website/projects')}>إلغاء</Button>
          <Button variant="contained" startIcon={<Save />} onClick={handleSave} disabled={!formData.titleAr || createMutation.isPending || updateMutation.isPending}>{isEdit ? 'حفظ' : 'إنشاء'}</Button>
        </Box>
      </Paper>
    </Box>
  );
};
