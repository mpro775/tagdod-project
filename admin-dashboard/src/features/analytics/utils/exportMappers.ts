import type { ExportFile, ExportFormat } from '../types/exports';

export const normalizeExportFormat = (format?: string): ExportFormat => {
  const normalized = String(format || '').toLowerCase();

  if (normalized === 'excel' || normalized === 'xls') return 'xlsx';
  if (normalized === 'pdf') return 'pdf';
  if (normalized === 'csv') return 'csv';
  if (normalized === 'json') return 'json';

  return 'xlsx';
};

export const normalizeFileResult = (payload: any): ExportFile => {
  const data = payload?.data?.data ?? payload?.data ?? payload;

  if (typeof data === 'string') {
    return {
      fileUrl: data,
      fileName: data.split('/').pop() || 'export-file',
      format: 'xlsx',
      status: 'available',
      exportedAt: new Date().toISOString(),
    };
  }

  return {
    exportId: data?.exportId ?? data?.id ?? data?._id,
    id: data?.id ?? data?.exportId ?? data?._id,

    reportId: data?.reportId,
    reportTitle: data?.reportTitle ?? data?.title,

    fileUrl: data?.fileUrl ?? data?.url ?? '',
    fileName:
      data?.fileName ??
      data?.filename ??
      data?.name ??
      'export-file',

    format: normalizeExportFormat(data?.format),
    fileSize: Number(data?.fileSize ?? data?.size ?? 0) || undefined,

    status: data?.status ?? 'available',
    exportedAt:
      data?.exportedAt ??
      data?.generatedAt ??
      data?.createdAt ??
      new Date().toISOString(),

    generatedAt: data?.generatedAt,
    generatedBy: data?.generatedBy,
    category: data?.category,
    source: data?.source,
  };
};

export const mapExportFile = (file: any): ExportFile => {
  return normalizeFileResult(file);
};

export const formatFileSize = (bytes?: number): string => {
  const value = Number(bytes || 0);

  if (value <= 0) return 'غير معروف';

  const units = ['B', 'KB', 'MB', 'GB'];
  let size = value;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};
