const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;

export interface DubbingOptions {
  text: string;
  languageCode: string;
  voiceId?: string;
}

const LANGUAGE_VOICES: Record<string, string> = {
  'hi': 'knr6Z9B2qP8M9rZyT2O1', // Hindi: Preeti
  'ta': 'JBFqnCBsd6RMkjVDRZdr', // Tamil: Deepa
  'te': 'h7D3O7hE6e0j6gQo7Y8U', // Telugu: Kavya
  'bn': 'N2lVS1wzex9xceS878i5', // Bengali: Shreya
  'mr': 'Lcf7WhS9S4TX7QD768ic', // Marathi: Anjali
  'kn': 'MF3mGyEYCl7h3QD768ic', // Kannada: Suma
  'gu': 'pMs7WhS9S4TX7QD768ic', // Gujarati: Hema
  'ml': '21m00Tcm4TlvDq8ikWAM', // Malayalam: Default Multilingual
};

export async function generateDub(options: DubbingOptions): Promise<Blob> {
  const voiceId = options.voiceId || LANGUAGE_VOICES[options.languageCode] || '21m00Tcm4TlvDq8ikWAM'; // Default Rachel
  
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': ELEVENLABS_API_KEY,
    },
    body: JSON.stringify({
      text: options.text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail?.message || 'Dubbing failed');
  }

  return await response.blob();
}
