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
} from '@mui/material';
import {
  Edit,
  Delete,
  Restore,
  ContentCopy,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { formatFileSize } from '@/shared/utils/formatters';
import type { Media } from '../types/media.types';

interface MediaListItemProps {
  media: Media;
  onEdit: (media: Media) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  onCopyUrl: (url: string) => void;
  onTogglePublic: (media: Media) => void;
}

export const MediaListItem: React.FC<MediaListItemProps> = ({
  media,
  onEdit,
  onDelete,
  onRestore,
  onCopyUrl,
  onTogglePublic,
}) => {
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎥';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word')) return '📝';
    return '📁';
  };

  return (
    <ListItem
      sx={{
        opacity: media.deletedAt ? 0.6 : 1,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 1,
        mb: 1,
      }}
    >
      <ListItemAvatar>
        <Avatar
          src={media.type === 'image' ? media.url : undefined}
          sx={{ width: 56, height: 56 }}
        >
          {getFileIcon(media.mimeType)}
        </Avatar>
      </ListItemAvatar>
      
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="subtitle1" noWrap sx={{ flex: 1 }}>
              {media.name}
            </Typography>
            <Chip label={media.category} size="small" variant="outlined" />
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
          </Box>
        }
      />
      
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title="نسخ الرابط">
          <IconButton size="small" onClick={() => onCopyUrl(media.url)}>
            <ContentCopy fontSize="small" />
          </IconButton>
        </Tooltip>
        
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
            <IconButton
              size="small"
              color="primary"
              onClick={() => onRestore(media._id)}
            >
              <Restore fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : (
          <>
            <Tooltip title="تعديل">
              <IconButton
                size="small"
                color="primary"
                onClick={() => onEdit(media)}
              >
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
