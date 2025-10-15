export const NOTIFICATIONS_PORT = 'NotificationsPort';
export interface NotificationsPort {
  emit(userId: string, templateKey: string, payload: Record<string, unknown>): Promise<void>;
}
