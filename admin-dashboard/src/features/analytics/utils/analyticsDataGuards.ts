export type ApiEnvelope<T = unknown> = {
  success?: boolean;
  data?: T;
  requestId?: string;
  message?: string;
};

export type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  meta: PaginationMeta;
};

export const unwrapApiData = <T = any>(response: any): T => {
  // Handle double-wrapped responses:
  // response.data = { success, data: { success, data: {...}, requestId }, requestId }
  const outerData = response?.data ?? response;
  const innerData = outerData?.data ?? outerData;
  // If innerData has its own data property (double-wrapped), return it
  if (innerData?.data !== undefined && innerData?.success !== undefined) {
    return innerData.data;
  }
  // Otherwise return innerData (single-wrapped or already unwrapped)
  return innerData;
};

export const unwrapNestedApiData = <T = any>(response: any): T => {
  const first = unwrapApiData<any>(response);
  return first?.data ?? first;
};

export const asArray = <T = any>(value: unknown): T[] => {
  return Array.isArray(value) ? value : [];
};

export const toNumber = (value: unknown, fallback = 0): number => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

export const toStringValue = (value: unknown, fallback = ''): string => {
  if (value === null || value === undefined) return fallback;
  return String(value);
};

export const toBoolean = (value: unknown, fallback = false): boolean => {
  if (typeof value === 'boolean') return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return fallback;
};

export const normalizeFormat = (format?: string): string => {
  if (!format) return 'pdf';
  const lowered = String(format).toLowerCase();
  if (lowered === 'excel') return 'xlsx';
  return lowered;
};

export type PaginatedResult<T> = PaginatedResponse<T>;

export const buildPaginationMeta = (
  meta: any,
  rowsLength: number,
  defaults?: Partial<PaginationMeta>
): PaginationMeta => {
  const page = toNumber(meta?.page, defaults?.page ?? 1);
  const limit = toNumber(meta?.limit, defaults?.limit ?? rowsLength);
  const total = toNumber(meta?.total, defaults?.total ?? rowsLength);
  const totalPages = toNumber(
    meta?.totalPages,
    defaults?.totalPages ?? Math.max(1, Math.ceil(total / Math.max(1, limit)))
  );

  return { total, page, limit, totalPages };
};

export const unwrapPaginatedResult = <T = any>(
  response: any,
  mapper?: (item: any) => T,
  defaults?: Partial<PaginationMeta>
): PaginatedResult<T> => {
  const payload = unwrapApiData<any>(response);

  const rowsSource = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : [];

  const rows = mapper ? rowsSource.map(mapper) : rowsSource;
  const meta = buildPaginationMeta(payload?.meta ?? payload, rows.length, defaults);

  return { data: rows, meta };
};

export const normalizePaginatedResponse = <T = any>(
  payload: any,
  mapper: (item: any) => T,
  fallback?: Partial<PaginationMeta>
): PaginatedResponse<T> => {
  const unwrapped = payload?.data?.data?.data ?? payload?.data?.data ?? payload?.data ?? payload;

  const rowsRaw = Array.isArray(unwrapped)
    ? unwrapped
    : Array.isArray(unwrapped?.data)
      ? unwrapped.data
      : [];

  const metaRaw = !Array.isArray(unwrapped)
    ? unwrapped?.meta ?? {}
    : {};

  const rows = rowsRaw.map(mapper);

  return {
    data: rows,
    meta: {
      total: Number(metaRaw.total ?? fallback?.total ?? rows.length),
      page: Number(metaRaw.page ?? fallback?.page ?? 1),
      limit: Number(metaRaw.limit ?? fallback?.limit ?? rows.length),
      totalPages: Number(metaRaw.totalPages ?? fallback?.totalPages ?? 1),
    },
  };
};
