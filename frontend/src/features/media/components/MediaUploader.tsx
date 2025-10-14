import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Typography,
  LinearProgress,
  Alert,
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { FormSelect } from '@/shared/components/Form/FormSelect';
import { useUploadMedia } from '../hooks/useMedia';
import { MediaCategory } from '../types/media.types';

interface MediaUploaderProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MediaCategory>(MediaCategory.OTHER);
  const [description, setDescription] = useState('');
  const [preview, setPreview] = useState<string | null>(null);

  const { mutate: upload, isPending } = useUploadMedia();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setName(selectedFile.name.split('.')[0]);

      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      }
    }
  };

  const handleUpload = () => {
    if (!file || !name) return;

    upload(
      {
        file,
        data: {
          name,
          category,
          description,
          isPublic: true,
        },
      },
      {
        onSuccess: () => {
          handleClose();
          onSuccess?.();
        },
      }
    );
  };

  const handleClose = () => {
    setFile(null);
    setName('');
    setDescription('');
    setPreview(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>رفع ملف جديد</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          {/* File Input */}
          <Grid size={{ xs: 12 }}>
            <Button
              variant="outlined"
              component="label"
              fullWidth
              startIcon={<CloudUpload />}
              sx={{ py: 2 }}
            >
              اختر ملف
              <input type="file" hidden onChange={handleFileChange} accept="image/*" />
            </Button>
          </Grid>

          {/* File Info */}
          {file && (
            <>
              <Grid size={{ xs: 12 }}>
                <Alert severity="info">
                  الملف: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </Alert>
              </Grid>

              {/* Preview */}
              {preview && (
                <Grid size={{ xs: 12 }}>
                  <Box
                    component="img"
                    src={preview}
                    sx={{
                      width: '100%',
                      maxHeight: 200,
                      objectFit: 'contain',
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  />
                </Grid>
              )}

              {/* Form Fields */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="اسم الملف *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <FormSelect
                  name="category"
                  label="الفئة"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as MediaCategory)}
                  options={[
                    { value: MediaCategory.PRODUCT, label: 'منتج' },
                    { value: MediaCategory.CATEGORY, label: 'فئة' },
                    { value: MediaCategory.BRAND, label: 'براند' },
                    { value: MediaCategory.BANNER, label: 'بانر' },
                    { value: MediaCategory.OTHER, label: 'أخرى' },
                  ]}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="الوصف"
                  multiline
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </Grid>

              {/* Progress */}
              {isPending && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="body2" gutterBottom>
                    جاري الرفع...
                  </Typography>
                  <LinearProgress />
                </Grid>
              )}
            </>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isPending}>
          إلغاء
        </Button>
        <Button
          variant="contained"
          onClick={handleUpload}
          disabled={!file || !name || isPending}
        >
          رفع
        </Button>
      </DialogActions>
    </Dialog>
  );
};

