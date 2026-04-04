/**
 * Multi-Provider LLM Service with Intelligent Auto-Failover
 * 
 * Supports: OpenRouter, Groq, Google Gemini, xAI (Grok), Cerebras
 * Auto-switches providers on 401/402/429 errors with health tracking.
 */

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface LLMResponse {
  content: string;
  provider: string;
  model: string;
  usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number };
}

export type ProviderHealth = 'healthy' | 'rate_limited' | 'exhausted' | 'error' | 'unknown';

export interface ProviderStatus {
  id: string;
  name: string;
  model: string;
  health: ProviderHealth;
  lastError?: string;
  lastUsed?: number;
  rateLimitResetAt?: number;
}

interface ProviderConfig {
  id: string;
  name: string;
  model: string;
  apiBase: string;
  apiKey: string;
  headers: (apiKey: string) => Record<string, string>;
  transformBody?: (messages: ChatMessage[]) => any;
  extractContent?: (data: any) => string;
}

// Provider configurations
function getProviders(): ProviderConfig[] {
  // Priority: 1. LocalStorage (User entered in Settings), 2. Environment Variables (.env)
  const getApiKey = (keyName: string, envName: string) => {
    // 1. Try LocalStorage
    const local = localStorage ? localStorage.getItem(keyName) : null;
    if (local && local.trim() && !local.includes('YOUR_')) {
       console.log(`[CortexOS] ${envName}: Synchronized via Neural Uplink (Local).`);
       return local;
    }
    
    // 2. Try Explicit Env Mapping (Vite)
    const envMap: Record<string, any> = (import.meta as any).env || {};
    const envValue = envMap[envName];
    if (envValue && envValue.trim() && !envValue.includes('YOUR_')) {
       console.log(`[CortexOS] ${envName}: Synchronized via System Environment.`);
       return envValue;
    }

    return '';
  };

  return [
    {
      id: 'openrouter',
      name: 'OpenRouter',
      model: import.meta.env.VITE_AI_MODEL || 'meta-llama/llama-3.3-70b-instruct:free',
      apiBase: 'https://openrouter.ai/api/v1/chat/completions',
      apiKey: getApiKey('OPENROUTER_API_KEY', 'VITE_OPENROUTER_API_KEY'),
      headers: (key) => ({
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'CortexOS Intelligence',
      }),
    },
    {
      id: 'groq',
      name: 'Groq',
      model: 'llama-3.3-70b-versatile',
      apiBase: 'https://api.groq.com/openai/v1/chat/completions',
      apiKey: getApiKey('GROQ_API_KEY', 'VITE_GROQ_API_KEY'),
      headers: (key) => ({
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      }),
    },
    {
      id: 'google',
      name: 'Google Gemini',
      model: 'gemini-2.0-flash',
      apiBase: '', // constructed dynamically
      apiKey: getApiKey('GOOGLE_AI_KEY', 'VITE_GOOGLE_AI_KEY'),
      headers: () => ({ 'Content-Type': 'application/json' }),
      transformBody: (messages: ChatMessage[]) => ({
        contents: messages
          .filter(m => m.role !== 'system')
          .map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
          })),
        systemInstruction: messages.find(m => m.role === 'system')
          ? { parts: [{ text: messages.find(m => m.role === 'system')!.content }] }
          : undefined,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
        },
      }),
      extractContent: (data: any) => {
        return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      },
    },
    {
      id: 'xai',
      name: 'xAI Grok',
      model: 'grok-3-mini-fast',
      apiBase: 'https://api.x.ai/v1/chat/completions',
      apiKey: getApiKey('VITE_XAI_API_KEY', 'VITE_XAI_API_KEY'),
      headers: (key) => ({
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      }),
    },
    {
      id: 'cerebras',
      name: 'Cerebras',
      model: 'llama-3.3-70b',
      apiBase: 'https://api.cerebras.ai/v1/chat/completions',
      apiKey: getApiKey('VITE_CEREBRAS_API_KEY', 'VITE_CEREBRAS_API_KEY'),
      headers: (key) => ({
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
      }),
    },
  ].filter(p => {
    if (p.apiKey && !p.apiKey.includes('YOUR_')) return true;
    console.warn(`[CortexOS] Provider ${p.id} offline: Missing Mission Key.`);
    return false;
  }); 
}

// Health status store
const providerStatuses: Map<string, ProviderStatus> = new Map();
let activeProviderId: string | null = null;
let onProviderSwitch: ((from: string, to: string) => void) | null = null;

export function setOnProviderSwitch(callback: (from: string, to: string) => void) {
  onProviderSwitch = callback;
}

function initStatuses() {
  const providers = getProviders();
  providers.forEach(p => {
    if (!providerStatuses.has(p.id)) {
      providerStatuses.set(p.id, {
        id: p.id,
        name: p.name,
        model: p.model,
        health: 'unknown',
      });
    }
  });
  if (!activeProviderId && providers.length > 0) {
    activeProviderId = providers[0].id;
  }
}

