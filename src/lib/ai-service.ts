/**
 * High-level AI service functions with hallucination guardrails.
 */

import { callLLM, type ChatMessage, type LLMResponse } from './ai-providers';

export interface SummarizeResult {
  summary: string;
  overview?: string;
  keyPoints: string[];
  sentiment?: string;
  provider: string;
  model: string;
}

export interface ChatResult {
  answer: string;
  provider: string;
  model: string;
}

/**
 * Summarize a video transcript using AI with strict truthfulness.
 */
export async function summarizeVideo(
  transcriptText: string,
  title: string
): Promise<SummarizeResult> {
  const isFallback = transcriptText.includes('[CRITICAL: Transcript extraction blocked]');
  
  // Truncate transcript for context
  const words = transcriptText.split(' ');
  const truncated = words.length > 8000
    ? words.slice(0, 8000).join(' ') + '...'
    : transcriptText;

  const systemPrompt = isFallback 
    ? `You are an AI Video Intelligence Specialist. 
       CRITICAL: The transcript for this video ("${title}") is CURRENTLY UNAVAILABLE due to technical limitations.
       
       YOUR MISSION:
       1. Do NOT hallucinate visuals, energy, or emotional narratives.
       2. Analyze the video based EXCLUSIVELY on its title and the metadata provided in the text.
       3. Provide a strategic deduction of what this video is likely about.
       4. Be honest and professional. If you don't know, say "Content data limited".
       
       Response must be VALID JSON ONLY.`
    : `You are an advanced AI Video Intelligence Buddy. Your goal is to provide a deep, high-fidelity analysis of videos as if you have watched them visually and aurally. 
      
       Produce a definitive intelligence report with:
       1. **Conceptual Soul**: A 2-sentence profound overview of the video's core philosophy.
       2. **Visual & Emotional Narrative**: A deep 3-paragraph analysis describing the likely visual progression, the creator's energy, and the emotional impact on the viewer. 
       3. **Deep Strategic Takeaways**: 10 high-value insights, meticulously structured.
       4. **Visual Cues**: Deduce visual elements (setting, lighting, props) from the context provided in the transcript.

       CRITICAL: You MUST respond with VALID JSON ONLY. Do not include markdown code fences (\`\`\`json).`;

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `${systemPrompt}
      
      Format:
      {
        "overview": "Conceptual soul...",
        "summary": "Visual & emotional narrative...",
        "keyPoints": ["Insight 1", "Insight 2", ...],
        "sentiment": "Deep analysis of likely community reaction and sentiment based on the content."
      }`,
    },
    {
      role: 'user',
      content: `Analyze this video: "${title}"\n\nINPUT DATA:\n${truncated}`,
    },
  ];

  const response = await callLLM(messages);

  try {
    const jsonStr = extractJSON(response.content);
    const parsed = JSON.parse(jsonStr);
    
    // If it was a fallback, we keep the message clean
    const summary = isFallback 
      ? `[SYSTEM: INTELLIGENCE LIMITED] This video's transcript could not be retrieved. Based on the title ("${title}"), this appears to be a ${parsed.summary || 'geopolitical or news update'}. Detailed visual analysis is unavailable.`
      : (parsed.summary || response.content);

    return {
      summary: summary,
      overview: parsed.overview,
      keyPoints: parsed.keyPoints || [],
      sentiment: parsed.sentiment,
      provider: response.provider,
      model: response.model,
    };
  } catch {
    return {
      summary: response.content,
      keyPoints: [],
      provider: response.provider,
      model: response.model,
    };
  }
}

/**
 * Chat with the video transcript — ask questions about the content.
 */
export async function chatWithTranscript(
  transcriptText: string,
  title: string,
  question: string,
  history: ChatMessage[] = []
): Promise<ChatResult> {
  const isFallback = transcriptText.includes('[CRITICAL: Transcript extraction blocked]');

  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are a helpful AI assistant that answers questions about a YouTube video. 

Video Title: "${title}"

${isFallback ? 'CRITICAL: The transcript is currently unavailable. Answer based only on the title and public knowledge.' : 'Transcript: ' + transcriptText}

Rules:
- Be honest about data limitations.
- If the answer isn't available, say "I cannot confirm this as the transcript is currently blocked by YouTube protection."`,
    },
    ...history,
    {
      role: 'user',
      content: question,
    },
  ];

  const response = await callLLM(messages, 2048);

  return {
    answer: response.content,
    provider: response.provider,
    model: response.model,
  };
}

/**
 * Generate auto-tags for a video summary.
 */
export async function generateTags(
  summary: string,
  title: string
): Promise<string[]> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `Generate 3-6 short topic tags for the given video summary. Return ONLY a JSON array of strings, nothing else. Example: ["AI", "Machine Learning", "Tutorial"]`,
    },
    {
      role: 'user',
      content: `Video: "${title}"\n\nSummary: ${summary}`,
    },
  ];

  try {
    const response = await callLLM(messages, 256);
    const jsonStr = extractJSON(response.content);
    const tags = JSON.parse(jsonStr);
    return Array.isArray(tags) ? tags.slice(0, 6) : [];
  } catch {
    return [];
  }
}

/**
 * Extract JSON from a response.
 */
function extractJSON(text: string): string {
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();
  const jsonMatch = text.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
  if (jsonMatch) return jsonMatch[1];
  return text;
}
