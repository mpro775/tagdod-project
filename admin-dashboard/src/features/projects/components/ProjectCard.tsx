import React from 'react';
import { Box, Card, CardContent, Typography, Chip, IconButton, Tooltip, CardActions } from '@mui/material';
import { Edit, Delete, ToggleOn, ToggleOff, Visibility, VisibilityOff, Star, StarBorder } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { Project } from '../types/project.types';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onTogglePublish: (project: Project) => void;
  onToggleLanding: (project: Project) => void;
  onToggleFeatured: (project: Project) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onEdit, onDelete, onTogglePublish, onToggleLanding, onToggleFeatured }) => {
  const { t } = useTranslation('projects');

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {project.coverImage && (
        <Box sx={{ height: 160, bgcolor: 'grey.100', overflow: 'hidden' }}>
          <Box component="img" src={project.coverImage} alt={project.titleAr} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </Box>
      )}
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" noWrap>{project.titleAr}</Typography>
        {project.titleEn && <Typography variant="caption" color="text.secondary" display="block">{project.titleEn}</Typography>}
        <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          <Chip label={t(`types.${project.type}`)} size="small" color="primary" variant="outlined" />
          <Chip label={t(`status.${project.status}`)} size="small" color={project.status === 'completed' ? 'success' : project.status === 'in_progress' ? 'warning' : 'default'} />
          {project.isPublished && <Chip icon={<Visibility />} label={t('status.published')} size="small" color="success" variant="outlined" />}
          {project.showOnLanding && <Chip label="Landing" size="small" color="info" variant="outlined" />}
          {project.isFeatured && <Chip icon={<Star />} label="مميز" size="small" color="secondary" variant="outlined" />}
        </Box>
      </CardContent>
      <CardActions>
        <Tooltip title={t('actions.edit')}><IconButton size="small" color="primary" onClick={() => onEdit(project)}><Edit fontSize="small" /></IconButton></Tooltip>
        <Tooltip title={project.isPublished ? 'إخفاء' : 'نشر'}><IconButton size="small" color={project.isPublished ? 'warning' : 'success'} onClick={() => onTogglePublish(project)}>{project.isPublished ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}</IconButton></Tooltip>
        <Tooltip title={project.showOnLanding ? 'إخفاء من الصفحة' : 'عرض في الصفحة'}><IconButton size="small" color="info" onClick={() => onToggleLanding(project)}>{project.showOnLanding ? <ToggleOff fontSize="small" /> : <ToggleOn fontSize="small" />}</IconButton></Tooltip>
        <Tooltip title={project.isFeatured ? 'إزالة التميز' : 'جعل مميز'}><IconButton size="small" color="secondary" onClick={() => onToggleFeatured(project)}>{project.isFeatured ? <StarBorder fontSize="small" /> : <Star fontSize="small" />}</IconButton></Tooltip>
        <Tooltip title={t('actions.delete')}><IconButton size="small" color="error" onClick={() => onDelete(project)}><Delete fontSize="small" /></IconButton></Tooltip>
      </CardActions>
    </Card>
  );
};
