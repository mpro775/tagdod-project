import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  padding: theme.spacing(2),
}));

const StyledCard = styled(Card)(() => ({
  maxWidth: 450,
  width: '100%',
  background: '#ffffff',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  borderRadius: 12,
}));

const HeaderSection = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(4),
  paddingTop: theme.spacing(2),
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  width: 60,
  height: 60,
  margin: '0 auto',
  marginBottom: theme.spacing(2),
  background: '#667eea',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 8px rgba(102, 126, 234, 0.2)',
}));

const LogoText = styled(Typography)(() => ({
  color: 'white',
  fontSize: '1.5rem',
  fontFamily: 'Cairo',
}));

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  showLogo?: boolean;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  children,
  showLogo = true,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <StyledContainer maxWidth={false}>
      <StyledCard elevation={0}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <HeaderSection>
            {showLogo && (
              <LogoContainer>
                <LogoText>ت</LogoText>
              </LogoContainer>
            )}
            <Typography
              variant={isMobile ? 'h5' : 'h4'}
              gutterBottom
              color="primary"
              sx={{ mb: 1, fontFamily: 'Cairo' }}
            >
              {title}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: '0.9rem', sm: '1rem' }, fontFamily: 'Cairo' }}
            >
              {subtitle}
            </Typography>
          </HeaderSection>

          {children}
        </CardContent>
      </StyledCard>
    </StyledContainer>
  );
};
