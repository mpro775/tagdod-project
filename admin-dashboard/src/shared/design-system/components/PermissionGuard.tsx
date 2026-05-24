import type { ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';

export interface PermissionGuardProps {
  children: ReactNode;
  permissions?: string | string[];
  roles?: string | string[];
  requireAll?: boolean;
  fallback?: ReactNode;
}

const toArray = (value?: string | string[]) => {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
};

export function PermissionGuard({
  children,
  permissions,
  roles,
  requireAll = false,
  fallback = null,
}: PermissionGuardProps) {
  const { hasPermission, hasRole } = useAuthStore();
  const permissionList = toArray(permissions);
  const roleList = toArray(roles);

  const permissionAllowed =
    permissionList.length === 0 ||
    (requireAll
      ? permissionList.every((permission) => hasPermission(permission))
      : permissionList.some((permission) => hasPermission(permission)));

  const roleAllowed =
    roleList.length === 0 ||
    (requireAll ? roleList.every((role) => hasRole(role)) : roleList.some((role) => hasRole(role)));

  return permissionAllowed && roleAllowed ? <>{children}</> : <>{fallback}</>;
}

export default PermissionGuard;
