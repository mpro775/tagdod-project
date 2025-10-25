import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  Paper,
  Grid,
  AppBar,
  Toolbar,
  IconButton,
} from '@mui/material';
import { colors, gradients } from './colors';

/**
 * أمثلة على استخدام ألوان Tagadodo في المكونات
 * هذا الملف يحتوي على أمثلة عملية لاستخدام الألوان
 */

// مثال على بطاقة باستخدام الألوان
export const ColorCard: React.FC = () => (
  <Card
    sx={{
      maxWidth: 345,
      backgroundColor: colors.background.paper,
      border: `2px solid ${colors.border.primary}`,
      boxShadow: `0 4px 8px ${colors.shadow.primary}`,
      borderRadius: 2,
    }}
  >
    <CardContent>
      <Typography variant="h5" color="primary" gutterBottom>
        بطاقة Tagadodo
      </Typography>
      <Typography variant="body2" color="text.secondary">
        مثال على استخدام الألوان في البطاقات
      </Typography>
      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
        <Chip
          label="أساسي"
          sx={{
            backgroundColor: colors.primary.main,
            color: colors.primary.contrastText,
          }}
        />
        <Chip
          label="ثانوي"
          sx={{
            backgroundColor: colors.secondary.main,
            color: colors.secondary.contrastText,
          }}
        />
      </Box>
    </CardContent>
  </Card>
);

// مثال على أزرار باستخدام الألوان
export const ColorButtons: React.FC = () => (
  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
    <Button
      variant="contained"
      sx={{
        backgroundColor: colors.primary.main,
        '&:hover': {
          backgroundColor: colors.primary.dark,
        },
      }}
    >
      زر أساسي
    </Button>

    <Button
      variant="outlined"
      sx={{
        borderColor: colors.secondary.main,
        color: colors.secondary.main,
        '&:hover': {
          backgroundColor: colors.secondary.light,
          borderColor: colors.secondary.dark,
        },
      }}
    >
      زر ثانوي
    </Button>

    <Button
      variant="text"
      sx={{
        color: colors.primary.main,
        '&:hover': {
          backgroundColor: colors.primary.light,
        },
      }}
    >
      زر نص
    </Button>
  </Box>
);

// مثال على شريط تنقل
export const ColorAppBar: React.FC = () => (
  <AppBar
    position="static"
    sx={{
      background: gradients.primary,
      boxShadow: `0 2px 4px ${colors.shadow.primary}`,
    }}
  >
    <Toolbar>
      <Typography variant="h6" sx={{ color: colors.text.light, flexGrow: 1 }}>
        Tagadodo
      </Typography>
      <IconButton color="inherit">
        <Typography>☰</Typography>
      </IconButton>
    </Toolbar>
  </AppBar>
);

