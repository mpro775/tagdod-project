import React from 'react';
import { Box, Button, Typography, Container } from '@mui/material';
import { SearchOff } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}
      >
        <SearchOff sx={{ fontSize: 100, color: 'text.secondary', mb: 3 }} />

        <Typography variant="h3" fontWeight="bold" gutterBottom>
          404
        </Typography>

        <Typography variant="h5" color="text.secondary" gutterBottom>
          الصفحة غير موجودة
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          عذراً، الصفحة التي تبحث عنها غير موجودة
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button variant="contained" onClick={() => navigate('/dashboard')}>
            العودة للرئيسية
          </Button>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            رجوع
          </Button>
        </Box>
      </Box>
    </Container>
  );
};
