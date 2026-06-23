import { useEffect, useState } from 'react';

export type AsyncStatus = 'loading' | 'done' | 'error';

/**
 * Generic hook for fetching async data with loading/error state.
 * Re-runs whenever any value in `deps` changes.
 */
export function useAsyncData<T>(
  fetcher: () => Promise<T>,
  deps: unknown[],
): { data: T | null; status: AsyncStatus } {
  const [data, setData] = useState<T | null>(null);
  const [status, setStatus] = useState<AsyncStatus>('loading');

  useEffect(() => {
    let active = true;
    setStatus('loading');
    fetcher()
      .then(result => {
        if (!active) return;
        setData(result);
        setStatus('done');
      })
      .catch(() => {
        if (!active) return;
        setStatus('error');
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, status };
}
