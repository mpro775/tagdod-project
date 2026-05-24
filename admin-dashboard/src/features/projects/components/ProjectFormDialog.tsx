import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, TextField, MenuItem, FormControlLabel, Switch, Autocomplete, Chip,
  useMediaQuery, Theme,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { Project, ProjectType, ProjectStatus } from '../types/project.types';

interface ProjectFormDialogProps {
  open: boolean;
  onClose: () => void;
  project: Project | null;
  mode: 'create' | 'edit';
  onSave: (data: any) => void;
  loading?: boolean;
}

const PROJECT_TYPES: ProjectType[] = ['system', 'contracting', 'maintenance', 'installation', 'supply', 'partnership', 'other'];
const PROJECT_STATUSES: ProjectStatus[] = ['planned', 'in_progress', 'completed'];

export const ProjectFormDialog: React.FC<ProjectFormDialogProps> = ({ open, onClose, project, mode, onSave, loading }) => {
  const { t } = useTranslation('projects');
  
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
  const [formData, setFormData] = useState({
    titleAr: '', titleEn: '', slug: '', shortDescriptionAr: '', shortDescriptionEn: '',
    descriptionAr: '', descriptionEn: '', type: 'system' as ProjectType, status: 'planned' as ProjectStatus,
    clientName: '', location: '', city: '', coverImage: '', startDate: '', endDate: '',
    tags: [] as string[], isFeatured: false, showOnLanding: false, landingOrder: 0, isPublished: false,
  });

  useEffect(() => {
    if (project) {
      setFormData({
        titleAr: project.titleAr || '', titleEn: project.titleEn || '', slug: project.slug || '',
        shortDescriptionAr: project.shortDescriptionAr || '', shortDescriptionEn: project.shortDescriptionEn || '',
        descriptionAr: project.descriptionAr || '', descriptionEn: project.descriptionEn || '',
        type: project.type, status: project.status, clientName: project.clientName || '',
        location: project.location || '', city: project.city || '', coverImage: project.coverImage || '',
        startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
        endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
        tags: project.tags || [], isFeatured: project.isFeatured, showOnLanding: project.showOnLanding,
        landingOrder: project.landingOrder, isPublished: project.isPublished,
      });
    }
  }, [project]);

  const handleChange = (field: string, value: any) => setFormData((prev) => ({ ...prev, [field]: value }));

  const handleSave = () => onSave(formData);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth fullScreen={isMobile}>
      <DialogTitle>{mode === 'create' ? 'إضافة مشروع جديد' : 'تعديل المشروع'}</DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label={t('form.titleAr')} value={formData.titleAr} onChange={(e) => handleChange('titleAr', e.target.value)} margin="normal" required /></Grid>
          <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label={t('form.titleEn')} value={formData.titleEn} onChange={(e) => handleChange('titleEn', e.target.value)} margin="normal" /></Grid>
          <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth select label={t('form.type')} value={formData.type} onChange={(e) => handleChange('type', e.target.value)} margin="normal">{PROJECT_TYPES.map((type) => (<MenuItem key={type} value={type}>{t(`types.${type}`)}</MenuItem>))}</TextField></Grid>
          <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth select label={t('form.status')} value={formData.status} onChange={(e) => handleChange('status', e.target.value)} margin="normal">{PROJECT_STATUSES.map((status) => (<MenuItem key={status} value={status}>{t(`status.${status}`)}</MenuItem>))}</TextField></Grid>
          <Grid size={{ xs: 12 }}><TextField fullWidth label={t('form.shortDescriptionAr')} value={formData.shortDescriptionAr} onChange={(e) => handleChange('shortDescriptionAr', e.target.value)} margin="normal" multiline rows={2} /></Grid>
          <Grid size={{ xs: 12 }}><TextField fullWidth label={t('form.descriptionAr')} value={formData.descriptionAr} onChange={(e) => handleChange('descriptionAr', e.target.value)} margin="normal" multiline rows={4} /></Grid>
          <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label={t('form.clientName')} value={formData.clientName} onChange={(e) => handleChange('clientName', e.target.value)} margin="normal" /></Grid>
          <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label={t('form.location')} value={formData.location} onChange={(e) => handleChange('location', e.target.value)} margin="normal" /></Grid>
          <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label={t('form.coverImage')} value={formData.coverImage} onChange={(e) => handleChange('coverImage', e.target.value)} margin="normal" placeholder="https://..." /></Grid>
          <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label={t('form.city')} value={formData.city} onChange={(e) => handleChange('city', e.target.value)} margin="normal" /></Grid>
          <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label={t('form.startDate')} type="date" value={formData.startDate} onChange={(e) => handleChange('startDate', e.target.value)} margin="normal" InputLabelProps={{ shrink: true }} /></Grid>
          <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth label={t('form.endDate')} type="date" value={formData.endDate} onChange={(e) => handleChange('endDate', e.target.value)} margin="normal" InputLabelProps={{ shrink: true }} /></Grid>
          <Grid size={{ xs: 12 }}>
            <Autocomplete multiple freeSolo options={[]} value={formData.tags} onChange={(_, v) => handleChange('tags', v)} renderTags={(value, getTagProps) => value.map((option, index) => (<Chip label={option} {...getTagProps({ index })} />))} renderInput={(params) => (<TextField {...params} label={t('form.tags')} placeholder="أضف وسماً واضغط Enter" />)} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}><FormControlLabel control={<Switch checked={formData.isPublished} onChange={(e) => handleChange('isPublished', e.target.checked)} />} label={t('form.isPublished')} /></Grid>
          <Grid size={{ xs: 12, sm: 6 }}><FormControlLabel control={<Switch checked={formData.showOnLanding} onChange={(e) => handleChange('showOnLanding', e.target.checked)} />} label={t('form.showOnLanding')} /></Grid>
          <Grid size={{ xs: 12, sm: 6 }}><FormControlLabel control={<Switch checked={formData.isFeatured} onChange={(e) => handleChange('isFeatured', e.target.checked)} />} label={t('form.isFeatured')} /></Grid>
          <Grid size={{ xs: 12, sm: 6 }}><TextField fullWidth type="number" label={t('form.landingOrder')} value={formData.landingOrder} onChange={(e) => handleChange('landingOrder', parseInt(e.target.value) || 0)} margin="normal" /></Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>إلغاء</Button>
        <Button variant="contained" onClick={handleSave} disabled={loading || !formData.titleAr}>{mode === 'create' ? 'إنشاء' : 'حفظ'}</Button>
      </DialogActions>
    </Dialog>
  );
};
