import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Box, CircularProgress, Alert, Typography, Button } from '@mui/material';
import { Security, Home } from '@mui/icons-material';
import { trackError, trackAdminAction } from '@/lib/analytics';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
  requireAdmin?: boolean;
  fallbackPath?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  requireAdmin = true,
  fallbackPath = '/unauthorized',
}) => {
  const location = useLocation();
  const { isAuthenticated, user, hasRole, hasPermission, initialize } = useAuthStore();

  // Loading state - check if we're still initializing
  const [isInitializing, setIsInitializing] = React.useState(true);
  
  useEffect(() => {
    // Initialize auth and then set loading to false
    try {
      console.log('🔄 Initializing ProtectedRoute...');
      initialize();
      // Add a small delay to ensure state is updated
      setTimeout(() => {
        setIsInitializing(false);
      }, 100);
    } catch (error) {
      console.error('❌ Error initializing auth:', error);
      setIsInitializing(false);
    }
  }, [initialize]);

  if (isInitializing) {
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
    console.log('❌ User not authenticated, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if user is admin (for admin dashboard)
  if (requireAdmin && user && !user.roles.includes('admin') && !user.roles.includes('super_admin')) {
    console.log('❌ User does not have admin privileges');
    trackError('Access denied: Admin privileges required', 'ADMIN_REQUIRED', 'ProtectedRoute');
    trackAdminAction('access_denied', 'admin_dashboard', { reason: 'insufficient_admin_privileges' });
    return <Navigate to={fallbackPath} replace />;
  }

  // Check role permissions
  if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
    console.log('❌ User does not have required roles:', requiredRoles);
    trackError('Access denied: Required roles missing', 'ROLE_REQUIRED', 'ProtectedRoute');
    trackAdminAction('access_denied', 'protected_route', { requiredRoles, userRoles: user?.roles });
    return <Navigate to={fallbackPath} replace />;
  }

  // Check specific permissions
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every((permission) =>
      hasPermission(permission)
    );
    if (!hasAllPermissions) {
      const missingPermissions = requiredPermissions.filter(permission => !hasPermission(permission));
      console.log('❌ User does not have required permissions:', missingPermissions);
      trackError('Access denied: Required permissions missing', 'PERMISSION_REQUIRED', 'ProtectedRoute');
      trackAdminAction('access_denied', 'protected_route', { 
        requiredPermissions, 
        missingPermissions,
        userPermissions: user?.permissions 
      });
      return <Navigate to={fallbackPath} replace />;
    }
  }

  console.log('✅ User authenticated and authorized');
  return <>{children}</>;
};

