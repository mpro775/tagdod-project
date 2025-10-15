import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Box, CircularProgress } from '@mui/material';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: string[];
  requiredPermissions?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  requiredPermissions = [],
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

  // Check role permissions
  if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check specific permissions
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every((permission) =>
      hasPermission(permission)
    );
    if (!hasAllPermissions) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Check if user is admin (for admin dashboard)
  if (user && !user.roles.includes('admin') && !user.roles.includes('super_admin')) {
    console.log('❌ User does not have admin privileges');
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('✅ User authenticated and authorized');
  return <>{children}</>;
};

