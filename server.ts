import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Global process-level safety to prevent server crashes
process.on('uncaughtException', (err) => {
  console.error('[CRITICAL] Uncaught exception in process:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('[CRITICAL] Unhandled rejection in process:', reason);
});

const app = express();
const PORT = 3000;

// Body parser with payload limit
app.use(express.json({ limit: '1mb' }));

// Middleware to catch malformed JSON payloads safely
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && 'status' in err && (err as any).status === 400 && 'body' in err) {
    console.warn('Malformed JSON request received:', err.message);
    return res.status(400).json({ error: 'Format data JSON tidak valid.' });
  }
  next(err);
});

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Fallback generator in case of network issue or missing key
function generateSmartFallback(productName: string, productDesc: string, tone: string, platform: string) {
  const isGamis = productName.toLowerCase().includes('gamis') || productDesc.toLowerCase().includes('rayon');
  const isKopi = productName.toLowerCase().includes('kopi') || productDesc.toLowerCase().includes('kopi');
  const isSnack = productName.toLowerCase().includes('keripik') || productName.toLowerCase().includes('balado') || productDesc.toLowerCase().includes('singkong');

  let caption = '';
  let hook = '';
  let formula: 'AIDA' | 'PAS' = 'AIDA';
  let formulaBreakdown = {
    attentionOrProblem: '',
    interestOrAgitation: '',
    desireOrSolution: '',
    action: ''
  };
  let hashtags: string[] = ['#UMKMIndonesia', '#BanggaBuatanIndonesia', '#ProdukLokal', '#UsahaLokal'];
  let bestPostingTime = '11.30 - 13.00 WIB (Istirahat siang) & 19.00 - 21.00 WIB (Santai malam)';
  let proTip = 'Tambahkan foto close-up tekstur produk asli dengan pencahayaan alami matahari pagi.';

  if (platform === 'marketplace') {
    const seoTitle = `[GARANSI ASLI] ${productName} - Kualitas Terbaik & Rekomendasi Terpercaya`;
    hook = seoTitle;
    caption = `⭐ ${seoTitle} ⭐

Kenapa Ribuan Pelanggan Memilih Produk Ini?
✔ 100% Produk Original & Teruji Kualitasnya
✔ Dibuat dengan teliti: ${productDesc}
✔ Packing Ekstra Aman (Bubble Wrap & Kardus Tebal Gratis)
✔ Garansi Uang Kembali / Tukar Baru jika barang rusak saat perjalanan

Spesifikasi & Keunggulan Produk:
• Nama Produk: ${productName}
• Detail Keunggulan: ${productDesc}
• Status: Ready Stock Siap Kirim Hari Ini (Order sebelum jam 15.00 WIB)
• Legalitas / Keamanan: Bersih, higienis, dan aman dipakai/dikonsumsi

Catatan Toko:
- Pengiriman setiap hari Senin - Sabtu.
- Mohon videokan saat proses unboxing untuk klaim garansi cepat.

👉 Klik 'Beli Sekarang' atau masukkan ke keranjang belanja Anda hari ini juga selagi promo aktif!`;

    formula = 'AIDA';
    formulaBreakdown = {
      attentionOrProblem: `Judul SEO yang ramah pencarian algoritma marketplace: ${seoTitle}`,
      interestOrAgitation: 'Memaparkan poin kepastian kualitas dan garansi toko terpercaya.',
      desireOrSolution: `Spesifikasi detail produk yang meyakinkan: ${productDesc}`,
      action: 'Dorongan kuat checkout langsung sebelum jam batas pengiriman hari ini.'
    };
    hashtags = ['#ShopeeHaul', '#TokopediaPromo', '#RacunMarketplace', '#BelanjaOnline', '#ProdukLokal'];
    bestPostingTime = 'Jam 09.00 - 11.00 WIB & Waktu Payday (Tanggal 25 - akhir bulan)';
    proTip = 'Pastikan foto utama berlatar putih bersih dengan badge promo atau keunggulan 1 baris di sudut foto.';
  } else if (platform === 'tiktok') {
    if (tone === 'humor-genz') {
      hook = `Stop scroll! Lu pernah gak sih nyesel gara-gara telat nemu yang satu ini?`;
      caption = `🎬 [SKRIP VIDEO PENDEK TIKTOK / OUTLINE LIVE]

[Detik 00 - 03: HOOK MENCURI PERHATIAN]
(Visual: Tangan langsung memegang ${productName} di depan kamera dengan ekspresi kaget/puas)
"Stop scroll! Sumpah ya, jangan sampe lu nyesel belakangan cuma gara-gara telat checkout barang yang lagi rame ini!"

[Detik 04 - 15: DEMONSTRASI MASALAH & KEUNGGULAN]
(Visual: Tunjukkan detail produk dan reaksi nyata)
"Jujurly, kemarin-kemarin gue mikir biasa aja. Pas dicoba langsung? Gak expect bakal se-worth it ini! 
Nih lihat sendiri, ${productDesc}."

[Detik 16 - 25: PROOF & REKOMENDASI]
"Bahannya beneran premium, gak kaleng-kaleng. Buat lu yang nyari ${productName} yang beneran terbukti, ini definisi penyelamat hidup sih."

[Detik 26 - 35: CALL TO ACTION]
(Visual: Jari menunjuk ke arah pojok kiri bawah layar)
"Mumpung stoknya masih ada dan lagi dapet kupon diskon live, buruan tap keranjang kuning sekarang juga sebelum kehabisan ya guys!"

💬 Catatan Host Live: Sering-sering ingatkan audiens buat tap-tap layar dan spill varian favorit di kolom komentar!`;
    } else {
      hook = `Kalau Anda masih bingung cari yang beneran berkualitas, tonton video ini 30 detik aja!`;
      caption = `🎬 [SKRIP VIDEO PENDEK TIKTOK / OUTLINE LIVE]

[Detik 00 - 03: HOOK PEMBUKA]
(Visual: Close-up produk ${productName} dengan teks besar di tengah layar)
"Tahan dulu scroll-nya! Buat Anda yang lagi butuh solusi terbaik, ini dia yang wajib Anda tahu!"

[Detik 04 - 15: MASALAH & PENJELASAN]
(Visual: Tunjukkan penggunaan langsung atau detail tekstur)
"Banyak yang sering salah pilih produk serupa, padahal rahasianya ada di sini: ${productDesc}."

[Detik 16 - 25: PEMBUKTIAN & MANFAAT]
"Sekali coba, perbedaannya langsung berasa nyata. Bukan cuma janji manis, tapi kualitas yang bicara!"

[Detik 26 - 35: CALL TO ACTION]
(Visual: Tunjukkan promo harga spesial dan tanda panah ke keranjang)
"Khusus yang checkout dari video ini, ada promo spesial! Langsung amankan di keranjang kuning sekarang juga!"`;
    }

    formula = 'PAS';
    formulaBreakdown = {
      attentionOrProblem: 'Hook 3 detik pertama dengan visual eye-catching dan kata pembuka yang menghentikan jempol audiens.',
      interestOrAgitation: 'Menyinggung rasa penasaran dan keresahan salah beli produk tiruan di pasar.',
      desireOrSolution: `Memperlihatkan keunggulan nyata: ${productDesc}`,
      action: 'Instruksi visual dan verbal mengarah ke keranjang kuning di kiri bawah.'
    };
    hashtags = ['#TikTokShopIndonesia', '#RacunTikTok', '#SerunyaBelajar', '#ProdukViral', '#UMKMTikTok'];
    bestPostingTime = '12.00 - 13.00 WIB & 18.30 - 21.00 WIB saat jam puncak scrolling';
    proTip = 'Gunakan musik sound TikTok yang sedang trending (volume 8-12%) sebagai latar belakang naskah ini.';
  } else {
    // Instagram Caption
    if (tone === 'emak-emak') {
      hook = `Bunda, jujur ya... ada nggak yang suka pusing cari yang pas buat kebutuhan di rumah? 🥰`;
      caption = `Bunda, jujur ya... ada nggak yang suka pusing cari produk yang beneran awet, berkualitas, tapi harganya tetap ramah di kantong? 🥰

Nah, kenalin nih ${productName}! Solusi praktis andalan para Bunda pintar ✨

Kenapa Bunda bakal suka banget sama produk ini?
🌸 Kualitas terjamin: ${productDesc}
🌸 Praktis & nggak bikin ribet sama sekali
🌸 Hemat pengeluaran, kepake lama buat keluarga tercinta!

Seneng banget rasanya kalau bisa dapet barang yang bikin hati tenang tanpa was-was. Anak-anak dan suami pun pasti puas! 💖

Yuk Bun, jangan tunggu kehabisan stok yaa. Mumpung lagi ada promo spesial minggu ini!

📲 Cara order gampang banget:
1. Klik link di Bio Instagram kita
2. Atau langsung kirim pesan ke DM ya Bunda cantik!`;
    } else if (tone === 'humor-genz') {
      hook = `Definisi nemu harta karun lokal yang bikin hidup berasa 10x lebih tenang ✨🙌`;
      caption = `Definisi nemu harta karun lokal yang bikin hidup berasa 10x lebih tenang ✨🙌

Spill dikit rahasia gue akhir-akhir ini: ${productName}.
Sumpah ya, awalnya iseng pengen coba, tapi pas udah dateng malah nagih pol! 😭🔥

Nih speknya yang bikin gue gak bisa pindah ke lain hati:
👉 ${productDesc}
👉 Anti ribet, aesthetic, dan beneran berfaedah
👉 Worth every single rupiah!

Gak usah overthinking kelamaan guys, nanti keburu nyesel pas stoknya sold out! 🏃💨

Mau kembaran sama gue? Langsung tap link di bio sekarang juga yaa! ✨`;
    } else if (tone === 'soft-selling') {
      hook = `Terkadang, kebahagiaan sederhana berawal dari pilihan kecil yang tepat untuk hari-hari kita. 🌿`;
      caption = `Terkadang, kebahagiaan sederhana berawal dari pilihan kecil yang tepat untuk hari-hari kita. 🌿

Pernahkah Anda merasa lelah dengan produk yang hanya menawarkan janji manis, tapi hasilnya kurang memuaskan? Kami memahami betapa berharganya kenyamanan dan ketenangan pikiran Anda.

Itulah alasan kami menghadirkan ${productName}. Dirancang dengan penuh dedikasi dan cinta dari tangan-tangan pengrajin lokal Indonesia:
✨ ${productDesc}

Setiap detailnya kami pastikan menghadirkan manfaat nyata, menemani rutinitas Anda menjadi jauh lebih bermakna dan menyenangkan.

Beri ruang untuk hal-hal terbaik hadir dalam hidup Anda hari ini.

Kunjungi tautan di bio kami untuk membawa pulang kehangatan ini, atau kirimkan pesan kepada kami melalui DM untuk konsultasi ramah. 💌`;
    } else {
      // Hard-Selling
      hook = `⚡ JANGAN LEWATKAN! Promo Terbatas ${productName} - Khusus Order Hari Ini Saja!`;
      caption = `⚡ JANGAN LEWATKAN! Promo Terbatas ${productName} - Khusus Order Hari Ini Saja!

Sedang mencari produk yang benar-benar terbukti kualitasnya dan tidak mengecewakan? Stop mencari di tempat lain!

Inilah keunggulan eksklusif yang Anda dapatkan:
🔥 ${productDesc}
🔥 Garansi 100% Puas atau Penggantian Baru
🔥 Pengiriman Cepat & Packing Ekstra Aman Langsung ke Rumah Anda

⚠️ PERINGATAN: Stok bahan baku sangat terbatas dan batch produksi minggu ini tersisa sedikit! Jangan sampai Anda gigit jari karena kehabisan.

AMBIL KESEMPATAN INI SEKARANG JUGA:
👉 Klik link di bio profile kami untuk langsung terhubung ke admin WhatsApp resmi
👉 Atau ketik "SAYA MAU PROMO" di kolom komentar / DM sekarang juga!`;
    }

    formula = tone === 'soft-selling' ? 'PAS' : 'AIDA';
    formulaBreakdown = {
      attentionOrProblem: hook,
      interestOrAgitation: 'Membangun kedekatan emosional dan relevansi dengan keseharian target konsumen Indonesia.',
      desireOrSolution: `Memaparkan manfaat utama produk: ${productDesc}`,
      action: 'Instruksi klik link di bio atau pesan via DM/WhatsApp.'
    };
    hashtags = ['#UMKMIndonesia', '#ProdukLokal', '#BanggaBuatanIndonesia', '#BisnisOnline', '#JualProdukLokal', '#KaryaAnakBangsa'];
  }

  return {
    id: 'copy-' + Date.now(),
    caption,
    hook,
    formula,
    formulaBreakdown,
    hashtags,
    bestPostingTime,
    proTip,
    timestamp: Date.now(),
    productName,
    productDescription: productDesc,
    tone: tone as any,
    platform: platform as any
  };
}

