import { useState, useEffect, useCallback } from 'react';
import type { SummaryData } from '@/lib/youtube';

const STORAGE_KEY = 'yt-summaries';

export function useSummaries() {
  const [summaries, setSummaries] = useState<SummaryData[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSummaries(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const save = useCallback((summary: SummaryData) => {
    setSummaries(prev => {
      const exists = prev.find(s => s.id === summary.id);
      const next = exists ? prev.map(s => s.id === summary.id ? summary : s) : [summary, ...prev];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setSummaries(prev => {
      const next = prev.filter(s => s.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateTags = useCallback((id: string, tags: string[]) => {
    setSummaries(prev => {
      const next = prev.map(s => s.id === id ? { ...s, tags } : s);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { summaries, save, remove, updateTags };
}
