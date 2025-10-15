import React from 'react';
import { Box, styled } from '@mui/material';

const BackgroundContainer = styled(Box)(() => ({
  position: 'relative',
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(120, 119, 198, 0.2) 0%, transparent 50%)
    `,
    zIndex: 0,
  },
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
    zIndex: 0,
  },
}));

  const FloatingShape = styled(Box)(() => ({
  position: 'absolute',
  borderRadius: '50%',
  background: 'rgba(255, 255, 255, 0.1)',
  animation: 'float 6s ease-in-out infinite',
  '&:nth-of-type(1)': {
    width: 80,
    height: 80,
    top: '10%',
    left: '10%',
    animationDelay: '0s',
  },
  '&:nth-of-type(2)': {
    width: 120,
    height: 120,
    top: '20%',
    right: '10%',
    animationDelay: '2s',
  },
  '&:nth-of-type(3)': {
    width: 60,
    height: 60,
    bottom: '20%',
    left: '20%',
    animationDelay: '4s',
  },
  '@keyframes float': {
    '0%, 100%': {
      transform: 'translateY(0px)',
    },
    '50%': {
      transform: 'translateY(-20px)',
    },
  },
}));

interface AuthBackgroundProps {
  children: React.ReactNode;
}

export const AuthBackground: React.FC<AuthBackgroundProps> = ({ children }) => {
  return (
    <BackgroundContainer>
      <FloatingShape />
      <FloatingShape />
      <FloatingShape />
      {children}
    </BackgroundContainer>
  );
};
