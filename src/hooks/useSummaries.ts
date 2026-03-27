import { useState, useEffect } from 'react';
import type { SummaryData } from '@/lib/youtube';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

const API_URL = '/api/summaries';

export function useSummaries() {
  const { token, user, isLoading: isAuthLoading } = useAuth();
  const [summaries, setSummaries] = useState<SummaryData[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const isGuest = token?.startsWith('guest_session_');

  // Fetch summaries from backend on mount or when token changes
  useEffect(() => {
    if (isAuthLoading) return; // Wait for auth to initialize
    
    if (token) {
      if (isGuest) {
        // Load from local storage for guests
        const localData = localStorage.getItem('vidtube_guest_summaries');
        if (localData) {
          try {
            setSummaries(JSON.parse(localData));
          } catch (e) {
            setSummaries([]);
          }
        } else {
          setSummaries([]);
        }
      } else {
        fetchSummaries();
      }
    } else {
      setSummaries([]);
    }
  }, [token, isAuthLoading, isGuest]);

  const fetchSummaries = async () => {
    if (isGuest) return;
    setIsLoading(true);
    try {
      const response = await fetch(API_URL, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        // Transform backend data to SummaryData
        const transformedData = data.map((s: any) => ({
          ...s,
          key_points: typeof s.key_points === 'string' ? JSON.parse(s.key_points) : s.key_points,
          transcript: typeof s.transcript === 'string' ? JSON.parse(s.transcript) : s.transcript,
          tags: typeof s.tags === 'string' ? JSON.parse(s.tags) : s.tags,
        }));
        setSummaries(transformedData);
      } else if (response.status === 401) {
        console.warn('Session expired or invalid token. Redirecting to login...');
        localStorage.removeItem('vidtube_token');
        window.location.reload(); // Force re-auth
      }
    } catch (err) {
      console.error('Failed to fetch summaries:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const save = async (summary: SummaryData) => {
    if (!token) {
      toast.error('Log in to save summaries');
      return;
    }

    if (isGuest) {
      // Save locally for guests
      const newSummary = { ...summary, id: 'guest_' + Math.random().toString(36).substring(7), created_at: new Date().toISOString() };
      const updatedSummaries = [newSummary, ...summaries];
      setSummaries(updatedSummaries);
      localStorage.setItem('vidtube_guest_summaries', JSON.stringify(updatedSummaries));
      toast.success('Saved to local vault (Guest Session)');
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          video_id: summary.video_id,
          title: summary.title,
          author_name: summary.author_name,
          thumbnail: summary.thumbnail,
          summary: summary.summary,
          key_points: summary.key_points,
          transcript: summary.transcript,
          tags: summary.tags,
          overview: summary.overview,
          sentiment: summary.sentiment,
          views: summary.views,
          publish_date: summary.publish_date
        })
      });

      if (response.ok) {
        const savedSummary = await response.json();
        // Transform backend data to SummaryData
        const transformedSaved = {
          ...savedSummary,
          key_points: typeof savedSummary.key_points === 'string' ? JSON.parse(savedSummary.key_points) : savedSummary.key_points,
          transcript: typeof savedSummary.transcript === 'string' ? JSON.parse(savedSummary.transcript) : savedSummary.transcript,
          tags: typeof savedSummary.tags === 'string' ? JSON.parse(savedSummary.tags) : savedSummary.tags,
        };
        setSummaries(prev => [transformedSaved, ...prev]);
        toast.success('Summary saved to your library!');
      } else {
        throw new Error('Failed to save to database');
      }
    } catch (err) {
      toast.error('Failed to save summary local database');
      console.error(err);
    }
  };

  const remove = async (id: string) => {
    if (!token) return;

    if (isGuest || id.startsWith('guest_')) {
      const updatedSummaries = summaries.filter(s => s.id !== id);
      setSummaries(updatedSummaries);
      localStorage.setItem('vidtube_guest_summaries', JSON.stringify(updatedSummaries));
      toast.success('Removed from local vault');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setSummaries(prev => prev.filter(s => s.id !== id));
        toast.success('Permanently removed from vault');
      } else {
        throw new Error('Failed to delete from server');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove document');
    }
  };

  return { summaries, save, remove, isLoading };
}
