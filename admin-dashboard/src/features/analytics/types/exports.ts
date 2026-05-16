/**
 * Export Types — متطابق مع المرحلة الرابعة
 */

export type ExportFileStatus =
  | 'available'
  | 'processing'
  | 'failed'
  | 'expired';

export type ExportFormat = 'pdf' | 'xlsx' | 'csv' | 'json';

export type ExportDataType =
  | 'sales'
  | 'products'
  | 'customers'
  | 'inventory'
  | 'financial'
  | 'marketing';

export type ExportFile = {
  exportId?: string;
  id?: string;

  reportId?: string;
  reportTitle?: string;

  fileUrl: string;
  fileName: string;
  format: ExportFormat;
  fileSize?: number;

  status: ExportFileStatus;
  exportedAt: string;
  generatedAt?: string;

  generatedBy?: string;
  category?: string;
  source?: string;
};

export type ExportFilesParams = {
  page?: number;
  limit?: number;
  search?: string;
  format?: ExportFormat;
  status?: ExportFileStatus;
  category?: string;
  startDate?: string;
  endDate?: string;
};

export type ExportDataParams = {
  type: ExportDataType;
  format: ExportFormat | string;
  startDate?: string;
  endDate?: string;
  filters?: Record<string, unknown>;
};
