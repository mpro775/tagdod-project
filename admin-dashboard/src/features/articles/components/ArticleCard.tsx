import React from 'react';
import { Box, Card, CardContent, Typography, Chip, IconButton, Tooltip, CardActions } from '@mui/material';
import { Edit, Delete, Visibility, VisibilityOff, Star, StarBorder, ToggleOn, ToggleOff } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import type { Article } from '../types/article.types';

interface ArticleCardProps { article: Article; onEdit: (article: Article) => void; onDelete: (article: Article) => void; onPublish: (article: Article) => void; onArchive: (article: Article) => void; onToggleLanding: (article: Article) => void; onToggleFeatured: (article: Article) => void; }

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, onEdit, onDelete, onPublish, onArchive, onToggleLanding, onToggleFeatured }) => {
  const { t } = useTranslation('articles');

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {article.coverImage && (<Box sx={{ height: 140, bgcolor: 'grey.100', overflow: 'hidden' }}><Box component="img" src={article.coverImage} alt={article.titleAr} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} /></Box>)}
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6" noWrap>{article.titleAr}</Typography>
        {article.excerptAr && <Typography variant="body2" color="text.secondary" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', mt: 1 }}>{article.excerptAr}</Typography>}
        <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
          <Chip label={t(`types.${article.type}`)} size="small" color="primary" variant="outlined" />
          <Chip label={t(`status.${article.status}`)} size="small" color={article.status === 'published' ? 'success' : article.status === 'archived' ? 'default' : 'warning'} />
          {article.showOnLanding && <Chip label="Landing" size="small" color="info" variant="outlined" />}
          {article.isFeatured && <Chip icon={<Star />} label="مميز" size="small" color="secondary" variant="outlined" />}
        </Box>
      </CardContent>
      <CardActions>
        <Tooltip title={t('actions.edit')}><IconButton size="small" color="primary" onClick={() => onEdit(article)}><Edit fontSize="small" /></IconButton></Tooltip>
        <Tooltip title={article.status === 'published' ? 'أرشفة' : 'نشر'}><IconButton size="small" color={article.status === 'published' ? 'warning' : 'success'} onClick={() => article.status === 'published' ? onArchive(article) : onPublish(article)}>{article.status === 'published' ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}</IconButton></Tooltip>
        <Tooltip title={article.showOnLanding ? 'إخفاء من الصفحة' : 'عرض في الصفحة'}><IconButton size="small" color="info" onClick={() => onToggleLanding(article)}>{article.showOnLanding ? <ToggleOff fontSize="small" /> : <ToggleOn fontSize="small" />}</IconButton></Tooltip>
        <Tooltip title={article.isFeatured ? 'إزالة التميز' : 'جعل مميز'}><IconButton size="small" color="secondary" onClick={() => onToggleFeatured(article)}>{article.isFeatured ? <StarBorder fontSize="small" /> : <Star fontSize="small" />}</IconButton></Tooltip>
        <Tooltip title={t('actions.delete')}><IconButton size="small" color="error" onClick={() => onDelete(article)}><Delete fontSize="small" /></IconButton></Tooltip>
      </CardActions>
    </Card>
  );
};
