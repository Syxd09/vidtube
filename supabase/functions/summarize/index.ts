import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { videoId } = await req.json();
    if (!videoId) {
      return new Response(JSON.stringify({ error: "videoId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch transcript from YouTube's timedtext API
    const transcript = await fetchTranscript(videoId);
    if (!transcript || transcript.length === 0) {
      return new Response(JSON.stringify({ error: "Could not fetch transcript. The video may not have captions available." }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get video title
    const title = await fetchVideoTitle(videoId);

    // Summarize with AI
    const fullText = transcript.map(t => t.text).join(' ');
    const summaryResult = await generateSummary(fullText, title);

    return new Response(JSON.stringify({
      title,
      transcript,
      summary: summaryResult.summary,
      keyPoints: summaryResult.keyPoints,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("Summarize error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function fetchTranscript(videoId: string) {
  // Fetch the video page to extract captions info
  const pageResp = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
  });
  const html = await pageResp.text();

  // Extract captions URL from the page
  const captionMatch = html.match(/"captions":{"playerCaptionsTracklistRenderer":{"captionTracks":\[(.*?)\]/);
  if (!captionMatch) return null;

  let captionData;
  try {
    captionData = JSON.parse(`[${captionMatch[1]}]`);
  } catch {
    return null;
  }

  // Prefer English, fall back to first available
  const track = captionData.find((t: any) => t.languageCode === 'en') || captionData[0];
  if (!track?.baseUrl) return null;

  // Fetch the captions XML
  const captionResp = await fetch(track.baseUrl);
  const xml = await captionResp.text();

  // Parse XML captions
  const entries: { text: string; start: number; duration: number }[] = [];
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

async function fetchVideoTitle(videoId: string): Promise<string> {
  try {
    const resp = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
    const data = await resp.json();
    return data.title || 'Untitled Video';
  } catch {
    return 'Untitled Video';
  }
}

async function generateSummary(text: string, title: string) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

  // Truncate transcript if too long (keep under ~12k words)
  const words = text.split(' ');
  const truncated = words.length > 12000 ? words.slice(0, 12000).join(' ') + '...' : text;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      tools: [{
        type: "function",
        function: {
          name: "create_summary",
          description: "Create a structured summary of the video transcript",
          parameters: {
            type: "object",
            properties: {
              summary: {
                type: "string",
                description: "A comprehensive 3-5 sentence summary of the video content"
              },
              keyPoints: {
                type: "array",
                items: { type: "string" },
                description: "5-8 key takeaway points from the video"
              }
            },
            required: ["summary", "keyPoints"],
            additionalProperties: false
          }
        }
      }],
      tool_choice: { type: "function", function: { name: "create_summary" } },
      messages: [
        {
          role: "system",
          content: "You are an expert video summarizer. Analyze the transcript and produce a clear, insightful summary with actionable key points. Be specific and avoid generic statements."
        },
        {
          role: "user",
          content: `Summarize this YouTube video titled "${title}":

${truncated}`
        }
      ],
    }),
  });

  if (!response.ok) {
    if (response.status === 429) throw new Error("Rate limited. Please try again shortly.");
    if (response.status === 402) throw new Error("AI credits exhausted. Please add funds in Settings.");
    throw new Error(`AI request failed: ${response.status}`);
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  if (toolCall?.function?.arguments) {
    return JSON.parse(toolCall.function.arguments);
  }
  
  // Fallback if no tool call
  const content = data.choices?.[0]?.message?.content || '';
  return { summary: content, keyPoints: [] };
}
