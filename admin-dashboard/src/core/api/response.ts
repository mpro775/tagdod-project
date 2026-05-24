export function unwrapApiData<T>(payload: unknown, fallback?: T): T {
  const value = payload as {
    success?: boolean;
    data?: unknown;
  };

  if (value?.success === true && 'data' in value) {
    const inner = value.data as { success?: boolean; data?: unknown } | undefined;
    if (inner?.success === true && 'data' in inner) {
      return inner.data as T;
    }
    return inner as T;
  }

  if (
    value?.data &&
    typeof value.data === 'object' &&
    (value.data as { success?: boolean }).success === true &&
    'data' in value.data
  ) {
    return (value.data as { data: unknown }).data as T;
  }

  if (value?.data !== undefined) {
    return value.data as T;
  }

  return (fallback ?? payload) as T;
}

export function unwrapApiMeta<TMeta = unknown>(payload: unknown): TMeta | undefined {
  const value = payload as {
    meta?: TMeta;
    pagination?: TMeta;
    data?: {
      meta?: TMeta;
      pagination?: TMeta;
    };
  };

  return value?.meta ?? value?.data?.meta ?? value?.pagination ?? value?.data?.pagination;
}
