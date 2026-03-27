/**
 * Client-side transcript fetcher for YouTube videos.
 * Features ultra-robust metadata extraction and multi-proxy rotation.
 */

import type { TranscriptEntry } from './youtube';

const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://corsproxy.io/?url=',
  'https://api.codetabs.com/v1/proxy?quest=',
  'https://proxy-is-cool.onrender.com/proxy?url=', // Custom reliable fallback
  'https://cors-proxy.htmldriven.com/?url=',
];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch data using a rotating list of CORS proxies.
 */
async function fetchWithProxy(url: string): Promise<string> {
  let lastError: any;
  // Try proxies in random order to distribute load
  const shuffled = [...CORS_PROXIES].sort(() => Math.random() - 0.5);
  
  for (const proxy of shuffled) {
    try {
      await sleep(300 + Math.random() * 700);
      
      const resp = await fetch(proxy + encodeURIComponent(url), {
        signal: AbortSignal.timeout(8000),
      });
      
      if (resp.ok) {
        const text = await resp.text();
        if (text && text.length > 200) return text;
      }
    } catch (err) {
      lastError = err;
      continue;
    }
  }
  throw lastError || new Error('All CORS proxies failed to retrieve valid content');
}

/**
 * Attempt to scrape caption tracks from the main YouTube page HTML.
 */
async function scrapeCaptionTrackUrl(videoId: string): Promise<string | null> {
  const url = `https://www.youtube.com/watch?v=${videoId}`;
  try {
    const html = await fetchWithProxy(url);
    
    // Look for the captionTracks JSON in the page source
    const regex = /"captionTracks":\s*(\[.*?\])/;
    const match = html.match(regex);
    if (match && match[1]) {
      const tracks = JSON.parse(match[1]);
      const track = tracks.find((t: any) => t.languageCode === 'en' || t.languageCode.startsWith('en')) || tracks[0];
      if (track && track.baseUrl) {
        return track.baseUrl;
      }
    }
  } catch (e) {
    console.warn('Scraping caption track URL failed:', e);
  }
  return null;
}

/**
 * Parse YouTube's timedtext XML format.
 */
function parseYouTubeTranscript(xml: string): TranscriptEntry[] {
  const entries: TranscriptEntry[] = [];
  const regex = /<text start="([\d.]+)" dur="([\d.]+)"[^>]*>(.*?)<\/text>/g;
  let match;
  
  while ((match = regex.exec(xml)) !== null) {
    entries.push({
      start: parseFloat(match[1]),
      duration: parseFloat(match[2]),
      text: decodeHtmlEntities(match[3]),
    });
  }

  return entries;
}

/**
 * Fetch transcript with high-reliability fallbacks.
 */
export async function fetchTranscript(videoId: string): Promise<TranscriptEntry[]> {
  try {
    // Strategy 1: Scrape from the main page
    const trackUrl = await scrapeCaptionTrackUrl(videoId);
    if (trackUrl) {
      const xml = await fetchWithProxy(trackUrl);
      const entries = parseYouTubeTranscript(xml);
      if (entries.length > 0) return entries;
    }
  } catch (e) {
    console.warn('Scrape strategy failed, trying API fallbacks');
  }

  // Strategy 2: Direct API fallbacks
  const apiUrls = [
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en`,
    `https://www.youtube.com/api/timedtext?v=${videoId}&lang=en-US`,
  ];

  for (const url of apiUrls) {
    try {
      const xml = await fetchWithProxy(url);
      const entries = parseYouTubeTranscript(xml);
      if (entries.length > 0) return entries;
    } catch {
      continue;
    }
  }

  // Strategy 3: Metadata intelligence fallback (Last Resort)
  try {
    const metadata = await fetchVideoMetadata(videoId);
    if (metadata.title && metadata.title !== 'Untitled Video') {
       return [{ 
         start: 0, 
         duration: 0, 
         text: `[CRITICAL: Transcript extraction blocked. Intelligence based on global metadata and title analysis.]\nVIDEO_TITLE: ${metadata.title}\nCHANNEL: ${metadata.authorName}\nMETRICS: ${metadata.views} views.` 
       }];
    }
  } catch {
    /* silent */
  }

  throw new Error('Comprehensive extraction failed. YouTube is enforcing strict bot protection or captions are disabled.');
}

/**
 * Ultra-robust metadata extraction using multiple heuristics.
 */
export async function fetchVideoMetadata(videoId: string): Promise<{ 
  title: string; 
  authorName?: string;
  views?: string;
  publishDate?: string;
}> {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
  
  try {
    const html = await fetchWithProxy(watchUrl);
    
    // Pattern 1: Title (Multiple heuristics)
    const title = 
      html.match(/<meta name="title" content="(.*?)">/)?.[1] || 
      html.match(/<title>(.*?) - YouTube<\/title>/)?.[1] || 
      html.match(/"title":\{"runs":\[\{"text":"(.*?)"\}\]\}/)?.[1] ||
      'Untitled Video';

    // Pattern 2: Channel/Author
    const authorName = 
      html.match(/"ownerChannelName":"(.*?)"/)?.[1] ||
      html.match(/"author":"(.*?)"/)?.[1] ||
      html.match(/"owner":\{"videoOwnerRenderer":\{"title":\{"runs":\[\{"text":"(.*?)"\}\]\}/)?.[1];

    // Pattern 3: Views
    const viewsRaw = html.match(/"viewCount":"(\d+)"/)?.[1];
    const views = viewsRaw ? parseInt(viewsRaw).toLocaleString() : undefined;

    // Pattern 4: Date
    const publishDate = html.match(/"publishDate":"([\d-]+)"/)?.[1];

    if (title !== 'Untitled Video') {
      return { title, authorName, views, publishDate };
    }
    
    throw new Error('Scrape returned generic title');
  } catch (e) {
    console.warn('Metadata scrape failed, using oEmbed fallback...');
    try {
      // Strategy 2: Official oEmbed (No proxy needed, but good to have)
      const resp = await fetch(`https://www.youtube.com/oembed?url=${watchUrl}&format=json`);
      if (resp.ok) {
        const data = await resp.json();
        return { 
          title: data.title || 'Untitled Video', 
          authorName: data.author_name 
        };
      }
    } catch {
      // Final attempt: codetabs proxy + noembed
      try {
        const resp = await fetch(`https://api.codetabs.com/v1/proxy?quest=https://noembed.com/embed?url=${watchUrl}`);
        const data = await resp.json();
        return { title: data.title || 'Untitled Video', authorName: data.author_name };
      } catch {
        return { title: 'Untitled Video' };
      }
    }
    return { title: 'Untitled Video' };
  }
}

/**
 * Search YouTube for videos and return a list of results.
 */
export async function searchVideos(query: string): Promise<any[]> {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  try {
    const html = await fetchWithProxy(url);
    
    // Pattern to find video IDs and titles in search results
    const regex = /"videoRenderer":\{"videoId":"(.*?)".*?"title":\{"runs":\[\{"text":"(.*?)"\}\]\}/g;
    const results: any[] = [];
    let match;
    let count = 0;
    
    while ((match = regex.exec(html)) !== null && count < 6) {
      results.push({
        video_id: match[1],
        title: match[2],
        url: `https://www.youtube.com/watch?v=${match[1]}`,
        thumbnail: `https://i.ytimg.com/vi/${match[1]}/hqdefault.jpg`,
        channel: 'YouTube Result',
        category: 'New Intel',
        tag: 'Search'
      });
      count++;
    }
    
    return results;
  } catch (err) {
    console.error('Search failed:', err);
    return [];
  }
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n/g, ' ')
    .trim();
}
