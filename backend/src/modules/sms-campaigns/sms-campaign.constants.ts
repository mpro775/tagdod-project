export const SMS_CAMPAIGN_QUEUE = 'sms-campaigns';
export const SMS_CAMPAIGN_SEND_JOB = 'send-campaign';

export enum SmsCampaignStatus {
  DRAFT = 'draft',
  PREVIEWED = 'previewed',
  QUEUED = 'queued',
  SENDING = 'sending',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum SmsRecipientStatus {
  QUEUED = 'queued',
  SENDING = 'sending',
  SENT = 'sent',
  FAILED = 'failed',
  SKIPPED = 'skipped',
}

export enum SmsCampaignTarget {
  ALL = 'all',
  CUSTOMERS = 'customers',
  ENGINEERS = 'engineers',
  MERCHANTS = 'merchants',
  ADMINS = 'admins',
  CUSTOM = 'custom',
}

export enum SmsProviderName {
  ALAWAEL = 'alawael',
}

export interface SmsCampaignJobData {
  campaignId: string;
  retryFailedOnly?: boolean;
}
