import React, { useState, useCallback } from 'react';
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
  Paper,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Card,
  CardMedia,
  CardContent,
  Skeleton,
} from '@mui/material';
import {
  CloudUpload,
  Image,
  VideoFile,
  Description,
  CheckCircle,  
} from '@mui/icons-material';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { useUploadMedia } from '../hooks/useMedia';
import { useTranslation } from 'react-i18next';
import { MediaCategory } from '../types/media.types';

interface MediaUploaderProps {
  open: boolean;
  onClose: () => void;
  // eslint-disable-next-line no-unused-vars
  onSuccess?: (media?: any) => void;
  defaultCategory?: MediaCategory;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  open,
  onClose,
  onSuccess,
  defaultCategory = MediaCategory.OTHER
}) => {
  const { t } = useTranslation('media');
  const [activeStep, setActiveStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState<MediaCategory>(defaultCategory);
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { mutate: upload, isPending } = useUploadMedia();



  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setName(selectedFile.name.split('.')[0]);
      setUploadError(null);

      // Create preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      }
      
      // Auto-advance to next step
      setActiveStep(1);
    }
  }, []);

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) return <Image />;
    if (file.type.startsWith('video/')) return <VideoFile />;
    return <Description />;
  };


  const handleAddTag = useCallback(() => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  }, [tagInput, tags]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  }, [tags]);

  const handleNext = useCallback(() => {
    setActiveStep(prev => prev + 1);
  }, []);

  const handleBack = useCallback(() => {
    setActiveStep(prev => prev - 1);
  }, []);

  const handleClose = useCallback(() => {
    setActiveStep(0);
    setFile(null);
    setName('');
    setDescription('');
    setTags([]);
    setTagInput('');
    setIsPublic(true);
    setPreview(null);
    setUploadProgress(0);
    setUploadError(null);
    onClose();
  }, [onClose]);

  const handleUpload = useCallback(() => {
    if (!file || !name) return;

    setUploadProgress(0);
    setUploadError(null);

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
        onSuccess: (response) => {
          setUploadProgress(100);
          setTimeout(() => {
            handleClose();
            onSuccess?.(response.media);
          }, 1000);
        },
        onError: (error) => {
          setUploadError((error as Error).message || t('uploader.uploadError'));
        },
      }
    );
  }, [file, name, category, description, tags, isPublic, upload, onSuccess, handleClose]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CloudUpload color="primary" />
          <Typography variant="h6">{t('uploadNewFile')}</Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          <Stepper activeStep={activeStep} orientation="vertical">
            {/* Step 1: File Selection */}
            <Step>
              <StepLabel>{t('uploader.selectFile')}</StepLabel>
              <StepContent>
                <Paper
                  sx={{
                    p: 3,
                    border: '2px dashed',
                    borderColor: file ? 'success.main' : 'grey.300',
                    bgcolor: file ? 'success.light' : 'grey.50',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      borderColor: 'primary.main',
                      bgcolor: 'primary.light',
                    },
                  }}
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <input
                    id="file-input"
                    type="file"
                    hidden
                    onChange={handleFileChange}
                    accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                  />
                  
                  {file ? (
                    <Box>
                      <CheckCircle color="success" sx={{ fontSize: 48, mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        {t('uploader.fileSelected')}
                      </Typography>
                      <Card sx={{ maxWidth: 300, mx: 'auto' }}>
                        {preview ? (
                          <CardMedia
                            component="img"
                            height="150"
                            image={preview}
                            alt={file.name}
                            sx={{ objectFit: 'cover' }}
                          />
                        ) : (
                          <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {getFileIcon(file)}
                          </Box>
                        )}
                        <CardContent>
                          <Typography variant="body2" fontWeight="medium" noWrap>
                            {file.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatFileSize(file.size)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Box>
                  ) : (
                    <Box>
                      <CloudUpload sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                      <Typography variant="h6" gutterBottom>
                        {t('uploader.selectFile')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {t('uploader.dragDrop')}
                      </Typography>
                    </Box>
                  )}
                </Paper>
                
                {file && (
                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="contained" onClick={handleNext}>
                      {t('next')}
                    </Button>
                  </Box>
                )}
              </StepContent>
            </Step>

            {/* Step 2: Data Entry */}
            <Step>
              <StepLabel>{t('uploader.fileDetails')}</StepLabel>
              <StepContent>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label={`${t('uploader.fileName')} *`}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      helperText={t('uploader.fileName')}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControl fullWidth>
                      <InputLabel>{t('uploader.category')}</InputLabel>
                      <Select
                        value={category}
                        label={t('uploader.category')}
                        onChange={(e) => setCategory(e.target.value as MediaCategory)}
                      >
                        <MenuItem value={MediaCategory.PRODUCT}>{t('categories.product')}</MenuItem>
                        <MenuItem value={MediaCategory.CATEGORY}>{t('categories.category')}</MenuItem>
                        <MenuItem value={MediaCategory.BRAND}>{t('categories.brand')}</MenuItem>
                        <MenuItem value={MediaCategory.BANNER}>{t('categories.banner')}</MenuItem>
                        <MenuItem value={MediaCategory.OTHER}>{t('categories.other')}</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={isPublic}
                          onChange={(e) => setIsPublic(e.target.checked)}
                        />
                      }
                      label={t('uploader.publicFile')}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label={t('uploader.description')}
                      multiline
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder={t('uploader.description')}
                    />
                  </Grid>

                  <Grid size={{ xs: 12 }}>
                    <TextField
                      fullWidth
                      label={t('uploader.tags')}
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddTag();
                        }
                      }}
                      placeholder={t('uploader.addTag')}
                      helperText={t('uploader.tags')}
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
                </Grid>

                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <Button onClick={handleBack}>السابق</Button>
                  <Button variant="contained" onClick={handleNext} disabled={!name}>
                    التالي
                  </Button>
                </Box>
              </StepContent>
            </Step>

            {/* Step 3: Review and Upload */}
            <Step>
              <StepLabel>مراجعة الرفع</StepLabel>
              <StepContent>
                <Paper sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    مراجعة البيانات
                  </Typography>
                  
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        اسم الملف:
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {name}
                      </Typography>
                    </Grid>
                    
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        الفئة:
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {category}
                      </Typography>
                    </Grid>
                    
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        الحالة:
                      </Typography>
                      <Chip 
                        label={isPublic ? 'عام' : 'خاص'} 
                        color={isPublic ? 'success' : 'warning'} 
                        size="small" 
                      />
                    </Grid>
                    
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        الحجم:
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {file ? formatFileSize(file.size) : 'غير محدد'}
                      </Typography>
                    </Grid>
                    
                    {description && (
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="body2" color="text.secondary">
                          الوصف:
                        </Typography>
                        <Typography variant="body1">
                          {description}
                        </Typography>
                      </Grid>
                    )}
                    
                    {tags.length > 0 && (
                      <Grid size={{ xs: 12 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          الوسوم:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                          {tags.map((tag) => (
                            <Chip key={tag} label={tag} size="small" />
                          ))}
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </Paper>

                {/* Upload Progress */}
                {isPending && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" gutterBottom>
                      جاري الرفع...
                    </Typography>
                    <LinearProgress variant="determinate" value={uploadProgress} />
                  </Box>
                )}

                {/* Upload Error */}
                {uploadError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {uploadError}
                  </Alert>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button onClick={handleBack} disabled={isPending}>
                    السابق
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={handleUpload} 
                    disabled={!file || !name || isPending}
                    startIcon={isPending ? <Skeleton width={20} height={20} /> : <CloudUpload />}
                  >
                    {isPending ? 'جاري الرفع...' : 'رفع الملف'}
                  </Button>
                </Box>
              </StepContent>
            </Step>
          </Stepper>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={handleClose} disabled={isPending}>
          إلغاء
        </Button>
      </DialogActions>
    </Dialog>
  );
};
