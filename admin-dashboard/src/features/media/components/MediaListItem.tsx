import React from 'react';
import {
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  Tooltip,
  Chip,
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Badge,
  Skeleton,
} from '@mui/material';
import {
  Edit,
  Delete,
  Restore,
  ContentCopy,
  Visibility,
  VisibilityOff,
  Download,
  Info,
} from '@mui/icons-material';
import { formatFileSize } from '@/shared/utils/formatters';
import type { Media } from '../types/media.types';

interface MediaListItemProps {
  media: Media;
  // eslint-disable-next-line no-unused-vars
  onEdit: (media: Media) => void;
  // eslint-disable-next-line no-unused-vars
  onDelete: (id: string) => void;
  // eslint-disable-next-line no-unused-vars
  onRestore: (id: string) => void;
  // eslint-disable-next-line no-unused-vars
  onCopyUrl: (url: string) => void;
  // eslint-disable-next-line no-unused-vars
  onTogglePublic: (media: Media) => void;
  // eslint-disable-next-line no-unused-vars
  onDownload?: (media: Media) => void;
  // eslint-disable-next-line no-unused-vars
  onInfo?: (media: Media) => void;
  isLoading?: boolean;
  variant?: 'list' | 'card';
}

export const MediaListItem: React.FC<MediaListItemProps> = ({
  media,
  onEdit,
  onDelete,
  onRestore,
  onCopyUrl,
  onTogglePublic,
  onDownload,
  onInfo,
  isLoading = false,
  variant = 'list',
}) => {
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎥';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word')) return '📝';
    return '📁';
  };

  if (isLoading) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Skeleton variant="circular" width={56} height={56} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
            </Box>
            <Skeleton variant="rectangular" width={100} height={32} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'card') {
    return (
      <Card 
        sx={{ 
          mb: 2,
          opacity: media.deletedAt ? 0.6 : 1,
          transition: 'all 0.3s ease',
          '&:hover': {
            boxShadow: 3,
            transform: 'translateY(-2px)',
          },
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Avatar 
              src={media.type === 'image' ? media.url : undefined} 
              sx={{ width: 64, height: 64 }}
            >
              {getFileIcon(media.mimeType)}
            </Avatar>
            
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6" noWrap gutterBottom>
                {media.name}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label={media.category} 
                  size="small" 
                  variant="outlined" 
                  color="primary"
                />
                <Chip
                  label={media.isPublic ? 'عام' : 'خاص'}
                  size="small"
                  color={media.isPublic ? 'success' : 'warning'}
                  variant="outlined"
                />
                {media.deletedAt && (
                  <Chip label="محذوف" size="small" color="error" variant="outlined" />
                )}
                {media.usageCount > 0 && (
                  <Chip 
                    label={`مستخدم ${media.usageCount} مرة`} 
                    size="small" 
                    color="info" 
                    variant="outlined" 
                  />
                )}
              </Box>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {formatFileSize(media.size)}
                {media.width && media.height && ` • ${media.width} × ${media.height}`}
              </Typography>
              
              {media.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {media.description}
                </Typography>
              )}
              
              {media.tags && media.tags.length > 0 && (
                <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {media.tags.slice(0, 3).map((tag) => (
                    <Chip key={tag} label={tag} size="small" variant="outlined" />
                  ))}
                  {media.tags.length > 3 && (
                    <Chip label={`+${media.tags.length - 3}`} size="small" variant="outlined" />
                  )}
                </Box>
              )}
            </Box>
          </Box>
        </CardContent>
        
        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title="نسخ الرابط">
              <IconButton size="small" onClick={() => onCopyUrl(media.url)}>
                <ContentCopy fontSize="small" />
              </IconButton>
            </Tooltip>
            
            {onDownload && (
              <Tooltip title="تحميل">
                <IconButton size="small" onClick={() => onDownload(media)}>
                  <Download fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            
            {onInfo && (
              <Tooltip title="تفاصيل">
                <IconButton size="small" onClick={() => onInfo(media)}>
                  <Info fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title={media.isPublic ? 'إخفاء' : 'إظهار'}>
              <IconButton
                size="small"
                color={media.isPublic ? 'success' : 'default'}
                onClick={() => onTogglePublic(media)}
              >
                {media.isPublic ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
              </IconButton>
            </Tooltip>

            {media.deletedAt ? (
              <Tooltip title="استعادة">
                <IconButton size="small" color="primary" onClick={() => onRestore(media._id)}>
                  <Restore fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : (
              <>
                <Tooltip title="تعديل">
                  <IconButton size="small" color="primary" onClick={() => onEdit(media)}>
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="حذف">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => {
                      if (window.confirm(`هل تريد حذف "${media.name}"؟`)) {
                        onDelete(media._id);
                      }
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              </>
            )}
          </Box>
        </CardActions>
      </Card>
    );
  }

  // List variant
  return (
    <ListItem
      sx={{
        opacity: media.deletedAt ? 0.6 : 1,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        mb: 1,
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: 2,
          borderColor: 'primary.main',
        },
      }}
    >
      <ListItemAvatar>
        <Badge
          badgeContent={media.usageCount}
          color="primary"
          invisible={media.usageCount === 0}
        >
          <Avatar src={media.type === 'image' ? media.url : undefined} sx={{ width: 56, height: 56 }}>
            {getFileIcon(media.mimeType)}
          </Avatar>
        </Badge>
      </ListItemAvatar>

      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography variant="subtitle1" noWrap sx={{ flex: 1, minWidth: 200 }}>
              {media.name}
            </Typography>
            <Chip 
              label={media.category} 
              size="small" 
              variant="outlined" 
              color="primary"
            />
            <Chip
              label={media.isPublic ? 'عام' : 'خاص'}
              size="small"
              color={media.isPublic ? 'success' : 'warning'}
              variant="outlined"
            />
            {media.deletedAt && (
              <Chip label="محذوف" size="small" color="error" variant="outlined" />
            )}
          </Box>
        }
        secondary={
          <Box>
            <Typography variant="body2" color="text.secondary">
              {formatFileSize(media.size)}
              {media.width && media.height && ` • ${media.width} × ${media.height}`}
            </Typography>
            {media.description && (
              <Typography variant="caption" color="text.secondary" display="block">
                {media.description}
              </Typography>
            )}
            {media.tags && media.tags.length > 0 && (
              <Box sx={{ mt: 0.5, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {media.tags.slice(0, 2).map((tag) => (
                  <Chip key={tag} label={tag} size="small" variant="outlined" />
                ))}
                {media.tags.length > 2 && (
                  <Chip label={`+${media.tags.length - 2}`} size="small" variant="outlined" />
                )}
              </Box>
            )}
          </Box>
        }
      />

      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title="نسخ الرابط">
          <IconButton size="small" onClick={() => onCopyUrl(media.url)}>
            <ContentCopy fontSize="small" />
          </IconButton>
        </Tooltip>

        {onDownload && (
          <Tooltip title="تحميل">
            <IconButton size="small" onClick={() => onDownload(media)}>
              <Download fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title={media.isPublic ? 'إخفاء' : 'إظهار'}>
          <IconButton
            size="small"
            color={media.isPublic ? 'success' : 'default'}
            onClick={() => onTogglePublic(media)}
          >
            {media.isPublic ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
          </IconButton>
        </Tooltip>

        {media.deletedAt ? (
          <Tooltip title="استعادة">
            <IconButton size="small" color="primary" onClick={() => onRestore(media._id)}>
              <Restore fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : (
          <>
            <Tooltip title="تعديل">
              <IconButton size="small" color="primary" onClick={() => onEdit(media)}>
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="حذف">
              <IconButton
                size="small"
                color="error"
                onClick={() => {
                  if (window.confirm(`هل تريد حذف "${media.name}"؟`)) {
                    onDelete(media._id);
                  }
                }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>
    </ListItem>
  );
};
