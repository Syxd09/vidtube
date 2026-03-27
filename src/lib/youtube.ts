export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function getYoutubeThumbnail(videoId: string): string {
  // Using hqdefault as it's more reliable than maxresdefault for all videos
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export interface TranscriptEntry {
  text: string;
  start: number;
  duration: number;
}

export interface SummaryData {
  id: string; // Database ID or local unique ID
  video_id: string;
  title: string;
  author_name: string;
  thumbnail: string;
  summary: string;
  overview?: string;
  key_points: string[];
  transcript: TranscriptEntry[];
  tags: string[];
  views?: string;
  publish_date?: string;
  comment_count?: string;
  sentiment?: string; // AI-deduced community sentiment
  created_at?: string;
}
