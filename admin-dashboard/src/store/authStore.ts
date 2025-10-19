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
  isAuthenticated: boolean;

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
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,

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
    if (!user || !user.permissions) return false;
    return user.permissions.includes(permission);
  },

  initialize: () => {
    try {
      const userDataStr = localStorage.getItem(STORAGE_KEYS.USER_DATA);
      const isAuthenticated = TokenService.isAuthenticated();

      if (userDataStr && isAuthenticated) {
        const user = JSON.parse(userDataStr);
        set({ user, isAuthenticated: true });
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
