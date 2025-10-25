import { create } from 'zustand';
import { TokenService } from '@/core/auth/tokenService';
import { STORAGE_KEYS } from '@/config/constants';

interface User {
  _id: string;
  phone: string;
  firstName: string;
  lastName?: string;
  email?: string;
  roles: string[];
  permissions?: string[];
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean | null; // null = loading, false = not authenticated, true = authenticated

  // Actions
  // eslint-disable-next-line no-unused-vars
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  // eslint-disable-next-line no-unused-vars
  updateUser: (user: User) => void;
  // eslint-disable-next-line no-unused-vars
  hasRole: (roles: string | string[]) => boolean;
  // eslint-disable-next-line no-unused-vars
  hasPermission: (permission: string) => boolean;
  initialize: () => void;
  refreshProfile: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: null, // Start as null to indicate loading state

  login: (user, accessToken, refreshToken) => {
    TokenService.setAccessToken(accessToken);
    TokenService.setRefreshToken(refreshToken);
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },

  logout: () => {
    TokenService.clearTokens();
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    set({ user: null, isAuthenticated: false });
  },

  updateUser: (user) => {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
    set({ user });
  },

  hasRole: (roles) => {
    const { user } = get();
    if (!user) return false;

    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.some((role) => user.roles.includes(role));
  },

  hasPermission: (permission) => {
    const { user } = get();
    return user && user.permissions ? user.permissions.includes(permission) : false;
  },

  refreshProfile: async () => {
    try {
      const { authApi } = await import('@/features/auth/api/authApi');
      const profileResponse = await authApi.getProfile();
      const currentUser = get().user;

      if (currentUser) {
        // Update user data with fresh data from server
        const updatedUser = {
          ...currentUser,
          roles: profileResponse.user?.roles || currentUser.roles || [],
          permissions: profileResponse.user?.permissions || currentUser.permissions || [],
        };

        localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
        set({ user: updatedUser });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to refresh user profile:', error);
      throw error;
    }
  },

  initialize: async () => {
    try {
      const userDataStr = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      const isAuthenticated = TokenService.isAuthenticated();

      if (userDataStr && isAuthenticated) {
        const user = JSON.parse(userDataStr);

        // Always try to get fresh user data from server first
        try {
          const { authApi } = await import('@/features/auth/api/authApi');
          const profileResponse = await authApi.getProfile();

          // Update user data with fresh data from server
          const updatedUser = {
            ...user,
            roles: profileResponse.user?.roles || user.roles || [],
            permissions: profileResponse.user?.permissions || user.permissions || [],
          };

          localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));
          set({ user: updatedUser, isAuthenticated: true });
        } catch (profileError) {
          // If API call fails, try to use cached data if it has roles/permissions
          if (user.roles && user.roles.length > 0 && user.permissions && user.permissions.length > 0) {
            set({ user, isAuthenticated: true });
          } else {
            // Cached data is incomplete, logout user
            get().logout();
          }
        }
      } else {
        set({ user: null, isAuthenticated: false });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to initialize auth store:', error);
      get().logout();
    }
  },
}));