// Safe JSON parser helper with markdown cleanup
function safeParseJSON<T = any>(text: string): T | null {
  try {
    if (!text || typeof text !== 'string') return null;
    const cleaned = text
      .trim()
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.warn('Failed to parse JSON from AI response:', err);
    return null;
  }
}

// Helper to run with timeout
function withTimeout<T>(promise: Promise<T>, ms: number, errorMessage = 'Operation timed out'): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      const timer = setTimeout(() => {
        clearTimeout(timer);
        reject(new Error(errorMessage));
      }, ms);
    }),
  ]);
}

// API endpoint to generate copy
app.post('/api/generate-copy', async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object') {
      return res.status(400).json({
        error: 'Data permintaan tidak valid atau format JSON salah.',
      });
    }

    const rawName = typeof req.body.productName === 'string' ? req.body.productName.trim() : '';
    const rawDesc = typeof req.body.productDescription === 'string' ? req.body.productDescription.trim() : '';
    const rawNotes = typeof req.body.additionalNotes === 'string' ? req.body.additionalNotes.trim() : '';

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

    // Sanitize lengths to prevent memory bloat
    const productName = rawName.slice(0, 150);
    const productDescription = rawDesc.slice(0, 2000);
    const additionalNotes = rawNotes.slice(0, 500);

    const ALLOWED_TONES = ['hard-selling', 'soft-selling', 'humor-genz', 'emak-emak'];
    const ALLOWED_PLATFORMS = ['instagram', 'marketplace', 'tiktok'];

    const selectedTone = ALLOWED_TONES.includes(req.body.tone) ? req.body.tone : 'hard-selling';
    const selectedPlatform = ALLOWED_PLATFORMS.includes(req.body.platform) ? req.body.platform : 'instagram';

    // If Gemini client is available, call the Gemini API
    if (ai) {
      try {
        const prompt = `Anda adalah Senior Copywriter dan Digital Marketing Expert terkemuka untuk pasar UMKM (Usaha Mikro, Kecil, dan Menengah) Indonesia.
Buatkan materi copywriting penjualan yang sangat persuasif, berdaya jual tinggi, dan mengalir natural dalam Bahasa Indonesia untuk produk berikut:

INFORMASI PRODUK:
- Nama Produk: "${productName}"
- Deskripsi / Bahan / Keunggulan: "${productDescription}"
${additionalNotes ? `- Catatan Tambahan / Promo: "${additionalNotes}"` : ''}
- Tone of Voice Target: "${selectedTone}" (Pilihan: hard-selling, soft-selling, humor-genz, emak-emak)
- Platform Target: "${selectedPlatform}" (Pilihan: instagram, marketplace, tiktok)

PANDUAN TONE OF VOICE:
- hard-selling: Bahasa tegas, to the point, urgency tinggi, batas waktu/stok terbatas, dorongan aksi segera tanpa ragu.
- soft-selling: Storytelling emosional, empati, relate dengan rutinitas atau kehangatan keluarga, menyelesaikan masalah secara tulus, menjual tanpa terasa jualan.
- humor-genz: Santai, gaul, relate dengan bahasa kekinian netizen Indonesia ('jujurly', 'capek bgt', 'definisi', 'nagih pol', 'gak kaleng-kaleng'), meme-friendly tanpa berlebihan.
- emak-emak: Sapaan hangat dan akrab ('Halo Bunda!', 'Moms tercinta'), mengedepankan kepraktisan keluarga, kebersihan, rasa hemat, suami/anak suka, rekomendasi tulus.

PANDUAN SPESIFIK PLATFORM:
- instagram: Hook pembuka 1-2 baris yang bikin berhenti scroll (stop-scrolling hook). Line-spacing rapi & emoji yang pas. Body text yang fokus pada manfaat. Call To Action (CTA) jelas ke link bio / DM. Diakhiri dengan 10-15 hashtag lokal Indonesia tertarget.
- marketplace: Judul Produk teroptimasi SEO pencarian Marketplace ([PROMO/GARANSI] + Nama Produk + Varian/Fitur + Kata Kunci Pencarian), ringkasan alasan beli, spesifikasi lengkap dalam format bullet points, info garansi/packing aman, dan CTA checkout segera.
- tiktok: Format skrip video pendek / panduan host Live Streaming terstruktur dengan timestamp panduan: [Detik 0-3 HOOK VISUAL & KATA PEMBUKA], [Detik 4-15 MASALAH / DEMO PRODUK], [Detik 16-25 KEUNGGULAN / PEMBUKTIAN], [Detik 26-35 CTA TEGAS KLIK KERANJANG KUNING / TAP-TAP LAYAR]. Sertakan hashtag TikTok viral Indonesia.

FORMULA COPYWRITING:
Gunakan formula teruji seperti AIDA (Attention, Interest, Desire, Action) atau PAS (Problem, Agitate, Solution).

KEMBALIKAN OUTPUT DALAM BENTUK JSON DENGAN STRUKTUR BERIKUT:
{
  "caption": "Teks caption/konten lengkap dan siap pakai dengan spasi paragraf rapi",
  "hook": "Kalimat pembuka (hook) yang paling menarik perhatian",
  "formula": "AIDA" atau "PAS",
  "formulaBreakdown": {
    "attentionOrProblem": "Penjelasan bagian Attention (atau Problem)",
    "interestOrAgitation": "Penjelasan bagian Interest (atau Agitation)",
    "desireOrSolution": "Penjelasan bagian Desire (atau Solution)",
    "action": "Penjelasan bagian Action (Call To Action)"
  },
  "hashtags": ["#Hashtag1", "#Hashtag2", ...],
  "bestPostingTime": "Rekomendasi waktu posting terbaik (misal: 11.30 - 13.00 WIB)",
  "proTip": "Satu tips taktis praktis dari copywriter untuk memaksimalkan hasil penjualan produk ini"
}`;

        const candidateModels = ['gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-3.8-flash'];
        let rawText: string | null = null;
        let lastError: any = null;

        for (const modelName of candidateModels) {
          try {
            // Apply a 14-second timeout per model attempt to prevent hanging
            const response = await withTimeout(
              ai.models.generateContent({
                model: modelName,
                contents: prompt,
                config: {
                  responseMimeType: 'application/json',
                  temperature: 0.8,
                  topP: 0.95,
                  responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                      caption: { type: Type.STRING },
                      hook: { type: Type.STRING },
                      formula: { type: Type.STRING },
                      formulaBreakdown: {
                        type: Type.OBJECT,
                        properties: {
                          attentionOrProblem: { type: Type.STRING },
                          interestOrAgitation: { type: Type.STRING },
                          desireOrSolution: { type: Type.STRING },
                          action: { type: Type.STRING },
                        },
                        required: ['attentionOrProblem', 'interestOrAgitation', 'desireOrSolution', 'action'],
                      },
                      hashtags: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                      bestPostingTime: { type: Type.STRING },
                      proTip: { type: Type.STRING },
                    },
                    required: ['caption', 'hook', 'formula', 'formulaBreakdown', 'hashtags', 'bestPostingTime', 'proTip'],
                  },
                },
              }),
              14000,
              `Gemini model ${modelName} call timeout`
            );

            if (response && response.text) {
              rawText = response.text;
              console.log(`Successfully generated copywriting using model: ${modelName}`);
              break;
            }
          } catch (modelErr: any) {
            lastError = modelErr;
            console.warn(`Model ${modelName} attempt error:`, modelErr?.message || modelErr);
          }
        }

        if (rawText) {
          const parsed = safeParseJSON<any>(rawText);
          if (parsed && typeof parsed.caption === 'string' && parsed.caption.trim().length > 0) {
            return res.json({
              id: 'copy-' + Date.now(),
              caption: parsed.caption.trim(),
              hook: typeof parsed.hook === 'string' ? parsed.hook : 'PENAWARAN SPESIAL HARI INI!',
              formula: parsed.formula === 'PAS' ? 'PAS' : 'AIDA',
              formulaBreakdown: parsed.formulaBreakdown || {
                attentionOrProblem: 'Menarik perhatian audiens.',
                interestOrAgitation: 'Membangun ketertarikan dengan produk.',
                desireOrSolution: productDescription,
                action: 'Ajak untuk pesan sekarang.',
              },
              hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags : ['#UMKMIndonesia', '#ProdukLokal'],
              bestPostingTime: parsed.bestPostingTime || '12.00 - 13.00 WIB & 19.00 - 21.00 WIB',
              proTip: parsed.proTip || 'Sertakan foto atau video produk asli buatan sendiri untuk meningkatkan kepercayaan pelanggan.',
              timestamp: Date.now(),
              productName,
              productDescription,
              tone: selectedTone,
              platform: selectedPlatform,
            });
          }
        }

        if (lastError) {
          console.error('All Gemini candidate models failed, switching to intelligent fallback generator:', lastError?.message || lastError);
        }
      } catch (geminiError) {
        console.error('Gemini API block error, using intelligent fallback generator:', geminiError);
      }
    }

    // Guaranteed fallback generator (wrapped in try-catch so it NEVER throws 500)
    try {
      const fallbackResult = generateSmartFallback(productName, productDescription, selectedTone, selectedPlatform);
      return res.json(fallbackResult);
    } catch (fallbackErr) {
      console.error('Fallback generation unexpected error, using static recovery:', fallbackErr);
      return res.json({
        id: 'copy-' + Date.now(),
        caption: `⭐ JUAL ${productName.toUpperCase()} ASLI & BERKUALITAS ⭐\n\n${productDescription}\n\n✅ Kualitas Terjamin & Packing Aman\n✅ Siap Kirim ke Seluruh Indonesia\n\nYuk segera hubungi kami atau klik link di bio untuk order sekarang juga sebelum promo berakhir!`,
        hook: `⭐ JUAL ${productName.toUpperCase()} ASLI & BERKUALITAS ⭐`,
        formula: 'AIDA',
        formulaBreakdown: {
          attentionOrProblem: `Menyita perhatian calon pembeli ${productName}.`,
          interestOrAgitation: 'Memberikan kepastian kualitas produk dan rasa aman.',
          desireOrSolution: productDescription,
          action: 'Instruksi klik link di bio atau WhatsApp.',
        },
        hashtags: ['#UMKMIndonesia', '#ProdukLokal', '#BanggaBuatanIndonesia', '#BisnisOnline'],
        bestPostingTime: '11.30 - 13.00 WIB & 19.00 - 21.00 WIB',
        proTip: 'Gunakan foto produk asli dengan latar belakang bersih dan pencahayaan terang.',
        timestamp: Date.now(),
        productName,
        productDescription,
        tone: selectedTone,
        platform: selectedPlatform,
      });
    }
  } catch (fatalError: any) {
    console.error('Fatal error in /api/generate-copy handler:', fatalError);
    return res.status(500).json({
      error: 'Terjadi kesalahan sistem saat memproses permintaan. Silakan periksa kembali data produk Anda.',
    });
  }
});

// Express unhandled error middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled express pipeline error:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({
    error: 'Terjadi kesalahan internal server. Silakan coba kembali.',
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    aiConfigured: !!ai,
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SalinKilat UMKM server running on http://0.0.0.0:${PORT}`);
  });
}

start();
