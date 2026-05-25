import type {
  SmsCampaignStatus,
  SmsCampaignTarget,
  SmsRecipientStatus,
} from '../types/smsCampaign.types';

export const campaignStatusLabels: Record<SmsCampaignStatus, string> = {
  draft: 'مسودة',
  previewed: 'تمت المعاينة',
  queued: 'في الطابور',
  sending: 'قيد الإرسال',
  paused: 'متوقفة مؤقتاً',
  completed: 'مكتملة',
  failed: 'فشلت جزئياً',
  cancelled: 'ملغاة',
};

export const recipientStatusLabels: Record<SmsRecipientStatus, string> = {
  queued: 'في الانتظار',
  sending: 'قيد الإرسال',
  sent: 'ناجح',
  failed: 'فاشل',
  skipped: 'تم التخطي',
};

export const targetLabels: Record<SmsCampaignTarget, string> = {
  all: 'كل المستخدمين',
  customers: 'العملاء فقط',
  engineers: 'المهندسون المعتمدون',
  merchants: 'التجار المعتمدون',
  admins: 'المدراء',
  custom: 'اختيار يدوي',
};
