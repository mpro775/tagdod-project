export type SmsCampaignStatus =
  | 'draft'
  | 'previewed'
  | 'queued'
  | 'sending'
  | 'paused'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type SmsRecipientStatus = 'queued' | 'sending' | 'sent' | 'failed' | 'skipped';

export type SmsCampaignTarget =
  | 'all'
  | 'customers'
  | 'engineers'
  | 'merchants'
  | 'admins'
  | 'custom';

export interface SmsCampaign {
  _id: string;
  title: string;
  message: string;
  target: SmsCampaignTarget;
  filters?: Record<string, unknown>;
  status: SmsCampaignStatus;
  totalMatchedUsers: number;
  totalRecipients: number;
  validRecipients: number;
  invalidRecipients: number;
  duplicatePhones: number;
  queuedCount: number;
  sendingCount: number;
  sentCount: number;
  failedCount: number;
  skippedCount: number;
  encoding: 'GSM_7' | 'UCS_2';
  messageLength: number;
  segmentsPerMessage: number;
  estimatedTotalSmsParts: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface SmsCampaignRecipient {
  _id: string;
  userName?: string;
  phone: string;
  normalizedPhone: string;
  status: SmsRecipientStatus;
  attempts: number;
  providerMessageId?: string;
  errorMessage?: string;
  createdAt: string;
  sentAt?: string;
}

export interface SmsCampaignFilters {
  city?: string;
}

export interface PreviewSmsCampaignDto {
  message: string;
  target: SmsCampaignTarget;
  filters?: SmsCampaignFilters;
  customUserIds?: string[];
}

export interface CreateSmsCampaignDto extends PreviewSmsCampaignDto {
  title: string;
  confirmSend: boolean;
}

export interface SendTestSmsDto {
  phone: string;
  message: string;
}

export interface SmsCampaignPreview {
  totalMatchedUsers: number;
  totalRecipients: number;
  validRecipients: number;
  invalidRecipients: number;
  duplicatePhones: number;
  encoding: 'GSM_7' | 'UCS_2';
  messageLength: number;
  segmentsPerMessage: number;
  estimatedTotalSmsParts: number;
  sampleRecipients: Array<{ userName?: string; phone: string; normalizedPhone: string }>;
  invalidSamples: Array<{ userId: string; phone?: string; reason: string }>;
  duplicateSamples: Array<{ phone: string; normalizedPhone: string }>;
}

export interface ListSmsCampaignsParams {
  page?: number;
  limit?: number;
  status?: SmsCampaignStatus;
  q?: string;
  from?: string;
  to?: string;
}

export interface ListSmsRecipientsParams {
  page?: number;
  limit?: number;
  status?: SmsRecipientStatus;
  q?: string;
}
