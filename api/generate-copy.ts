import { GoogleGenAI } from '@google/genai';
import {
  generateCopywritingWithGemini,
  generateSmartFallback,
  sanitizeErrorMessage,
} from '../src/lib/geminiCopyService';
import { Platform, ToneOfVoice } from '../src/types';

/**
 * Resilient request body parser for Vercel Serverless Functions.
 * Handles parsed JSON, raw string, Buffer, and Node stream chunks.
 */
async function parseVercelBody(req: any): Promise<any> {
  if (req.body) {
    if (typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
      return req.body;
    }
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch {
        return {};
      }
    }
    if (Buffer.isBuffer(req.body)) {
      try {
        return JSON.parse(req.body.toString('utf-8'));
      } catch {
        return {};
      }
    }
  }

  // If body is an unread stream (standard Node IncomingMessage)
  if (typeof req.on === 'function') {
    return new Promise((resolve) => {
      let raw = '';
      req.on('data', (chunk: any) => {
        raw += chunk;
      });
      req.on('end', () => {
        try {
          resolve(raw ? JSON.parse(raw) : {});
        } catch {
          resolve({});
        }
      });
      req.on('error', () => {
        resolve({});
      });
    });
  }

  return {};
}

/**
 * Uniform response sender compatible with both Vercel Serverless response helpers
 * and standard Node.js ServerResponse.
 */
function sendVercelJson(res: any, statusCode: number, payload: any) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');

  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(statusCode).json(payload);
  }

  res.statusCode = statusCode;
  res.end(JSON.stringify(payload));
}

/**
 * Lazy Gemini client initializer with safe environment variable handling.
 * Prevents serverless cold-start crashes if the API key is temporarily absent.
 */
function getVercelGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'salinkilat-umkm-vercel',
      },
    },
  });
}

// Vercel Serverless Function Handler
export default async function handler(req: any, res: any) {
  // 1. Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Max-Age', '86400');
    if (typeof res.status === 'function') {
      return res.status(200).end();
    }
    res.statusCode = 200;
    return res.end();
  }

  // 2. Enforce POST method
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST, OPTIONS');
    return sendVercelJson(res, 405, {
      error: 'Metode tidak didukung. Gunakan permintaan POST.',
      message: 'Metode tidak didukung. Gunakan permintaan POST.',
    });
  }

  try {
    const body = await parseVercelBody(req);
    const rawName = typeof body?.productName === 'string' ? body.productName.trim() : '';
    const rawDesc = typeof body?.productDescription === 'string' ? body.productDescription.trim() : '';
    const rawNotes = typeof body?.additionalNotes === 'string' ? body.additionalNotes.trim() : '';

    if (!rawName) {
      return sendVercelJson(res, 400, {
        error: 'Nama produk wajib diisi.',
        message: 'Nama produk wajib diisi.',
      });
    }

    if (!rawDesc) {
      return sendVercelJson(res, 400, {
        error: 'Deskripsi atau keunggulan produk wajib diisi.',
        message: 'Deskripsi atau keunggulan produk wajib diisi.',
      });
    }

    const productName = rawName.slice(0, 150);
    const productDescription = rawDesc.slice(0, 2000);
    const additionalNotes = rawNotes ? rawNotes.slice(0, 500) : undefined;

    const ALLOWED_TONES: ToneOfVoice[] = ['hard-selling', 'soft-selling', 'humor-genz', 'emak-emak'];
    const ALLOWED_PLATFORMS: Platform[] = ['instagram', 'marketplace', 'tiktok'];

    const tone: ToneOfVoice = ALLOWED_TONES.includes(body?.tone) ? body.tone : 'hard-selling';
    const platform: Platform = ALLOWED_PLATFORMS.includes(body?.platform) ? body.platform : 'instagram';

    // 3. Attempt generation via Gemini AI if API key is configured
    const ai = getVercelGeminiClient();
    if (ai) {
      try {
        const geminiResult = await generateCopywritingWithGemini(ai, {
          productName,
          productDescription,
          tone,
          platform,
          additionalNotes,
        });

        if (geminiResult) {
          return sendVercelJson(res, 200, geminiResult);
        }
      } catch (geminiError: any) {
        // Log sanitized message without exposing keys
        console.warn(
          '[Vercel Serverless] Gemini API invocation error, engaging smart fallback:',
          sanitizeErrorMessage(geminiError)
        );
      }
    } else {
      console.info(
        '[Vercel Serverless] GEMINI_API_KEY is not configured in environment. Using smart local copy generator.'
      );
    }

    // 4. Guaranteed smart fallback generator (100% uptime for UMKM users)
    const fallbackResult = generateSmartFallback(productName, productDescription, tone, platform);
    return sendVercelJson(res, 200, fallbackResult);
  } catch (fatalError: any) {
    console.error(
      '[Vercel Serverless] Fatal error in generate-copy handler:',
      sanitizeErrorMessage(fatalError)
    );

    // Provide emergency response rather than breaking client JSON parsing
    const emergencyFallback = generateSmartFallback(
      'Produk UMKM Pilihan',
      'Kualitas terjamin dan dibuat dengan ketelitian tinggi oleh pengrajin lokal.',
      'hard-selling',
      'instagram'
    );
    return sendVercelJson(res, 200, emergencyFallback);
  }
}
