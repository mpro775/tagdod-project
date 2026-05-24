import { STORAGE_KEYS } from '@/config/constants';

export class TokenService {
  /**
   * Get access token
   */
  static getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  /**
   * Set access token
   */
  static setAccessToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
  }

  /**
   * Get refresh token
   */
  static getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Set refresh token
   */
  static setRefreshToken(token: string): void {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
  }

  /**
   * Clear tokens
   */
  static clearTokens(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  /**
   * Check if user is authenticated
   */
  static isAuthenticated(): boolean {
    const token = this.getAccessToken();
    if (!token) {
      return false;
    }
    
    // Check if token is expired (basic check)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      if (payload.exp && payload.exp < now) {
        this.clearTokens();
        return false;
      }
      return true;
    } catch {
      this.clearTokens();
      return false;
    }
  }
}

