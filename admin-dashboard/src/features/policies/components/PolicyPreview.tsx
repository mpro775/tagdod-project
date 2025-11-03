import React from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';

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
  const isRTL = language === 'ar';

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        bgcolor: theme.palette.background.paper,
      }}
    >
      <Typography
        variant="h5"
        component="h1"
        gutterBottom
        sx={{
          fontWeight: 'bold',
          mb: 3,
          textAlign: isRTL ? 'right' : 'left',
          direction: isRTL ? 'rtl' : 'ltr',
        }}
      >
        {title}
      </Typography>
      <Box
        sx={{
          direction: isRTL ? 'rtl' : 'ltr',
          textAlign: isRTL ? 'right' : 'left',
          '& p': {
            mb: 2,
            lineHeight: 1.8,
          },
          '& h1, & h2, & h3, & h4, & h5, & h6': {
            fontWeight: 'bold',
            mt: 3,
            mb: 2,
          },
          '& ul, & ol': {
            pl: isRTL ? 0 : 3,
            pr: isRTL ? 3 : 0,
            mb: 2,
          },
          '& li': {
            mb: 1,
          },
          '& a': {
            color: theme.palette.primary.main,
            textDecoration: 'underline',
          },
          '& img': {
            maxWidth: '100%',
            height: 'auto',
            borderRadius: 1,
            my: 2,
          },
          '& blockquote': {
            borderLeft: isRTL ? 'none' : `4px solid ${theme.palette.primary.main}`,
            borderRight: isRTL ? `4px solid ${theme.palette.primary.main}` : 'none',
            pl: isRTL ? 0 : 2,
            pr: isRTL ? 2 : 0,
            my: 2,
            fontStyle: 'italic',
            color: theme.palette.text.secondary,
          },
        }}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </Paper>
  );
};
