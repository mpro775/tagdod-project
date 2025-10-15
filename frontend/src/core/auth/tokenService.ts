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
    console.log('🔑 Access token saved');
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
    console.log('🔄 Refresh token saved');
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
      console.log('❌ No access token found');
      return false;
    }
    
    // Check if token is expired (basic check)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      if (payload.exp && payload.exp < now) {
        console.log('❌ Token expired');
        this.clearTokens();
        return false;
      }
      console.log('✅ Token is valid');
      return true;
    } catch (error) {
      console.log('❌ Invalid token format');
      this.clearTokens();
      return false;
    }
  }
}

