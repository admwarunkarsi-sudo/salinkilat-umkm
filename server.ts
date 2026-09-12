import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import {
  generateCopywritingWithGemini,
  generateSmartFallback,
  sanitizeErrorMessage,
} from './src/lib/geminiCopyService';
import { Platform, ToneOfVoice } from './src/types';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Global process-level safety to prevent server crashes
process.on('uncaughtException', (err) => {
  console.error('[CRITICAL] Uncaught exception in process:', sanitizeErrorMessage(err));
});

process.on('unhandledRejection', (reason) => {
  console.error('[CRITICAL] Unhandled rejection in process:', sanitizeErrorMessage(reason));
});

const app = express();
const PORT = 3000;

// Body parser with payload limit
app.use(express.json({ limit: '1mb' }));

// Middleware to catch malformed JSON payloads safely
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400 && 'body' in err) {
    console.warn('Malformed JSON request received:', sanitizeErrorMessage(err));
    return res.status(400).json({
      error: 'Format data JSON tidak valid.',
      message: 'Format data JSON tidak valid.',
    });
  }
  next(err);
});

/**
 * Lazy Gemini client initializer with safe environment variable handling.
 * Prevents server crash on startup if GEMINI_API_KEY is not immediately provided.
 */
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'salinkilat-umkm-server',
      },
    },
  });
}

// API endpoint to generate copy with Gemini AI and resilient fallback
app.post('/api/generate-copy', async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        error: 'Data permintaan tidak valid atau format JSON salah.',
        message: 'Data permintaan tidak valid atau format JSON salah.',
      });
    }

    const rawName = typeof req.body.productName === 'string' ? req.body.productName.trim() : '';
    const rawDesc = typeof req.body.productDescription === 'string' ? req.body.productDescription.trim() : '';
    const rawNotes = typeof req.body.additionalNotes === 'string' ? req.body.additionalNotes.trim() : '';

    if (!rawName) {
      return res.status(400).json({
        error: 'Nama produk wajib diisi.',
        message: 'Nama produk wajib diisi.',
      });
    }

    if (!rawDesc) {
      return res.status(400).json({
        error: 'Deskripsi atau keunggulan produk wajib diisi.',
        message: 'Deskripsi atau keunggulan produk wajib diisi.',
      });
    }

    // Sanitize lengths to prevent memory bloat
    const productName = rawName.slice(0, 150);
    const productDescription = rawDesc.slice(0, 2000);
    const additionalNotes = rawNotes ? rawNotes.slice(0, 500) : undefined;

    const ALLOWED_TONES: ToneOfVoice[] = ['hard-selling', 'soft-selling', 'humor-genz', 'emak-emak'];
    const ALLOWED_PLATFORMS: Platform[] = ['instagram', 'marketplace', 'tiktok'];

    const tone: ToneOfVoice = ALLOWED_TONES.includes(req.body.tone) ? req.body.tone : 'hard-selling';
    const platform: Platform = ALLOWED_PLATFORMS.includes(req.body.platform) ? req.body.platform : 'instagram';

    // 1. Attempt generation with Gemini AI if client is configured
    const ai = getGeminiClient();
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
          return res.status(200).json(geminiResult);
        }
      } catch (geminiError: any) {
        console.warn(
          'Gemini API execution note (auto-fallback active):',
          sanitizeErrorMessage(geminiError)
        );
      }
    } else {
      console.info(
        'GEMINI_API_KEY is not configured in environment. Using smart local copy generator.'
      );
    }

    // 2. Guaranteed smart fallback generator (produces realistic, persuasive Indonesian copy)
    const fallbackResult = generateSmartFallback(productName, productDescription, tone, platform);
    return res.status(200).json(fallbackResult);
  } catch (fatalError: any) {
    console.error('Fatal error in /api/generate-copy handler:', sanitizeErrorMessage(fatalError));
    // Even in fatal server error, return a valid JSON fallback rather than breaking client JSON parsing
    try {
      const emergencyFallback = generateSmartFallback(
        req?.body?.productName || 'Produk UMKM',
        req?.body?.productDescription || 'Kualitas terjamin buatan lokal.',
        'hard-selling',
        'instagram'
      );
      return res.status(200).json(emergencyFallback);
    } catch {
      return res.status(500).json({
        error: 'Terjadi kendala sistem saat memproses copywriting. Silakan coba kembali.',
        message: 'Terjadi kendala sistem saat memproses copywriting. Silakan coba kembali.',
      });
    }
  }
});

// Express unhandled error middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled express pipeline error:', sanitizeErrorMessage(err));
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({
    error: 'Terjadi kesalahan internal server. Silakan coba kembali.',
    message: 'Terjadi kesalahan internal server. Silakan coba kembali.',
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    aiConfigured: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0),
    timestamp: new Date().toISOString(),
  });
});

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Only bind port when not imported in serverless execution
  if (process.env.VERCEL !== '1') {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`SalinKilat UMKM server running on http://0.0.0.0:${PORT}`);
    });
  }
}

start();

export default app;
