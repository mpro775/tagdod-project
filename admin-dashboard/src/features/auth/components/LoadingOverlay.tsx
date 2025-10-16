import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Backdrop,
  Fade,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledBackdrop = styled(Backdrop)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  background: 'rgba(0, 0, 0, 0.5)',
  backdropFilter: 'blur(4px)',
}));

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(4),
  background: 'rgba(255, 255, 255, 0.95)',
  borderRadius: 16,
  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
}));

interface LoadingOverlayProps {
  open: boolean;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  open,
  message = 'جارٍ التحميل...',
}) => {
  return (
    <StyledBackdrop open={open}>
      <Fade in={open}>
        <LoadingContainer>
          <CircularProgress
            size={60}
            thickness={4}
            sx={{
              color: '#667eea',
              '& .MuiCircularProgress-circle': {
                strokeLinecap: 'round',
              },
            }}
          />
          <Typography
            variant="body1"
            color="text.primary"
            sx={{
              textAlign: 'center',
              fontFamily: 'Cairo',
            }}
          >
            {message}
          </Typography>
        </LoadingContainer>
      </Fade>
    </StyledBackdrop>
  );
};
