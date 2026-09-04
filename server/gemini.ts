import { GoogleGenAI } from '@google/genai';
import { getSecret } from './secrets.js';

/**
 * Resilient Gemini Generation Protocol with Multi-Model Fallback Ladder
 * Ordered by latency and availability:
 * 1. gemini-3.1-flash-lite (Primary ultra-low latency model - sub-second time-to-first-token)
 * 2. gemini-3.8-flash (High-capability modern Flash model)
 * 3. gemini-flash-latest (Dynamic Flash alias)
 * 4. gemini-3.7-flash (Deep Reasoning Fallback)
 */
const MODEL_FALLBACK_LADDER = [
  'gemini-3.1-flash-lite',
  'gemini-3.8-flash',
  'gemini-flash-latest',
  'gemini-3.7-flash',
];

let genAIInstance: GoogleGenAI | null = null;

export async function getGeminiClient(): Promise<GoogleGenAI | null> {
  const apiKey = await getSecret('GEMINI_API_KEY');
  if (!apiKey) return null;

  if (!genAIInstance) {
    genAIInstance = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIInstance;
}

export interface GenerateContentOptions {
  systemInstruction?: string;
  responseJson?: boolean;
  temperature?: number;
  maxOutputTokens?: number;
  preferredModel?: string;
}

/**
 * Execute Gemini content generation with automated fallback ladder and error recovery
 */
export async function generateContentWithFallback(
  prompt: string,
  options: GenerateContentOptions = {}
): Promise<{ text: string; modelUsed: string }> {
  const ai = await getGeminiClient();
  if (!ai) {
    throw new Error('GEMINI_API_KEY environment variable is not configured.');
  }

  let lastError: Error | null = null;
  const modelsToTry = options.preferredModel
    ? [options.preferredModel, ...MODEL_FALLBACK_LADDER.filter((m) => m !== options.preferredModel)]
    : MODEL_FALLBACK_LADDER;

  for (const model of modelsToTry) {
    try {
      const config: Record<string, unknown> = {
        temperature: options.temperature ?? 0.2,
      };

      if (options.systemInstruction) {
        config.systemInstruction = options.systemInstruction;
      }

      if (options.responseJson) {
        config.responseMimeType = 'application/json';
      }

      if (options.maxOutputTokens) {
        config.maxOutputTokens = options.maxOutputTokens;
      }

      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config,
      });

      const text = response.text || '';
      return { text, modelUsed: model };
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`[CineGemini Gemini Fallback] Model ${model} failed: ${lastError.message}. Escalating to next model in ladder...`);
      // Continue to next model in the fallback ladder
    }
  }

  throw new Error(`All Gemini models failed in fallback ladder. Root error: ${lastError?.message || 'Unknown error'}`);
}

/**
 * Sanitize prompt inputs against indirect prompt injection (OWASP LLM01 / LLM02)
 */
export function sanitizeUntrustedInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/```system/gi, '')
    .replace(/\[SYSTEM_INSTRUCTION\]/gi, '')
    .replace(/ignore\s+all\s+previous\s+instructions/gi, '[FILTERED_PHRASE]')
    .trim();
}

/**
 * Helper to safely parse JSON response from LLM
 */
export function parseCleanJson<T>(rawText: string, fallbackDefault: T): T {
  try {
    let clean = rawText.trim();
    if (clean.startsWith('```json')) {
      clean = clean.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (clean.startsWith('```')) {
      clean = clean.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    return JSON.parse(clean) as T;
  } catch (err) {
    console.error('Failed to parse Gemini JSON output:', err, 'Raw text:', rawText);
    return fallbackDefault;
  }
}
