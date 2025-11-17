import { useCallback, useEffect, useMemo, useState } from 'react';
import ExchangeRatesApiService, {
  ExchangeRateSyncJob,
  ExchangeRateSyncJobStatus,
} from '../api/exchangeRatesApi';

const POLLING_INTERVAL = 15000; // Increased from 5s to 15s to reduce server load

export interface UseExchangeRateSyncJobsResult {
  jobs: ExchangeRateSyncJob[];
  latestJob: ExchangeRateSyncJob | null;
  loading: boolean;
  triggering: boolean;
  error: string | null;
  triggerSync: () => Promise<void>;
  refresh: () => Promise<void>;
}

const isJobActive = (status: ExchangeRateSyncJobStatus | undefined): boolean => {
  return status === 'pending' || status === 'running';
};

export const useExchangeRateSyncJobs = (limit = 10): UseExchangeRateSyncJobsResult => {
  const [jobs, setJobs] = useState<ExchangeRateSyncJob[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [triggering, setTriggering] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      setError(null);
      const data = await ExchangeRatesApiService.listSyncJobs(limit);
      setJobs(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'فشل في جلب مهام المزامنة';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  const triggerSync = useCallback(async () => {
    try {
      setTriggering(true);
      setError(null);
      await ExchangeRatesApiService.triggerSyncJob();
      await fetchJobs();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'فشل في إطلاق مزامنة الأسعار';
      setError(message);
      throw err;
    } finally {
      setTriggering(false);
    }
  }, [fetchJobs]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const latestJob = useMemo(() => (jobs.length > 0 ? jobs[0] : null), [jobs]);

  useEffect(() => {
    if (!latestJob || !isJobActive(latestJob.status)) {
      return;
    }

    const interval = setInterval(() => {
      fetchJobs().catch(() => {
        // error handled via state already
      });
    }, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, [latestJob, fetchJobs]);

  const refresh = useCallback(async () => {
    await fetchJobs();
  }, [fetchJobs]);

  return {
    jobs,
    latestJob,
    loading,
    triggering,
    error,
    triggerSync,
    refresh,
  };
};

export default useExchangeRateSyncJobs;

