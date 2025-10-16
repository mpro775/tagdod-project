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
  FormControlLabel,
  Switch,
  Chip,
} from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useUploadMedia } from '../hooks/useMedia';
import { MediaCategory } from '../types/media.types';

interface MediaUploaderProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({ open, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MediaCategory>(MediaCategory.OTHER);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPublic, setIsPublic] = useState(true);
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

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
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
          tags,
          isPublic,
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
    setTags([]);
    setTagInput('');
    setIsPublic(true);
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
              <input 
                type="file" 
                hidden 
                onChange={handleFileChange} 
                accept="image/*,video/*,.pdf,.doc,.docx,.txt" 
              />
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
                <FormControl fullWidth>
                  <InputLabel>الفئة</InputLabel>
                  <Select
                    value={category}
                    label="الفئة"
                    onChange={(e) => setCategory(e.target.value as MediaCategory)}
                  >
                    <MenuItem value={MediaCategory.PRODUCT}>منتج</MenuItem>
                    <MenuItem value={MediaCategory.CATEGORY}>فئة</MenuItem>
                    <MenuItem value={MediaCategory.BRAND}>براند</MenuItem>
                    <MenuItem value={MediaCategory.BANNER}>بانر</MenuItem>
                    <MenuItem value={MediaCategory.OTHER}>أخرى</MenuItem>
                  </Select>
                </FormControl>
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

              {/* Tags */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="إضافة وسوم"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  placeholder="اكتب وسماً واضغط Enter"
                />
                {tags.length > 0 && (
                  <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        onDelete={() => handleRemoveTag(tag)}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                )}
              </Grid>

              {/* Public/Private */}
              <Grid size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                    />
                  }
                  label="ملف عام (يمكن للجميع الوصول إليه)"
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
        <Button variant="contained" onClick={handleUpload} disabled={!file || !name || isPending}>
          رفع
        </Button>
      </DialogActions>
    </Dialog>
  );
};
