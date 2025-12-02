import React, { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Slider,
  Typography,
  IconButton,
  Stack,
  useTheme,
  Alert,
} from '@mui/material';
import { ZoomIn, ZoomOut, RotateLeft, RotateRight, Crop, Close, Check } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';

interface ImageCropperProps {
  open: boolean;
  imageSrc: string;
  onClose: () => void;
  onCropComplete: (croppedImage: Blob, croppedImageUrl: string) => void;
  aspectRatio?: number;
  minWidth?: number;
  minHeight?: number;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
  open,
  imageSrc,
  onClose,
  onCropComplete,
  aspectRatio = 1, // 1:1 مربع افتراضياً
  minWidth = 400,
  minHeight = 400,
}) => {
  const { t } = useTranslation('media');
  const theme = useTheme();
  const { isMobile } = useBreakpoint();

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropChange = useCallback((location: { x: number; y: number }) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const onRotationChange = useCallback((newRotation: number) => {
    setRotation(newRotation);
  }, []);

  const onCropCompleteHandler = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 1));
  };

  const handleRotateLeft = () => {
    setRotation((prev) => prev - 90);
  };

  const handleRotateRight = () => {
    setRotation((prev) => prev + 90);
  };

  const handleReset = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  const createCroppedImage = useCallback(async (): Promise<{
    blob: Blob;
    url: string;
  } | null> => {
    if (!croppedAreaPixels) return null;

    const image = new Image();
    image.src = imageSrc;

    return new Promise((resolve) => {
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(null);
          return;
        }

        // حساب الأبعاد مع مراعاة الدوران
        const rotRad = (rotation * Math.PI) / 180;
        const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
          image.width,
          image.height,
          rotation
        );

        // إعداد canvas بحجم الصورة المدورة
        canvas.width = bBoxWidth;
        canvas.height = bBoxHeight;

        // تحريك المركز
        ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
        ctx.rotate(rotRad);
        ctx.translate(-image.width / 2, -image.height / 2);

        // رسم الصورة
        ctx.drawImage(image, 0, 0);

        // إنشاء canvas للقص
        const croppedCanvas = document.createElement('canvas');
        const croppedCtx = croppedCanvas.getContext('2d');

        if (!croppedCtx) {
          resolve(null);
          return;
        }

        // تحديد حجم الصورة المقصوصة (الحد الأدنى)
        const outputWidth = Math.max(croppedAreaPixels.width, minWidth);
        const outputHeight = Math.max(croppedAreaPixels.height, minHeight);

        croppedCanvas.width = outputWidth;
        croppedCanvas.height = outputHeight;

        // رسم الجزء المقصوص
        croppedCtx.drawImage(
          canvas,
          croppedAreaPixels.x,
          croppedAreaPixels.y,
          croppedAreaPixels.width,
          croppedAreaPixels.height,
          0,
          0,
          outputWidth,
          outputHeight
        );

        // تحويل إلى Blob
        croppedCanvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              resolve({ blob, url });
            } else {
              resolve(null);
            }
          },
          'image/jpeg',
          0.95
        );
      };

      image.onerror = () => {
        resolve(null);
      };
    });
  }, [imageSrc, croppedAreaPixels, rotation, minWidth, minHeight]);

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      const result = await createCroppedImage();
      if (result) {
        onCropComplete(result.blob, result.url);
        handleClose();
      }
    } catch (error) {
      console.error('Error cropping image:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: {
          bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Crop color="primary" />
          <Typography variant="h6" sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}>
            {t('cropper.title', 'قص الصورة')}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, position: 'relative' }}>
        {/* تنبيه متطلبات الصورة */}
        <Alert severity="info" sx={{ m: 2, mb: 0 }}>
          <Typography variant="body2">
            {t(
              'cropper.info',
              'قم بتحديد المنطقة المربعة التي تريد قصها. الصورة يجب أن تكون مربعة (1:1)'
            )}
          </Typography>
        </Alert>

        {/* منطقة القص */}
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: { xs: 300, sm: 400, md: 450 },
            bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
          }}
        >
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspectRatio}
            onCropChange={onCropChange}
            onZoomChange={onZoomChange}
            onRotationChange={onRotationChange}
            onCropComplete={onCropCompleteHandler}
            cropShape="rect"
            showGrid={true}
            style={{
              containerStyle: {
                backgroundColor: theme.palette.mode === 'dark' ? '#1a1a1a' : '#f5f5f5',
              },
              cropAreaStyle: {
                border: `3px solid ${theme.palette.primary.main}`,
              },
            }}
          />
        </Box>

        {/* أدوات التحكم */}
        <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
          {/* التكبير */}
          <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
            <IconButton onClick={handleZoomOut} disabled={zoom <= 1}>
              <ZoomOut />
            </IconButton>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {t('cropper.zoom', 'التكبير')}: {Math.round(zoom * 100)}%
              </Typography>
              <Slider
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(_, value) => setZoom(value as number)}
                size="small"
              />
            </Box>
            <IconButton onClick={handleZoomIn} disabled={zoom >= 3}>
              <ZoomIn />
            </IconButton>
          </Stack>

          {/* الدوران */}
          <Stack direction="row" spacing={2} alignItems="center">
            <IconButton onClick={handleRotateLeft}>
              <RotateLeft />
            </IconButton>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                {t('cropper.rotation', 'الدوران')}: {rotation}°
              </Typography>
              <Slider
                value={rotation}
                min={-180}
                max={180}
                step={1}
                onChange={(_, value) => setRotation(value as number)}
                size="small"
              />
            </Box>
            <IconButton onClick={handleRotateRight}>
              <RotateRight />
            </IconButton>
          </Stack>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, bgcolor: 'background.paper', gap: 1 }}>
        <Button onClick={handleReset} color="inherit" disabled={isProcessing}>
          {t('cropper.reset', 'إعادة تعيين')}
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button onClick={handleClose} disabled={isProcessing}>
          {t('form.cancel', 'إلغاء')}
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={isProcessing}
          startIcon={isProcessing ? null : <Check />}
        >
          {isProcessing
            ? t('cropper.processing', 'جاري المعالجة...')
            : t('cropper.confirm', 'تأكيد القص')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/**
 * حساب أبعاد الصورة بعد الدوران
 */
function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = (rotation * Math.PI) / 180;
  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

export default ImageCropper;