// مثال على شبكة ألوان
export const ColorPalette: React.FC = () => (
  <Grid container spacing={2}>
    <Grid component="div" size={{ xs: 12 }}>
      <Typography variant="h4" gutterBottom>
        لوحة ألوان Tagadodo
      </Typography>
    </Grid>

    {/* الألوان الأساسية */}
    <Grid component="div" size={{ xs: 12, md: 6 }}>
      <Paper
        sx={{
          p: 2,
          backgroundColor: colors.primary.main,
          color: colors.primary.contrastText,
        }}
      >
        <Typography variant="h6">اللون الأساسي</Typography>
        <Typography variant="body2">{colors.primary.main}</Typography>
      </Paper>
    </Grid>

    <Grid component="div" size={{ xs: 12, md: 6 }}>
      <Paper
        sx={{
          p: 2,
          backgroundColor: colors.secondary.main,
          color: colors.secondary.contrastText,
        }}
      >
        <Typography variant="h6">اللون الثانوي</Typography>
        <Typography variant="body2">{colors.secondary.main}</Typography>
      </Paper>
    </Grid>

    {/* الألوان المحايدة */}
    <Grid component="div" size={{ xs: 12, md: 4 }}>
      <Paper
        sx={{
          p: 2,
          backgroundColor: colors.neutral.black,
          color: colors.text.light,
        }}
      >
        <Typography variant="h6">أسود</Typography>
        <Typography variant="body2">{colors.neutral.black}</Typography>
      </Paper>
    </Grid>

    <Grid component="div" size={{ xs: 12, md: 4 }}>
      <Paper
        sx={{
          p: 2,
          backgroundColor: colors.neutral.dark,
          color: colors.text.light,
        }}
      >
        <Typography variant="h6">رمادي داكن</Typography>
        <Typography variant="body2">{colors.neutral.dark}</Typography>
      </Paper>
    </Grid>

    <Grid component="div" size={{ xs: 12, md: 4 }}>
      <Paper
        sx={{
          p: 2,
          backgroundColor: colors.neutral.light,
          color: colors.text.primary,
        }}
      >
        <Typography variant="h6">رمادي فاتح</Typography>
        <Typography variant="body2">{colors.neutral.light}</Typography>
      </Paper>
    </Grid>

    {/* ألوان الحالة */}
    <Grid component="div" size={{ xs: 12, md: 3 }}>
      <Paper
        sx={{
          p: 2,
          backgroundColor: colors.status.success,
          color: colors.text.primary,
        }}
      >
        <Typography variant="h6">نجاح</Typography>
        <Typography variant="body2">{colors.status.success}</Typography>
      </Paper>
    </Grid>

    <Grid component="div" size={{ xs: 12, md: 3 }}>
      <Paper
        sx={{
          p: 2,
          backgroundColor: colors.status.warning,
          color: colors.text.primary,
        }}
      >
        <Typography variant="h6">تحذير</Typography>
        <Typography variant="body2">{colors.status.warning}</Typography>
      </Paper>
    </Grid>

    <Grid component="div" size={{ xs: 12, md: 3 }}>
      <Paper
        sx={{
          p: 2,
          backgroundColor: colors.status.error,
          color: colors.text.light,
        }}
      >
        <Typography variant="h6">خطأ</Typography>
        <Typography variant="body2">{colors.status.error}</Typography>
      </Paper>
    </Grid>

    <Grid component="div" size={{ xs: 12, md: 3 }}>
      <Paper
        sx={{
          p: 2,
          backgroundColor: colors.status.info,
          color: colors.text.light,
        }}
      >
        <Typography variant="h6">معلومات</Typography>
        <Typography variant="body2">{colors.status.info}</Typography>
      </Paper>
    </Grid>
  </Grid>
);

// مثال على التدرجات
export const GradientExamples: React.FC = () => (
  <Grid container spacing={2}>
    <Grid component="div" size={{ xs: 12 }}>
      <Typography variant="h4" gutterBottom>
        أمثلة التدرجات
      </Typography>
    </Grid>

    <Grid component="div" size={{ xs: 12, md: 4 }}>
      <Paper
        sx={{
          p: 3,
          background: gradients.primary,
          color: colors.text.light,
          textAlign: 'center',
        }}
      >
        <Typography variant="h6">تدرج أساسي</Typography>
      </Paper>
    </Grid>

    <Grid component="div" size={{ xs: 12, md: 4 }}>
      <Paper
        sx={{
          p: 3,
          background: gradients.secondary,
          color: colors.text.primary,
          textAlign: 'center',
        }}
      >
        <Typography variant="h6">تدرج ثانوي</Typography>
      </Paper>
    </Grid>

    <Grid component="div" size={{ xs: 12, md: 4 }}>
      <Paper
        sx={{
          p: 3,
          background: gradients.brand,
          color: colors.text.light,
          textAlign: 'center',
        }}
      >
        <Typography variant="h6">تدرج العلامة التجارية</Typography>
      </Paper>
    </Grid>
  </Grid>
);

// مكون رئيسي يجمع كل الأمثلة
export const ColorShowcase: React.FC = () => (
  <Box sx={{ p: 3 }}>
    <ColorAppBar />
    <Box sx={{ mt: 3 }}>
      <ColorPalette />
      <Box sx={{ mt: 4 }}>
        <GradientExamples />
      </Box>
      <Box sx={{ mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          أمثلة المكونات
        </Typography>
        <Grid container spacing={3}>
          <Grid component="div" size={{ xs: 12, md: 6 }}>
            <ColorCard />
          </Grid>
          <Grid component="div" size={{ xs: 12, md: 6 }}>
            <ColorButtons />
          </Grid>
        </Grid>
      </Box>
    </Box>
  </Box>
);

export default ColorShowcase;
