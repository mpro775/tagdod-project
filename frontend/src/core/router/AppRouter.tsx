import  { Suspense } from 'react';
import { useRoutes } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { routes } from './routes';

const LoadingFallback = () => (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
    }}
  >
    <CircularProgress />
  </Box>
);

export const AppRouter: React.FC = () => {
  const element = useRoutes(routes);

  return <Suspense fallback={<LoadingFallback />}>{element}</Suspense>;
};

