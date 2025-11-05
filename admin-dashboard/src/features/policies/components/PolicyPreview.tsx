import React from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { useBreakpoint } from '@/shared/hooks/useBreakpoint';

interface PolicyPreviewProps {
  title: string;
  content: string;
  language?: 'ar' | 'en';
}

export const PolicyPreview: React.FC<PolicyPreviewProps> = ({
  title,
  content,
  language = 'ar',
}) => {
  const theme = useTheme();
  const { isMobile, isTablet } = useBreakpoint();
  const isRTL = language === 'ar';

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, sm: 2.5, md: 3 },
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        bgcolor: theme.palette.background.paper,
      }}
    >
      <Typography
        variant={isMobile ? 'h6' : isTablet ? 'h5' : 'h5'}
        component="h1"
        gutterBottom
        sx={{
          fontWeight: 'bold',
          mb: { xs: 2, md: 3 },
          textAlign: isRTL ? 'right' : 'left',
          direction: isRTL ? 'rtl' : 'ltr',
          fontSize: isMobile ? '1.25rem' : isTablet ? '1.5rem' : '1.75rem',
          color: theme.palette.text.primary,
        }}
      >
        {title}
      </Typography>
      <Box
        sx={{
          direction: isRTL ? 'rtl' : 'ltr',
          textAlign: isRTL ? 'right' : 'left',
          color: theme.palette.text.primary,
          fontSize: isMobile ? theme.typography.body2.fontSize : theme.typography.body1.fontSize,
          '& p': {
            mb: { xs: 1.5, md: 2 },
            lineHeight: { xs: 1.6, md: 1.8 },
            color: theme.palette.text.primary,
          },
          '& h1': {
            fontWeight: 'bold',
            mt: { xs: 2, md: 3 },
            mb: { xs: 1.5, md: 2 },
            color: theme.palette.text.primary,
            fontSize: isMobile ? '1.3rem' : isTablet ? '1.5rem' : '1.75rem',
          },
          '& h2': {
            fontWeight: 'bold',
            mt: { xs: 2, md: 3 },
            mb: { xs: 1.5, md: 2 },
            color: theme.palette.text.primary,
            fontSize: isMobile ? '1.2rem' : isTablet ? '1.4rem' : '1.6rem',
          },
          '& h3': {
            fontWeight: 'bold',
            mt: { xs: 2, md: 3 },
            mb: { xs: 1.5, md: 2 },
            color: theme.palette.text.primary,
            fontSize: isMobile ? '1.1rem' : isTablet ? '1.3rem' : '1.45rem',
          },
          '& h4, & h5, & h6': {
            fontWeight: 'bold',
            mt: { xs: 2, md: 3 },
            mb: { xs: 1.5, md: 2 },
            color: theme.palette.text.primary,
            fontSize: isMobile ? '1.1rem' : undefined,
          },
          '& ul, & ol': {
            pl: isRTL ? 0 : { xs: 2, md: 3 },
            pr: isRTL ? { xs: 2, md: 3 } : 0,
            mb: { xs: 1.5, md: 2 },
            color: theme.palette.text.primary,
          },
          '& li': {
            mb: { xs: 0.5, md: 1 },
            color: theme.palette.text.primary,
            lineHeight: { xs: 1.6, md: 1.8 },
          },
          '& a': {
            color: theme.palette.primary.main,
            textDecoration: 'underline',
            '&:hover': {
              color: theme.palette.primary.dark,
              textDecoration: 'underline',
            },
            '&:visited': {
              color:
                theme.palette.mode === 'dark'
                  ? theme.palette.primary.light
                  : theme.palette.primary.dark,
            },
          },
          '& img': {
            maxWidth: '100%',
            height: 'auto',
            borderRadius: 1,
            my: { xs: 1.5, md: 2 },
            display: 'block',
            boxShadow: theme.shadows[2],
          },
          '& blockquote': {
            borderLeft: isRTL ? 'none' : `4px solid ${theme.palette.primary.main}`,
            borderRight: isRTL ? `4px solid ${theme.palette.primary.main}` : 'none',
            pl: isRTL ? 0 : { xs: 1.5, md: 2 },
            pr: isRTL ? { xs: 1.5, md: 2 } : 0,
            my: { xs: 1.5, md: 2 },
            fontStyle: 'italic',
            color: theme.palette.text.secondary,
            backgroundColor:
              theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(0, 0, 0, 0.02)',
            borderRadius: 1,
            py: 1,
          },
          '& code': {
            backgroundColor:
              theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.1)'
                : 'rgba(0, 0, 0, 0.05)',
            color: theme.palette.text.primary,
            padding: '2px 6px',
            borderRadius: 0.5,
            fontSize: isMobile ? '0.85em' : '0.9em',
            fontFamily: 'monospace',
          },
          '& pre': {
            backgroundColor:
              theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(0, 0, 0, 0.03)',
            color: theme.palette.text.primary,
            padding: { xs: 1, md: 1.5 },
            borderRadius: 1,
            overflowX: 'auto',
            mb: { xs: 1.5, md: 2 },
            border: `1px solid ${theme.palette.divider}`,
          },
          '& table': {
            width: '100%',
            borderCollapse: 'collapse',
            mb: { xs: 1.5, md: 2 },
            overflowX: 'auto',
            display: 'block',
            '& th, & td': {
              border: `1px solid ${theme.palette.divider}`,
              padding: { xs: '8px', md: '12px' },
              textAlign: isRTL ? 'right' : 'left',
              color: theme.palette.text.primary,
            },
            '& th': {
              backgroundColor:
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'rgba(0, 0, 0, 0.02)',
              fontWeight: 'bold',
            },
          },
          '& strong, & b': {
            fontWeight: 'bold',
            color: theme.palette.text.primary,
          },
          '& em, & i': {
            fontStyle: 'italic',
            color: theme.palette.text.primary,
          },
          '& hr': {
            border: 'none',
            borderTop: `1px solid ${theme.palette.divider}`,
            my: { xs: 2, md: 3 },
          },
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </Paper>
  );
};
