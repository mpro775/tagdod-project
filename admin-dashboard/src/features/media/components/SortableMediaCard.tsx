import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  CardMedia,
  Box,
  Typography,
  Chip,
  Badge,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Edit,
  Delete,
  Restore,
  ContentCopy,
  Visibility,
  VisibilityOff,
  DragIndicator,
  MoreVert,
} from '@mui/icons-material';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { formatFileSize } from '@/shared/utils/formatters';
import { useTranslation } from 'react-i18next';
import type { Media } from '../types/media.types';

interface SortableMediaCardProps {
  media: Media;
  showBulkActions: boolean;
  isSelected: boolean;
  onBulkSelect: (id: string) => void;
  onEdit: (media: Media) => void;
  onDelete: (id: string) => void;
  onRestore: (id: string) => void;
  onCopyUrl: (url: string) => void;
  onTogglePublic: (media: Media) => void;
  onDetails: (media: Media) => void;
  onMenuOpen?: (event: React.MouseEvent<HTMLElement>, media: Media) => void;
  confirmDelete: (media: Media) => Promise<void>;
}

export const SortableMediaCard: React.FC<SortableMediaCardProps> = ({
  media,
  showBulkActions,
  isSelected,
  onBulkSelect,
  onEdit,
  onRestore,
  onCopyUrl,
  onTogglePublic,
  onDetails,
  onMenuOpen,
  confirmDelete,
}) => {
  const { t } = useTranslation('media');
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: media._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : media.deletedAt ? 0.6 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      sx={{
        border: showBulkActions && isSelected ? 2 : 0,
        borderColor: 'primary.main',
        cursor: showBulkActions ? 'pointer' : isDragging ? 'grabbing' : 'grab',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        position: 'relative',
        '&:hover .drag-handle': {
          opacity: 1,
        },
      }}
      onClick={() => showBulkActions && onBulkSelect(media._id)}
    >
      {/* Drag Handle */}
      <Box
        className="drag-handle"
        {...attributes}
        {...listeners}
        sx={{
          position: 'absolute',
          top: 8,
          left: 8,
          zIndex: 10,
          opacity: 0,
          transition: 'opacity 0.2s',
          bgcolor: 'background.paper',
          borderRadius: '50%',
          p: 0.5,
          cursor: 'grab',
          '&:active': {
            cursor: 'grabbing',
          },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 2,
        }}
      >
        <DragIndicator fontSize="small" color="action" />
      </Box>

      {/* Menu Button */}
      {onMenuOpen && (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onMenuOpen(e, media);
          }}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 10,
            bgcolor: 'background.paper',
            boxShadow: 2,
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <MoreVert fontSize="small" />
        </IconButton>
      )}

      <CardMedia
        component="img"
        height="200"
        image={media.url}
        alt={media.name}
        sx={{
          objectFit: 'contain',
          bgcolor: 'grey.100',
          cursor: 'pointer',
          height: { xs: '150px', sm: '200px' },
        }}
        onClick={(e) => {
          e.stopPropagation();
          onDetails(media);
        }}
      />
      <CardContent sx={{ flex: 1, pb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              fontWeight="medium"
              noWrap
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              {media.name}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
            >
              {formatFileSize(media.size)}
            </Typography>
            {media.width && media.height && (
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
              >
                {media.width} × {media.height}
              </Typography>
            )}
            <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
              <Chip
                label={media.category}
                size="small"
                variant="outlined"
                sx={{ fontSize: { xs: '0.6rem', sm: '0.75rem' }, height: { xs: '20px', sm: '24px' } }}
              />
              <Chip
                label={media.isPublic ? t('public') : t('private')}
                size="small"
                color={media.isPublic ? 'success' : 'warning'}
                variant="outlined"
                sx={{ fontSize: { xs: '0.6rem', sm: '0.75rem' }, height: { xs: '20px', sm: '24px' } }}
              />
              {media.deletedAt && (
                <Chip
                  label={t('deleted')}
                  size="small"
                  color="error"
                  variant="outlined"
                  sx={{ fontSize: { xs: '0.6rem', sm: '0.75rem' }, height: { xs: '20px', sm: '24px' } }}
                />
              )}
            </Box>
          </Box>
          {media.usageCount > 0 && (
            <Badge badgeContent={media.usageCount} color="primary">
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: { xs: '0.65rem', sm: '0.75rem' } }}
              >
                {t('used')}
              </Typography>
            </Badge>
          )}
        </Box>
      </CardContent>
      <CardActions sx={{ pt: 0, pb: 1, px: 1 }}>
        <Tooltip title={t('copyUrl')}>
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onCopyUrl(media.url);
            }}
            sx={{ '& svg': { fontSize: { xs: '0.875rem', sm: '1.25rem' } } }}
          >
            <ContentCopy fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={media.isPublic ? t('hide') : t('show')}>
          <IconButton
            size="small"
            color={media.isPublic ? 'success' : 'default'}
            onClick={(e) => {
              e.stopPropagation();
              onTogglePublic(media);
            }}
            sx={{ '& svg': { fontSize: { xs: '0.875rem', sm: '1.25rem' } } }}
          >
            {media.isPublic ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
          </IconButton>
        </Tooltip>
        {media.deletedAt ? (
          <Tooltip title={t('restore')}>
            <IconButton
              size="small"
              color="primary"
              onClick={(e) => {
                e.stopPropagation();
                onRestore(media._id);
              }}
              sx={{ '& svg': { fontSize: { xs: '0.875rem', sm: '1.25rem' } } }}
            >
              <Restore fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : (
          <>
            <Tooltip title={t('edit')}>
              <IconButton
                size="small"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(media);
                }}
                sx={{ '& svg': { fontSize: { xs: '0.875rem', sm: '1.25rem' } } }}
              >
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title={t('delete')}>
              <IconButton
                size="small"
                color="error"
                onClick={async (e) => {
                  e.stopPropagation();
                  await confirmDelete(media);
                }}
                sx={{ '& svg': { fontSize: { xs: '0.875rem', sm: '1.25rem' } } }}
              >
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          </>
        )}
      </CardActions>
    </Card>
  );
};