function updateProviderHealth(id: string, health: ProviderHealth, error?: string) {
  const status = providerStatuses.get(id);
  if (status) {
    status.health = health;
    status.lastError = error;
    if (health === 'rate_limited') {
      status.rateLimitResetAt = Date.now() + 60_000; // 1 minute cooldown
    }
    providerStatuses.set(id, status);
  }
}

function isProviderAvailable(id: string): boolean {
  const status = providerStatuses.get(id);
  if (!status) return false;
  if (status.health === 'exhausted') return false;
  if (status.health === 'rate_limited' && status.rateLimitResetAt && Date.now() < status.rateLimitResetAt) {
    return false;
  }
  return true;
}

export function getProviderStatuses(): ProviderStatus[] {
  initStatuses();
  return Array.from(providerStatuses.values());
}

export function getActiveProvider(): ProviderStatus | null {
  initStatuses();
  if (activeProviderId) {
    return providerStatuses.get(activeProviderId) || null;
  }
  return null;
}

async function callOpenAICompatible(
  provider: ProviderConfig,
  messages: ChatMessage[],
  maxTokens: number = 4096
): Promise<LLMResponse> {
  const response = await fetch(provider.apiBase, {
    method: 'POST',
    headers: provider.headers(provider.apiKey),
    body: JSON.stringify({
      model: provider.model,
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new ProviderError(response.status, errorText, provider.id);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || '';

  return {
    content,
    provider: provider.name,
    model: provider.model,
    usage: data.usage,
  };
}

async function callGoogleGemini(
  provider: ProviderConfig,
  messages: ChatMessage[],
): Promise<LLMResponse> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${provider.model}:generateContent?key=${provider.apiKey}`;
  const body = provider.transformBody!(messages);

  const response = await fetch(url, {
    method: 'POST',
    headers: provider.headers(provider.apiKey),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => '');
    throw new ProviderError(response.status, errorText, provider.id);
  }

  const data = await response.json();
  const content = provider.extractContent!(data);

  return {
    content,
    provider: provider.name,
    model: provider.model,
  };
}

class ProviderError extends Error {
  constructor(
    public status: number,
    public body: string,
    public providerId: string,
  ) {
    super(`Provider ${providerId} failed with status ${status}: ${body.slice(0, 200)}`);
  }

  get isRetryable(): boolean {
    return this.status === 429 || this.status === 503 || this.status === 502;
  }

  get isAuthError(): boolean {
    return this.status === 401 || this.status === 403;
  }

  get isExhausted(): boolean {
    return this.status === 402;
  }
}

/**
 * Main LLM call with automatic provider failover.
 * Tries each provider in priority order, skipping unhealthy ones.
 */
export async function callLLM(
  messages: ChatMessage[],
  maxTokens: number = 4096
): Promise<LLMResponse> {
  initStatuses();
  const providers = getProviders();

  if (providers.length === 0) {
    throw new Error('No AI providers configured. Please add API keys to your .env file.');
  }

  const errors: string[] = [];

  for (const provider of providers) {
    if (!isProviderAvailable(provider.id)) {
      continue;
    }

    try {
      // Switch active provider
      const prevActive = activeProviderId;
      activeProviderId = provider.id;
      
      if (prevActive && prevActive !== provider.id && onProviderSwitch) {
        const prevName = providerStatuses.get(prevActive)?.name || prevActive;
        onProviderSwitch(prevName, provider.name);
      }

      let result: LLMResponse;
      if (provider.id === 'google') {
        result = await callGoogleGemini(provider, messages);
      } else {
        result = await callOpenAICompatible(provider, messages, maxTokens);
      }

      // Success — mark healthy
      updateProviderHealth(provider.id, 'healthy');
      const status = providerStatuses.get(provider.id);
      if (status) {
        status.lastUsed = Date.now();
        providerStatuses.set(provider.id, status);
      }

      return result;
    } catch (err) {
      if (err instanceof ProviderError) {
        if (err.isExhausted) {
          updateProviderHealth(provider.id, 'exhausted', 'Credits exhausted');
        } else if (err.isRetryable) {
          updateProviderHealth(provider.id, 'rate_limited', 'Rate limited');
        } else if (err.isAuthError) {
          updateProviderHealth(provider.id, 'exhausted', 'Authentication failed');
        } else {
          updateProviderHealth(provider.id, 'error', err.message);
        }
        errors.push(`${provider.name}: ${err.message}`);
      } else {
        updateProviderHealth(provider.id, 'error', (err as Error).message);
        errors.push(`${provider.name}: ${(err as Error).message}`);
      }
      // Continue to next provider
    }
  }

  throw new Error(
    `All AI providers failed:\n${errors.join('\n')}`
  );
}
