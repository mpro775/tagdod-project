import { useCallback, useEffect, useState } from 'react';
import ExchangeRatesApiService, {
  ExchangeRateSyncJob,
  ExchangeRateSyncJobStatus,
} from '../api/exchangeRatesApi';

const POLLING_INTERVAL = 15000; // Increased from 5s to 15s to reduce server load

interface UseExchangeRateSyncJobResult {
  job: ExchangeRateSyncJob | null;
  loading: boolean;
  retryingProductId: string | null;
  error: string | null;
  refresh: () => Promise<void>;
  retryProduct: (productId: string) => Promise<void>;
}

const isJobActive = (status: ExchangeRateSyncJobStatus | undefined) =>
  status === 'pending' || status === 'running';

export const useExchangeRateSyncJob = (jobId: string | undefined): UseExchangeRateSyncJobResult => {
  const [job, setJob] = useState<ExchangeRateSyncJob | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [retryingProductId, setRetryingProductId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchJob = useCallback(async () => {
    if (!jobId) {
      return;
    }
    try {
      setError(null);
      const data = await ExchangeRatesApiService.getSyncJob(jobId);
      setJob(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'فشل في جلب تفاصيل المهمة';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  useEffect(() => {
    if (!job || !isJobActive(job.status)) {
      return;
    }

    const interval = setInterval(() => {
      fetchJob().catch(() => {
        // handled via state
      });
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [job, fetchJob]);

  const refresh = useCallback(async () => {
    await fetchJob();
  }, [fetchJob]);

  const retryProduct = useCallback(
    async (productId: string) => {
      if (!jobId) {
        return;
      }
      try {
        setRetryingProductId(productId);
        setError(null);
        const updatedJob = await ExchangeRatesApiService.retrySyncJobProduct(jobId, productId);
        setJob(updatedJob);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'فشل في إعادة محاولة المزامنة لهذا المنتج';
        setError(message);
        throw err;
      } finally {
        setRetryingProductId(null);
      }
    },
    [jobId],
  );

  return {
    job,
    loading,
    retryingProductId,
    error,
    refresh,
    retryProduct,
  };
};

export default useExchangeRateSyncJob;

