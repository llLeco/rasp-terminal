import { useState, useEffect, useCallback } from 'react';
import { subscribeToStats, requestStats } from '../services/socket';
import { stats as statsApi } from '../services/api';
import type { SystemStats, StatsHistory } from '../types';

export const useStats = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    requestStats();

    const unsubscribe = subscribeToStats((newStats) => {
      setStats(newStats);
      setLoading(false);
      setError(null);
    });

    return unsubscribe;
  }, []);

  const refresh = useCallback(() => {
    setLoading(true);
    requestStats();
  }, []);

  return { stats, loading, error, refresh };
};

export const useStatsHistory = (hours: number = 24) => {
  const [history, setHistory] = useState<StatsHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await statsApi.getHistory(hours);
      setHistory(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch history');
    } finally {
      setLoading(false);
    }
  }, [hours]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { history, loading, error, refresh: fetchHistory };
};
