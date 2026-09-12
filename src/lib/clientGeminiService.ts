// WARNING: Direct client-side Gemini API key initialization as explicitly requested
// by user to support zero-backend and serverless environments on Vercel.
// Note: In public production web apps, keeping API keys behind a server-side proxy
// is generally recommended for confidentiality.

import { GoogleGenAI } from '@google/genai';
import { CopyRequest, CopyResult } from '../types';
import {
  generateCopywritingWithGemini,
  generateSmartFallback,
  sanitizeErrorMessage,
} from './geminiCopyService';

/**
 * Safely resolves the Gemini API key in client-side environment.
 * Checks both import.meta.env.VITE_GEMINI_API_KEY and process.env.GEMINI_API_KEY
 */
export function getClientGeminiApiKey(): string {
  // 1. Check Vite standard client environment
  const viteKey = typeof import.meta !== 'undefined' && (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (typeof viteKey === 'string' && viteKey.trim().length > 0) {
    return viteKey.trim();
  }

  // 2. Check process.env.GEMINI_API_KEY (defined via Vite's `define` config)
  try {
    const processKey = typeof process !== 'undefined' ? process.env?.GEMINI_API_KEY : undefined;
    if (typeof processKey === 'string' && processKey.trim().length > 0) {
      return processKey.trim();
    }
  } catch {
    // Ignore ReferenceError in strictly non-node environments
  }

  return '';
}

/**
 * Lazy client-side GoogleGenAI instance builder.
 */
let cachedClient: GoogleGenAI | null = null;
let cachedKey: string | null = null;

export function getClientGeminiInstance(): GoogleGenAI | null {
  const apiKey = getClientGeminiApiKey();
  if (!apiKey) {
    return null;
  }

  if (cachedClient && cachedKey === apiKey) {
    return cachedClient;
  }

  try {
    cachedClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'salinkilat-umkm-client-direct',
        },
      },
    });
    cachedKey = apiKey;
    return cachedClient;
  } catch (err) {
    console.warn('Failed to initialize client-side GoogleGenAI:', sanitizeErrorMessage(err));
    return null;
  }
}

/**
 * Unified copywriting executor:
 * 1. Direct client-side Gemini API generation (Primary, zero backend needed)
 * 2. Secondary proxy call to /api/generate-copy (if available in environment)
 * 3. Guaranteed client-side intelligent fallback (if offline or no server)
 */
export async function executeCopyGeneration(
  request: CopyRequest,
  signal?: AbortSignal
): Promise<CopyResult> {
  const apiKey = getClientGeminiApiKey();

  // Strategy 1: Direct Client-Side Gemini Execution
  if (apiKey) {
    const ai = getClientGeminiInstance();
    if (ai) {
      try {
        const directResult = await generateCopywritingWithGemini(ai, {
          productName: request.productName,
          productDescription: request.productDescription,
          tone: request.tone,
          platform: request.platform,
          additionalNotes: request.additionalNotes,
        });

        if (directResult && directResult.caption) {
          return directResult;
        }
      } catch (clientErr) {
        console.warn(
          'Direct client-side Gemini invocation note, attempting secondary strategy:',
          sanitizeErrorMessage(clientErr)
        );
      }
    }
  }

  // Strategy 2: Server API Route (if running in full-stack or Vercel serverless mode)
  try {
    const response = await fetch('/api/generate-copy', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(request),
      signal,
    });

    if (response.ok) {
      const data = await response.json();
      if (data && typeof data.caption === 'string' && data.caption.trim().length > 0) {
        return data as CopyResult;
      }
    }
  } catch (proxyErr) {
    console.info(
      'Server route /api/generate-copy not accessible, using client-side generator engine:',
      sanitizeErrorMessage(proxyErr)
    );
  }

  // Strategy 3: Client-Side Guaranteed Smart Engine (Zero network dependency)
  return generateSmartFallback(
    request.productName,
    request.productDescription,
    request.tone,
    request.platform
  );
}
