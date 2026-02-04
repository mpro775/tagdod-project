import { io, Socket } from 'socket.io-client';
import { API_BASE_URL, STORAGE_KEYS } from '@/config/constants';

export interface NotificationPayload {
  id: string;
  title: string;
  message: string;
  messageEn: string;
  type: string;
  category?: string;
  priority?: string;
  data?: Record<string, unknown>;
  actionUrl?: string;
  navigationType?: string;
  navigationTarget?: string;
  createdAt: string;
  isRead: boolean;
}

class NotificationsSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map();
  private isInitialized = false;

  connect(): Socket | null {
    // إذا كان socket موجود ومتصل، ارجعه مباشرة
    if (this.socket?.connected) {
      return this.socket;
    }

    const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (!token) {
      console.warn('No token found, cannot connect to notifications socket');
      return null;
    }

    // إذا كان socket موجود لكن غير متصل، نظفه أولاً
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.isInitialized = false;
    }

    const wsUrl = API_BASE_URL.replace('/api/v1', '');
    
    this.socket = io(`${wsUrl}/notifications`, {
      auth: {
        token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: this.maxReconnectAttempts,
    });

    // إضافة listeners مرة واحدة فقط
    if (!this.isInitialized) {
      this.setupSocketListeners();
      this.isInitialized = true;
    }

    return this.socket;
  }

  private setupSocketListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Connected to notifications socket');
      this.reconnectAttempts = 0;
    });

    this.socket.on('connected', (data) => {
      console.log('✅ Authenticated with notifications socket:', data);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from notifications socket:', reason);
      if (reason === 'io server disconnect') {
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error);
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });

    this.socket.on('notification:new', (notification: NotificationPayload) => {
      this.emit('notification:new', notification);
    });

    this.socket.on('unread-count', (data: { count: number }) => {
      this.emit('unread-count', data);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
      this.isInitialized = false;
      this.listeners.clear();
    }
  }

  on(event: string, callback: (data: unknown) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (data: unknown) => void): void {
    if (callback) {
      this.listeners.get(event)?.delete(callback);
      if (this.socket) {
        this.socket.off(event, callback);
      }
    } else {
      this.listeners.delete(event);
      if (this.socket) {
        this.socket.removeAllListeners(event);
      }
    }
  }

  private emit(event: string, data: unknown): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in listener for ${event}:`, error);
        }
      });
    }
  }

  send(event: string, data: unknown): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot send:', event);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  reconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
    this.connect();
  }
}

export const notificationsSocket = new NotificationsSocketService();

