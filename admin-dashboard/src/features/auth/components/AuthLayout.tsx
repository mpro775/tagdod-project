import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Container,
  useTheme,
  useMediaQuery,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '@/store/themeStore';

const StyledContainer = styled(Container)(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: theme.palette.mode === 'dark'
    ? `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.grey[900]} 100%)`
    : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  padding: theme.spacing(2),
}));

const StyledCard = styled(Card)(({ theme }) => ({
  maxWidth: 450,
  width: '100%',
  background: theme.palette.background.paper,
  boxShadow: theme.palette.mode === 'dark'
    ? '0 4px 20px rgba(0, 0, 0, 0.5)'
    : '0 4px 20px rgba(0, 0, 0, 0.1)',
  borderRadius: 12,
  [theme.breakpoints.down('sm')]: {
    maxWidth: '100%',
    borderRadius: 8,
  },
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
  background: theme.palette.primary.main,
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: `0 2px 8px ${theme.palette.primary.main}33`,
}));

const LogoText = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.contrastText,
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
  const { t } = useTranslation('auth');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { mode, toggleMode } = useThemeStore();

  return (
    <StyledContainer maxWidth={false}>
      {/* زر تبديل الوضع */}
      <Box
        sx={{
          position: 'absolute',
          top: { xs: 8, sm: 16 },
          [theme.direction === 'rtl' ? 'right' : 'left']: { xs: 8, sm: 16 },
        }}
      >
        <Tooltip title={mode === 'dark' ? t('theme.light') : t('theme.dark')}>
          <IconButton onClick={toggleMode} color="primary" size={isMobile ? 'small' : 'medium'}>
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
        </Tooltip>
      </Box>

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
