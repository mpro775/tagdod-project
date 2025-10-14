export const PUSH_PORT = 'PushPort';
export interface PushPort {
  send(
    to: Array<{ userId: string; token: string; platform: 'ios' | 'android' | 'web' }>,
    title: string,
    body: string,
    data?: Record<string, unknown>,
  ): Promise<void>;
}
export class NullPushAdapter implements PushPort {
  async send() {
    /* no-op */
  }
}
