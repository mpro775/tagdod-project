import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  useTheme,
  Stack,
} from '@mui/material';
import {
  Download as DownloadIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';
import { DataExportDialog } from '../components/DataExportDialog';

export const DataExportPage: React.FC = () => {
  const theme = useTheme();
  const { t } = useTranslation('analytics');
  const { isMobile } = useBreakpoint();
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Box sx={{ width: '100%', px: { xs: 1, sm: 0 } }}>
      {/* Header */}
      <Paper
        elevation={1}
        sx={{
          p: { xs: 2, sm: 3 },
          mb: { xs: 2, sm: 3 },
          background: theme.palette.mode === 'dark'
            ? `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.success.main} 100%)`
            : `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
          color: 'white',
        }}
      >
        <Stack
          direction={isMobile ? 'column' : 'row'}
          spacing={isMobile ? 1.5 : 0}
          sx={{
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'center',
            gap: { xs: 1.5, sm: 2 },
          }}
        >
          <Box>
            <Typography 
              variant={isMobile ? 'h5' : 'h4'} 
              component="h1" 
              gutterBottom
              sx={{ 
                fontSize: isMobile ? '1.5rem' : undefined,
                fontWeight: 'bold',
              }}
            >
              {t('export.title')}
            </Typography>
            <Typography 
              variant={isMobile ? 'body2' : 'body1'} 
              sx={{ 
                opacity: 0.9,
                fontSize: isMobile ? '0.875rem' : undefined,
              }}
            >
              {t('export.description')}
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<FileDownloadIcon sx={{ fontSize: isMobile ? 18 : undefined }} />}
            onClick={() => setDialogOpen(true)}
            size={isMobile ? 'medium' : 'large'}
            sx={{
              backgroundColor: 'white',
              color: theme.palette.success.main,
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              },
              fontSize: isMobile ? '0.875rem' : undefined,
              width: isMobile ? '100%' : 'auto',
            }}
          >
            {t('export.startExport')}
          </Button>
        </Stack>
      </Paper>

      {/* Info Card */}
      <Card sx={{ mb: { xs: 2, sm: 3 } }}>
        <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography 
            variant={isMobile ? 'h6' : 'h5'} 
            gutterBottom
            sx={{ 
              mb: 2,
              fontSize: isMobile ? '1.25rem' : undefined,
            }}
          >
            {t('export.instructions.title')}
          </Typography>
          <Typography 
            variant="body1" 
            color="text.secondary"
            sx={{ 
              fontSize: isMobile ? '0.875rem' : undefined,
              mb: 2,
            }}
          >
            {t('export.instructions.description')}
          </Typography>
          
          {/* Quick Actions */}
          <Box sx={{ mt: 3 }}>
            <Typography 
              variant="subtitle1" 
              gutterBottom
              sx={{ 
                fontSize: isMobile ? '1rem' : undefined,
                mb: 1.5,
              }}
            >
              {t('export.quickActions')}
            </Typography>
            <Stack 
              direction={isMobile ? 'column' : 'row'} 
              spacing={1.5}
              sx={{ flexWrap: 'wrap' }}
            >
              <Button
                variant="outlined"
                startIcon={<DownloadIcon sx={{ fontSize: isMobile ? 18 : undefined }} />}
                onClick={() => setDialogOpen(true)}
                size={isMobile ? 'medium' : 'medium'}
                fullWidth={isMobile}
                sx={{ fontSize: isMobile ? '0.875rem' : undefined }}
              >
                {t('export.startExport')}
              </Button>
              <Button
                variant="outlined"
                startIcon={<FileDownloadIcon sx={{ fontSize: isMobile ? 18 : undefined }} />}
                onClick={() => setDialogOpen(true)}
                size={isMobile ? 'medium' : 'medium'}
                fullWidth={isMobile}
                sx={{ fontSize: isMobile ? '0.875rem' : undefined }}
              >
                {t('export.exportData')}
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* Data Export Dialog */}
      <DataExportDialog 
        open={dialogOpen} 
        onClose={() => setDialogOpen(false)} 
      />
    </Box>
  );
};
