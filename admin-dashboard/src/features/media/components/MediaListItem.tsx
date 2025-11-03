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
  useTheme,
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
import { useTranslation } from 'react-i18next';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { ConfirmDialog } from '@/shared/components';
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
  const { t } = useTranslation('media');
  const theme = useTheme();
  const { confirmDialog, dialogProps } = useConfirmDialog();
  
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
            <Skeleton 
              variant="circular" 
              sx={{ width: { xs: 40, sm: 56 }, height: { xs: 40, sm: 56 } }}
            />
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
          bgcolor: 'background.paper',
          '&:hover': {
            boxShadow: theme.palette.mode === 'dark' ? 8 : 3,
            transform: 'translateY(-2px)',
          },
        }}
      >
        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: { xs: 1, sm: 2 } }}>
            <Avatar 
              src={media.type === 'image' ? media.url : undefined} 
              sx={{ 
                width: { xs: 48, sm: 64 }, 
                height: { xs: 48, sm: 64 },
              }}
            >
              {getFileIcon(media.mimeType)}
            </Avatar>
            
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography 
                variant="h6" 
                noWrap 
                gutterBottom
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                {media.name}
              </Typography>
              
              <Box sx={{ display: 'flex', gap: 0.5, mb: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label={media.category} 
                  size="small" 
                  variant="outlined" 
                  color="primary"
                  sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                />
                <Chip
                  label={media.isPublic ? t('public') : t('private')}
                  size="small"
                  color={media.isPublic ? 'success' : 'warning'}
                  variant="outlined"
                  sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                />
                {media.deletedAt && (
                  <Chip 
                    label={t('deleted')} 
                    size="small" 
                    color="error" 
                    variant="outlined"
                    sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                  />
                )}
                {media.usageCount > 0 && (
                  <Chip
                    label={`${t('used')} ${media.usageCount}`}
                    size="small"
                    color="info"
                    variant="outlined"
                    sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
                  />
                )}
              </Box>
              
              <Typography 
                variant="body2" 
                color="text.secondary" 
                gutterBottom
                sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
              >
                {formatFileSize(media.size)}
                {media.width && media.height && ` • ${media.width} × ${media.height}`}
              </Typography>
              
              {media.description && (
                <Typography 
                  variant="body2" 
                  color="text.secondary" 
                  sx={{ 
                    mt: 1,
                    fontSize: { xs: '0.7rem', sm: '0.875rem' },
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {media.description}
                </Typography>
              )}
              
              {media.tags && media.tags.length > 0 && (
                <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                  {media.tags.slice(0, 3).map((tag) => (
                    <Chip 
                      key={tag} 
                      label={tag} 
                      size="small" 
                      variant="outlined"
                      sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}
                    />
                  ))}
                  {media.tags.length > 3 && (
                    <Chip 
                      label={`+${media.tags.length - 3}`} 
                      size="small" 
                      variant="outlined"
                      sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}
                    />
                  )}
                </Box>
              )}
            </Box>
          </Box>
        </CardContent>
        
        <CardActions 
          sx={{ 
            justifyContent: 'space-between', 
            px: { xs: 1.5, sm: 2 }, 
            pb: { xs: 1.5, sm: 2 },
            flexWrap: 'wrap',
            gap: 0.5,
          }}
        >
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title={t('copyUrl')}>
              <IconButton 
                size="small" 
                onClick={() => onCopyUrl(media.url)}
                sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
              >
                <ContentCopy fontSize="inherit" />
              </IconButton>
            </Tooltip>

            {onDownload && (
              <Tooltip title={t('actions.gridView')}>
                <IconButton 
                  size="small" 
                  onClick={() => onDownload(media)}
                  sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                >
                  <Download fontSize="inherit" />
                </IconButton>
              </Tooltip>
            )}

            {onInfo && (
              <Tooltip title={t('details.title')}>
                <IconButton 
                  size="small" 
                  onClick={() => onInfo(media)}
                  sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                >
                  <Info fontSize="inherit" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Tooltip title={media.isPublic ? t('hide') : t('show')}>
              <IconButton
                size="small"
                color={media.isPublic ? 'success' : 'default'}
                onClick={() => onTogglePublic(media)}
                sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
              >
                {media.isPublic ? <Visibility fontSize="inherit" /> : <VisibilityOff fontSize="inherit" />}
              </IconButton>
            </Tooltip>

            {media.deletedAt ? (
              <Tooltip title={t('restore')}>
                <IconButton 
                  size="small" 
                  color="primary" 
                  onClick={() => onRestore(media._id)}
                  sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                >
                  <Restore fontSize="inherit" />
                </IconButton>
              </Tooltip>
            ) : (
              <>
                <Tooltip title={t('edit')}>
                  <IconButton 
                    size="small" 
                    color="primary" 
                    onClick={() => onEdit(media)}
                    sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                  >
                    <Edit fontSize="inherit" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t('delete')}>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={async () => {
                      const confirmed = await confirmDialog({
                        title: t('messages.deleteTitle', 'تأكيد الحذف'),
                        message: t('messages.deleteConfirm', { name: media.name }),
                        type: 'warning',
                        confirmColor: 'error',
                      });
                      if (confirmed) {
                        onDelete(media._id);
                      }
                    }}
                    sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
                  >
                    <Delete fontSize="inherit" />
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
        bgcolor: 'background.paper',
        '&:hover': {
          boxShadow: theme.palette.mode === 'dark' ? 4 : 2,
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
          <Avatar 
            src={media.type === 'image' ? media.url : undefined} 
            sx={{ 
              width: { xs: 40, sm: 56 }, 
              height: { xs: 40, sm: 56 } 
            }}
          >
            {getFileIcon(media.mimeType)}
          </Avatar>
        </Badge>
      </ListItemAvatar>

      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Typography 
              variant="subtitle1" 
              noWrap 
              sx={{ 
                flex: 1, 
                minWidth: { xs: 100, sm: 200 },
                fontSize: { xs: '0.875rem', sm: '1rem' }
              }}
            >
              {media.name}
            </Typography>
            <Chip 
              label={media.category} 
              size="small" 
              variant="outlined" 
              color="primary"
              sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
            />
            <Chip
              label={media.isPublic ? t('public') : t('private')}
              size="small"
              color={media.isPublic ? 'success' : 'warning'}
              variant="outlined"
              sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
            />
            {media.deletedAt && (
              <Chip 
                label={t('deleted')} 
                size="small" 
                color="error" 
                variant="outlined"
                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
              />
            )}
          </Box>
        }
        secondary={
          <Box>
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: { xs: '0.7rem', sm: '0.875rem' } }}
            >
              {formatFileSize(media.size)}
              {media.width && media.height && ` • ${media.width} × ${media.height}`}
            </Typography>
            {media.description && (
              <Typography 
                variant="caption" 
                color="text.secondary" 
                display="block"
                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
              >
                {media.description}
              </Typography>
            )}
            {media.tags && media.tags.length > 0 && (
              <Box sx={{ mt: 0.5, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {media.tags.slice(0, 2).map((tag) => (
                  <Chip 
                    key={tag} 
                    label={tag} 
                    size="small" 
                    variant="outlined"
                    sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}
                  />
                ))}
                {media.tags.length > 2 && (
                  <Chip 
                    label={`+${media.tags.length - 2}`} 
                    size="small" 
                    variant="outlined"
                    sx={{ fontSize: { xs: '0.65rem', sm: '0.7rem' } }}
                  />
                )}
              </Box>
            )}
          </Box>
        }
      />

      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title={t('copyUrl')}>
          <IconButton 
            size="small" 
            onClick={() => onCopyUrl(media.url)}
            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
          >
            <ContentCopy fontSize="inherit" />
          </IconButton>
        </Tooltip>

        {onDownload && (
          <Tooltip title={t('actions.gridView')}>
            <IconButton 
              size="small" 
              onClick={() => onDownload(media)}
              sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
            >
              <Download fontSize="inherit" />
            </IconButton>
          </Tooltip>
        )}

        <Tooltip title={media.isPublic ? t('hide') : t('show')}>
          <IconButton
            size="small"
            color={media.isPublic ? 'success' : 'default'}
            onClick={() => onTogglePublic(media)}
            sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
          >
            {media.isPublic ? <Visibility fontSize="inherit" /> : <VisibilityOff fontSize="inherit" />}
          </IconButton>
        </Tooltip>

        {media.deletedAt ? (
          <Tooltip title={t('restore')}>
            <IconButton 
              size="small" 
              color="primary" 
              onClick={() => onRestore(media._id)}
              sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
            >
              <Restore fontSize="inherit" />
            </IconButton>
          </Tooltip>
        ) : (
          <>
            <Tooltip title={t('edit')}>
              <IconButton 
                size="small" 
                color="primary" 
                onClick={() => onEdit(media)}
                sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
              >
                <Edit fontSize="inherit" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('delete')}>
              <IconButton
                size="small"
                color="error"
                onClick={async () => {
                  const confirmed = await confirmDialog({
                    title: t('messages.deleteTitle', 'تأكيد الحذف'),
                    message: t('messages.deleteConfirm', { name: media.name }),
                    type: 'warning',
                    confirmColor: 'error',
                  });
                  if (confirmed) {
                    onDelete(media._id);
                  }
                }}
                sx={{ fontSize: { xs: '0.9rem', sm: '1rem' } }}
              >
                <Delete fontSize="inherit" />
              </IconButton>
            </Tooltip>
          </>
        )}
      </Box>

      {/* Confirm Dialog */}
      <ConfirmDialog {...dialogProps} />
    </ListItem>
  );
};
