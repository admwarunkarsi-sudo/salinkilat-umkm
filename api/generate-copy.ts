import type { IncomingMessage, ServerResponse } from 'http';
import { GoogleGenAI } from '@google/genai';
import {
  generateCopywritingWithGemini,
  generateSmartFallback,
} from '../src/lib/geminiCopyService';
import { Platform, ToneOfVoice } from '../src/types';

// Vercel Serverless Function Handler
export default async function handler(req: any, res: any) {
  // CORS & Safety Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Metode tidak didukung. Gunakan POST untuk membuat copywriting.',
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const rawName = typeof body.productName === 'string' ? body.productName.trim() : '';
    const rawDesc = typeof body.productDescription === 'string' ? body.productDescription.trim() : '';
    const rawNotes = typeof body.additionalNotes === 'string' ? body.additionalNotes.trim() : '';

    if (!rawName) {
      return res.status(400).json({
        error: 'Nama produk wajib diisi.',
      });
    }

    if (!rawDesc) {
      return res.status(400).json({
        error: 'Deskripsi atau keunggulan produk wajib diisi.',
      });
    }

    const productName = rawName.slice(0, 150);
    const productDescription = rawDesc.slice(0, 2000);
    const additionalNotes = rawNotes ? rawNotes.slice(0, 500) : undefined;

    const ALLOWED_TONES: ToneOfVoice[] = ['hard-selling', 'soft-selling', 'humor-genz', 'emak-emak'];
    const ALLOWED_PLATFORMS: Platform[] = ['instagram', 'marketplace', 'tiktok'];

    const tone: ToneOfVoice = ALLOWED_TONES.includes(body.tone) ? body.tone : 'hard-selling';
    const platform: Platform = ALLOWED_PLATFORMS.includes(body.platform) ? body.platform : 'instagram';

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: { headers: { 'User-Agent': 'aistudio-build-vercel' } },
        });

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
      } catch (err: any) {
        console.warn('Gemini execution error on Vercel, switching to fallback:', err?.message || err);
      }
    }

    // Guaranteed fallback
    const fallback = generateSmartFallback(productName, productDescription, tone, platform);
    return res.status(200).json(fallback);
  } catch (err: any) {
    console.error('Fatal error in Vercel API handler:', err);
    return res.status(200).json(
      generateSmartFallback(
        req?.body?.productName || 'Produk UMKM Unggulan',
        req?.body?.productDescription || 'Kualitas terjamin dan dibuat dengan dedikasi pengrajin lokal Indonesia.',
        'hard-selling',
        'instagram'
      )
    );
  }
}
