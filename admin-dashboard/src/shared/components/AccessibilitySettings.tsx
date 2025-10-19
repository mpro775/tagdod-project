import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  Stack,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Accessibility as AccessibilityIcon,
  Visibility as VisibilityIcon,
  Speed as SpeedIcon,
  Language as LanguageIcon,
  Palette as PaletteIcon,
} from '@mui/icons-material';
import { useThemeStore } from '@/store/themeStore';
import { useAccessibility } from '@/shared/hooks/useAccessibility';

interface AccessibilitySettingsProps {
  onClose?: () => void;
}

export const AccessibilitySettings: React.FC<AccessibilitySettingsProps> = () => {
  const {
    mode,
    direction,
    language,
    highContrast,
    reducedMotion,
    toggleMode,
    toggleDirection,
    setHighContrast,
    setReducedMotion,
  } = useThemeStore();

  const { useHighContrastMode, useReducedMotion } = useAccessibility();

  // Detect system preferences
  const systemHighContrast = useHighContrastMode();
  const systemReducedMotion = useReducedMotion();

  const handleHighContrastToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setHighContrast(event.target.checked);
  };

  const handleReducedMotionToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setReducedMotion(event.target.checked);
  };

  const handleLanguageToggle = () => {
    toggleDirection();
  };

  const handleThemeToggle = () => {
    toggleMode();
  };

  return (
    <Card sx={{ maxWidth: 600, mx: 'auto' }}>
      <CardContent>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <AccessibilityIcon color="primary" />
          <Typography variant="h5" component="h2">
            إعدادات إمكانية الوصول
          </Typography>
        </Box>

        <Stack spacing={3}>
          {/* Language and Direction */}
          <Box>
            <Typography variant="h6" gutterBottom>
              اللغة والاتجاه
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <LanguageIcon />
              <Typography variant="body2" sx={{ flexGrow: 1 }}>
                {language === 'ar' ? 'العربية (RTL)' : 'English (LTR)'}
              </Typography>
              <Chip
                label={direction.toUpperCase()}
                color={direction === 'rtl' ? 'primary' : 'default'}
                size="small"
              />
              <Tooltip title="تبديل اللغة والاتجاه">
                <IconButton onClick={handleLanguageToggle} aria-label="تبديل اللغة">
                  <LanguageIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Divider />

          {/* Theme */}
          <Box>
            <Typography variant="h6" gutterBottom>
              المظهر
            </Typography>
            <Box display="flex" alignItems="center" gap={2}>
              <PaletteIcon />
              <Typography variant="body2" sx={{ flexGrow: 1 }}>
                {mode === 'light' ? 'الوضع الفاتح' : 'الوضع الداكن'}
              </Typography>
              <Chip
                label={mode === 'light' ? 'فاتح' : 'داكن'}
                color={mode === 'dark' ? 'primary' : 'default'}
                size="small"
              />
              <Tooltip title="تبديل المظهر">
                <IconButton onClick={handleThemeToggle} aria-label="تبديل المظهر">
                  <PaletteIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Divider />

          {/* High Contrast */}
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={highContrast}
                  onChange={handleHighContrastToggle}
                  aria-describedby="high-contrast-description"
                />
              }
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <VisibilityIcon />
                  <Typography>التباين العالي</Typography>
                  {systemHighContrast && (
                    <Chip label="نظام" size="small" color="info" />
                  )}
                </Box>
              }
            />
            <Typography
              id="high-contrast-description"
              variant="body2"
              color="text.secondary"
              sx={{ ml: 4, mt: 0.5 }}
            >
              تحسين التباين للألوان والنصوص لسهولة القراءة
            </Typography>
          </Box>

          {/* Reduced Motion */}
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={reducedMotion}
                  onChange={handleReducedMotionToggle}
                  aria-describedby="reduced-motion-description"
                />
              }
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  <SpeedIcon />
                  <Typography>تقليل الحركة</Typography>
                  {systemReducedMotion && (
                    <Chip label="نظام" size="small" color="info" />
                  )}
                </Box>
              }
            />
            <Typography
              id="reduced-motion-description"
              variant="body2"
              color="text.secondary"
              sx={{ ml: 4, mt: 0.5 }}
            >
              تقليل أو إزالة الحركات والانتقالات
            </Typography>
          </Box>

          <Divider />

          {/* Current Settings Summary */}
          <Box>
            <Typography variant="h6" gutterBottom>
              الإعدادات الحالية
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip
                label={`اللغة: ${language === 'ar' ? 'العربية' : 'English'}`}
                color="primary"
                variant="outlined"
              />
              <Chip
                label={`الاتجاه: ${direction.toUpperCase()}`}
                color="secondary"
                variant="outlined"
              />
              <Chip
                label={`المظهر: ${mode === 'light' ? 'فاتح' : 'داكن'}`}
                color="default"
                variant="outlined"
              />
              {highContrast && (
                <Chip
                  label="تباين عالي"
                  color="warning"
                  variant="filled"
                />
              )}
              {reducedMotion && (
                <Chip
                  label="حركة محدودة"
                  color="info"
                  variant="filled"
                />
              )}
            </Stack>
          </Box>

          {/* Accessibility Tips */}
          <Box>
            <Typography variant="h6" gutterBottom>
              نصائح إمكانية الوصول
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2">
                • استخدم مفتاح Tab للتنقل بين العناصر
              </Typography>
              <Typography variant="body2">
                • استخدم مفتاح Enter أو Space لتفعيل الأزرار
              </Typography>
              <Typography variant="body2">
                • استخدم مفاتيح الأسهم للتنقل في القوائم
              </Typography>
              <Typography variant="body2">
                • استخدم مفتاح Escape لإغلاق النوافذ المنبثقة
              </Typography>
            </Stack>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default AccessibilitySettings;
