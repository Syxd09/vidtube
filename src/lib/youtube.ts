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
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}

export interface TranscriptEntry {
  text: string;
  start: number;
  duration: number;
}

export interface SummaryData {
  id: string;
  videoId: string;
  title: string;
  thumbnail: string;
  summary: string;
  keyPoints: string[];
  transcript: TranscriptEntry[];
  createdAt: string;
  tags: string[];
}
