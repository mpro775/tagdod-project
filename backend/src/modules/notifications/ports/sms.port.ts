export const SMS_PORT = 'SmsPort';
export interface SmsPort {
  send(to: string, body: string): Promise<void>;
}
export class NullSmsAdapter implements SmsPort {
  async send() { /* no-op */ }
}
