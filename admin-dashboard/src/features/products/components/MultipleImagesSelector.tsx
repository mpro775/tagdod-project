import React from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardMedia,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { ImageField, MediaCategory, type Media } from '@/features/media';

interface MediaItem {
  _id?: string;
  url: string;
  name: string;
}

interface MultipleImagesSelectorProps {
  value: MediaItem[];
  // eslint-disable-next-line no-unused-vars
  onChange: (images: MediaItem[]) => void;
  maxImages?: number;
  label?: string;
}

export const MultipleImagesSelector: React.FC<MultipleImagesSelectorProps> = ({
  value = [],
  onChange,
  maxImages = 10,
  label,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);

  const handleAddImage = () => {
    setEditingIndex(null);
    setDialogOpen(true);
  };

  const handleEditImage = (index: number) => {
    setEditingIndex(index);
    setDialogOpen(true);
  };

  const handleDeleteImage = (index: number) => {
    const newImages = value.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const createImageItem = (media: Media, index: number) => ({
    _id: media._id,
    url: media.url,
    name: media.name || t('products:form.imageDefault', 'صورة {{number}}', { number: index + 1 }),
  });

  const handleImageSelect = (selectedMedia: Media | Media[] | null) => {
    if (!selectedMedia) return;

    const mediaArray = Array.isArray(selectedMedia) ? selectedMedia : [selectedMedia];

    if (mediaArray.length === 0) return;

    if (editingIndex !== null) {
      const [firstMedia] = mediaArray;
      if (!firstMedia) return;

      const newImages = [...value];
      newImages[editingIndex] = createImageItem(firstMedia, editingIndex);
      onChange(newImages);
    } else {
      const remainingSlots = Math.max(0, maxImages - value.length);
      if (remainingSlots === 0) {
        setDialogOpen(false);
        setEditingIndex(null);
        return;
      }

      const limitedMedia = mediaArray.slice(0, remainingSlots);
      if (limitedMedia.length === 0) {
        setDialogOpen(false);
        setEditingIndex(null);
        return;
      }

      const newImages = limitedMedia.map((media, idx) =>
        createImageItem(media, value.length + idx)
      );
      onChange([...value, ...newImages]);
    }

    setDialogOpen(false);
    setEditingIndex(null);
  };

  const canAddMore = value.length < maxImages;

  // Determine grid size based on screen size
  const getGridSize = () => {
    if (isMobile) return { xs: 12 };
    if (isTablet) return { xs: 6 };
    return { xs: 12, sm: 6, md: 4, lg: 3 };
  };

  return (
    <Box>
      <Box 
        display="flex" 
        alignItems="center" 
        justifyContent="space-between" 
        mb={2}
        flexDirection={isMobile ? 'column' : 'row'}
        gap={isMobile ? 1 : 0}
      >
        <Typography variant="subtitle1" fontWeight="medium">
          {label || t('products:form.images', 'صور المنتج')}
        </Typography>
        {canAddMore && (
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={handleAddImage}
            size={isMobile ? 'medium' : 'small'}
            fullWidth={isMobile}
          >
            {t('products:form.addImage', 'إضافة صورة')}
          </Button>
        )}
      </Box>

      {value.length === 0 ? (
        <Box
          sx={{
            border: 2,
            borderStyle: 'dashed',
            borderColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : '#ccc',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#fafafa',
          }}
        >
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {t('products:form.noImagesAdded', 'لا توجد صور مضافة')}
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddImage}
            disabled={!canAddMore}
          >
            {t('products:form.addFirstImage', 'إضافة أول صورة')}
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {value.map((image, index) => (
            <Grid size={getGridSize()} key={index}>
              <Card sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height={isMobile ? '200' : '200'}
                  image={image.url}
                  alt={image.name}
                  sx={{ objectFit: 'cover' }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    display: 'flex',
                    gap: 0.5,
                  }}
                >
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleEditImage(index)}
                    sx={{ 
                      backgroundColor: 'background.paper', 
                      '&:hover': { backgroundColor: 'action.hover' } 
                    }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteImage(index)}
                    sx={{ 
                      backgroundColor: 'background.paper', 
                      '&:hover': { backgroundColor: 'action.hover' } 
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
                <Box sx={{ p: 1 }}>
                  <Typography variant="caption" noWrap>
                    {image.name}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {value.length > 0 && canAddMore && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={handleAddImage}
            fullWidth={isMobile}
          >
            {t('products:form.addAnotherImage', 'إضافة صورة أخرى')}
          </Button>
        </Box>
      )}

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
        {t('products:form.imagesCount', '{{current}} من {{max}} صورة', { 
          current: value.length, 
          max: maxImages
        })}
      </Typography>

      {/* Image Selection Dialog */}
      <Dialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          {editingIndex !== null ? t('products:form.editImage', 'تعديل الصورة') : t('media:empty.selectImage', 'اختيار صورة')}
        </DialogTitle>
        <DialogContent>
          <ImageField
            label={editingIndex !== null ? t('products:form.selectNewImage', 'اختر صورة جديدة') : t('media:empty.selectImage', 'اختيار صورة')}
            value={
              editingIndex !== null && value[editingIndex]
                ? value[editingIndex].url
                : undefined
            }
            onChange={(media) => handleImageSelect(media)}
            onMultiChange={(media) => handleImageSelect(media)}
            category={MediaCategory.PRODUCT}
            helperText={t('media:uploader.selectFile', 'يمكنك اختيار صورة من المكتبة أو رفع صورة جديدة')}
            multiple={editingIndex === null}
            maxSelections={editingIndex !== null ? 1 : Math.max(1, maxImages - value.length)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            {t('common:actions.cancel', 'إلغاء')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
