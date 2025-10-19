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
} from '@mui/material';
import { Add, Delete, Edit } from '@mui/icons-material';
import { ImageField } from '@/features/media';

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
  label = 'صور المنتج',
}) => {
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

  const handleImageSelect = (media: { _id?: string; url: string; name?: string } | null) => {
    if (!media) return;
    if (editingIndex !== null) {
      // Edit existing image
      const newImages = [...value];
      newImages[editingIndex] = {
        _id: media._id,
        url: media.url,
        name: media.name || `صورة ${editingIndex + 1}`,
      };
      onChange(newImages);
    } else {
      // Add new image
      const newImage = {
        _id: media._id,
        url: media.url,
        name: media.name || `صورة ${value.length + 1}`,
      };
      onChange([...value, newImage]);
    }
    setDialogOpen(false);
    setEditingIndex(null);
  };

  const canAddMore = value.length < maxImages;

  return (
    <Box>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="subtitle1" fontWeight="medium">
          {label}
        </Typography>
        {canAddMore && (
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={handleAddImage}
            size="small"
          >
            إضافة صورة
          </Button>
        )}
      </Box>

      {value.length === 0 ? (
        <Box
          sx={{
            border: '2px dashed #ccc',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            backgroundColor: '#fafafa',
          }}
        >
          <Typography variant="body2" color="text.secondary" gutterBottom>
            لا توجد صور مضافة
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAddImage}
            disabled={!canAddMore}
          >
            إضافة أول صورة
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {value.map((image, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={index}>
              <Card sx={{ position: 'relative' }}>
                <CardMedia
                  component="img"
                  height="200"
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
                    sx={{ backgroundColor: 'white', '&:hover': { backgroundColor: '#f5f5f5' } }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteImage(index)}
                    sx={{ backgroundColor: 'white', '&:hover': { backgroundColor: '#f5f5f5' } }}
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
          >
            إضافة صورة أخرى
          </Button>
        </Box>
      )}

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
        {value.length} من {maxImages} صور ({canAddMore ? 'يمكن إضافة المزيد' : 'الحد الأقصى'})
      </Typography>

      {/* Image Selection Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingIndex !== null ? 'تعديل الصورة' : 'اختيار صورة'}
        </DialogTitle>
        <DialogContent>
          <ImageField
            label={editingIndex !== null ? 'اختر صورة جديدة' : 'اختر صورة'}
            value={
              editingIndex !== null && value[editingIndex]
                ? value[editingIndex].url
                : undefined
            }
            onChange={handleImageSelect}
            category="product"
            helperText="يمكنك اختيار صورة من المكتبة أو رفع صورة جديدة"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>
            إلغاء
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
