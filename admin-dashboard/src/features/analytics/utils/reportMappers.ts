import { normalizeFormat, toBoolean, toNumber, toStringValue } from './analyticsDataGuards';

export const mapAdvancedReport = (report: any) => {
  const reportId = report?.reportId ?? report?.id ?? report?._id ?? '';

  return {
    ...report,
    id: report?.id ?? reportId,
    _id: report?._id ?? report?.id ?? reportId,
    reportId,
    title: toStringValue(report?.title, 'تقرير بدون عنوان'),
    titleEn: toStringValue(report?.titleEn, report?.title ?? 'Untitled Report'),
    category: toStringValue(report?.category, 'custom'),
    type: toStringValue(report?.type, report?.category ?? 'custom'),
    priority: toStringValue(report?.priority, 'medium'),
    status: toStringValue(report?.status, 'pending'),
    generatedAt: report?.generatedAt ?? report?.createdAt ?? null,
    createdAt: report?.createdAt ?? report?.generatedAt ?? null,
    updatedAt: report?.updatedAt ?? null,
    createdBy: report?.createdBy ?? null,
    creatorName: report?.creatorName ?? null,
    isArchived: toBoolean(report?.isArchived),
    archivedAt: report?.archivedAt ?? null,
    exports: Array.isArray(report?.exports) ? report.exports : [],
    summary: {
      totalRecords: toNumber(report?.summary?.totalRecords),
      totalValue: toNumber(report?.summary?.totalValue),
      currency: report?.summary?.currency ?? 'YER',
      growth: toNumber(report?.summary?.growth),
    },
  };
};

export const mapExportFile = (file: any) => {
  const raw = typeof file === 'string' ? { fileUrl: file } : file ?? {};

  return {
    id: raw.id ?? raw._id ?? raw.fileUrl ?? raw.url,
    reportId: raw.reportId,
    fileUrl: raw.fileUrl ?? raw.url ?? raw.downloadUrl ?? '',
    fileName: raw.fileName ?? raw.filename ?? 'export-file',
    format: normalizeFormat(raw.format),
    fileSize: toNumber(raw.fileSize ?? raw.size),
    exportedAt: raw.exportedAt ?? raw.generatedAt ?? raw.createdAt,
    generatedAt: raw.generatedAt ?? raw.exportedAt ?? raw.createdAt,
    generatedBy: raw.generatedBy,
    status: raw.status ?? 'available',
  };
};

export const mapExportResult = (result: any) => {
  if (typeof result === 'string') {
    return {
      fileUrl: result,
      fileName: result.split('/').pop() ?? 'report',
      format: 'unknown',
      fileSize: 0,
      exportedAt: new Date().toISOString(),
    };
  }

  const data = result?.data?.data ?? result?.data ?? result;

  return {
    fileUrl: data?.fileUrl ?? data?.url ?? data?.downloadUrl ?? '',
    fileName: data?.fileName ?? data?.filename ?? 'report',
    format: normalizeFormat(data?.format),
    fileSize: toNumber(data?.fileSize ?? data?.size),
    path: data?.path,
    exportedAt: data?.exportedAt ?? data?.generatedAt ?? new Date().toISOString(),
  };
};

export const mapSchedule = (schedule: any) => {
  const id = schedule?._id ?? schedule?.id ?? '';

  return {
    ...schedule,
    id,
    _id: schedule?._id ?? id,
    name: schedule?.name ?? schedule?.title ?? 'جدولة بدون اسم',
    title: schedule?.title ?? schedule?.name ?? 'جدولة بدون عنوان',
    reportType: schedule?.reportType ?? schedule?.type ?? 'custom_report',
    frequency: schedule?.frequency ?? 'monthly',
    status: schedule?.status ?? (schedule?.isActive === false ? 'paused' : 'active'),
    isActive: toBoolean(schedule?.isActive, schedule?.status !== 'paused'),
    recipients: Array.isArray(schedule?.recipients) ? schedule.recipients : [],
    nextRunAt: schedule?.nextRunAt ?? schedule?.nextRun ?? null,
    lastRunAt: schedule?.lastRunAt ?? schedule?.lastRun ?? null,
    lastResult: schedule?.lastResult ?? null,
    fileUrls: Array.isArray(schedule?.fileUrls) ? schedule.fileUrls : [],
    createdAt: schedule?.createdAt ?? null,
    updatedAt: schedule?.updatedAt ?? null,
  };
};
