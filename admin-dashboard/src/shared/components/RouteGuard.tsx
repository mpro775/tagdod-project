import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Alert } from '@mui/material';
import { useAuthStore } from '@/store/authStore';
import { getRoutePermissions } from '@/shared/constants/route-permissions';

interface RouteGuardProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({
  children,
  fallbackPath = '/unauthorized',
}) => {
  const location = useLocation();
  const { isAuthenticated, user, hasRole, hasPermission } = useAuthStore();

  // Loading state
  if (isAuthenticated === null) {
    return (
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
  }

  // Not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user is admin (for admin dashboard)
  if (!user?.roles?.includes('admin') && !user?.roles?.includes('super_admin')) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          p: 3,
        }}
      >
        <Alert severity="error">
          غير مصرح لك بالوصول إلى لوحة التحكم. يتطلب صلاحيات إدارية.
        </Alert>
      </Box>
    );
  }

  // Get required permissions for this route
  const requiredPermissions = getRoutePermissions(location.pathname);

  // If no specific permissions required, allow access
  if (requiredPermissions.length === 0) {
    return <>{children}</>;
  }

  // Check if user has all required permissions
  const hasAllPermissions = requiredPermissions.every(permission =>
    hasPermission(permission)
  );

  if (!hasAllPermissions) {
    const missingPermissions = requiredPermissions.filter(
      permission => !hasPermission(permission)
    );

    console.warn('Access denied - Missing permissions:', missingPermissions);

    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          p: 3,
        }}
      >
        <Alert severity="warning">
          ليس لديك الصلاحيات المطلوبة للوصول إلى هذه الصفحة.
          <br />
          الصلاحيات المطلوبة: {requiredPermissions.join(', ')}
        </Alert>
      </Box>
    );
  }

  // All checks passed
  return <>{children}</>;
};
