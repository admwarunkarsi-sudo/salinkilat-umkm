import { GoogleGenAI, Type } from '@google/genai';
import { CopyResult, Platform, ToneOfVoice } from '../types';

// Safe JSON parser helper that handles markdown code blocks,
// unescaped newlines/tabs inside string literals, and malformed wrapper text
export function safeParseGeminiJSON<T = any>(text: string): T | null {
  if (!text || typeof text !== 'string') return null;

  const trimmed = text.trim();

  // 1. Direct parse attempt
  try {
    return JSON.parse(trimmed) as T;
  } catch {
    // continue to next strategy
  }

  // 2. Strip markdown code fences (```json ... ```)
  const stripped = trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    return JSON.parse(stripped) as T;
  } catch {
    // continue to next strategy
  }

  // 3. Extract JSON object substring between first '{' and last '}'
  const firstBrace = stripped.indexOf('{');
  const lastBrace = stripped.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const jsonCandidate = stripped.substring(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(jsonCandidate) as T;
    } catch {
      // 4. Repair unescaped raw newlines/tabs inside string literals (common in LLM multi-line strings)
      try {
        const repaired = repairJSONControlChars(jsonCandidate);
        return JSON.parse(repaired) as T;
      } catch {
        // continue to regex fallback
      }
    }
  }

  // 5. Regex field extraction fallback as ultimate safety net
  try {
    return extractFieldsWithRegex(stripped) as T;
  } catch (regexErr) {
    console.warn('All JSON parsing strategies failed for text length:', text.length, regexErr);
    return null;
  }
}

// Repairs unescaped raw control characters (newline, carriage return, tabs) inside JSON string values
function repairJSONControlChars(jsonStr: string): string {
  let insideString = false;
  let escaped = false;
  let result = '';

  for (let i = 0; i < jsonStr.length; i++) {
    const char = jsonStr[i];

    if (char === '\\' && !escaped) {
      escaped = true;
      result += char;
      continue;
    }

    if (char === '"' && !escaped) {
      insideString = !insideString;
      result += char;
      escaped = false;
      continue;
    }

    if (insideString) {
      if (char === '\n') {
        result += '\\n';
        escaped = false;
        continue;
      } else if (char === '\r') {
        result += '\\r';
        escaped = false;
        continue;
      } else if (char === '\t') {
        result += '\\t';
        escaped = false;
        continue;
      }
    }

    result += char;
    escaped = false;
  }

  return result;
}

// Fallback to extract individual fields via regular expressions if JSON syntax was damaged
function extractFieldsWithRegex(text: string): Partial<CopyResult> | null {
  // Try extracting caption
  const captionMatch =
    text.match(/"caption"\s*:\s*"((?:[^"\\]|\\.)*)"/s) ||
    text.match(/"caption"\s*:\s*`([^`]+)`/s) ||
    text.match(/"caption"\s*:\s*"([^"]+)/s);

  if (!captionMatch || !captionMatch[1]) return null;

  const rawCaption = captionMatch[1]
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '')
    .replace(/\\"/g, '"')
    .trim();

  if (rawCaption.length < 15) return null;

  // Extract hook
  const hookMatch = text.match(/"hook"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  const hook = hookMatch && hookMatch[1]
    ? hookMatch[1].replace(/\\"/g, '"').trim()
    : rawCaption.split('\n')[0] || 'PENAWARAN SPESIAL HARI INI!';

  // Extract formula
  const formulaMatch = text.match(/"formula"\s*:\s*"(AIDA|PAS)"/i);
  const formula: 'AIDA' | 'PAS' = formulaMatch && formulaMatch[1].toUpperCase() === 'PAS' ? 'PAS' : 'AIDA';

  // Extract hashtags
  const hashtags: string[] = [];
  const hashtagRegex = /#[A-Za-z0-9_]+/g;
  let match;
  while ((match = hashtagRegex.exec(text)) !== null) {
    if (!hashtags.includes(match[0])) {
      hashtags.push(match[0]);
    }
  }

  return {
    caption: rawCaption,
    hook,
    formula,
    hashtags: hashtags.length > 0 ? hashtags.slice(0, 15) : ['#UMKMIndonesia', '#ProdukLokal', '#BisnisOnline'],
    bestPostingTime: '11.30 - 13.00 WIB & 19.00 - 21.00 WIB',
    proTip: 'Sertakan foto produk asli dengan pencahayaan terang dan latar belakang bersih.',
  } as any;
}

// Timeout wrapper helper
export function withTimeout<T>(promise: Promise<T>, ms: number, errorMessage = 'Operation timed out'): Promise<T> {
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

// Smart local fallback generator for 100% reliability
export function generateSmartFallback(
  productName: string,
  productDesc: string,
  tone: ToneOfVoice,
  platform: Platform
): CopyResult {
  let caption = '';
  let hook = '';
  let formula: 'AIDA' | 'PAS' = 'AIDA';
  let formulaBreakdown = {
    attentionOrProblem: '',
    interestOrAgitation: '',
    desireOrSolution: '',
    action: '',
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
      action: 'Dorongan kuat checkout langsung sebelum jam batas pengiriman hari ini.',
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
      action: 'Instruksi visual dan verbal mengarah ke keranjang kuning di kiri bawah.',
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
      action: 'Instruksi klik link di bio atau pesan via DM/WhatsApp.',
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
    tone,
    platform,
  };
}

// Generate copywriting using Gemini AI with candidate models fallback and robust parsing
export async function generateCopywritingWithGemini(
  ai: GoogleGenAI,
  params: {
    productName: string;
    productDescription: string;
    tone: ToneOfVoice;
    platform: Platform;
    additionalNotes?: string;
  }
): Promise<CopyResult | null> {
  const { productName, productDescription, tone, platform, additionalNotes } = params;

  const prompt = `Anda adalah Senior Copywriter dan Digital Marketing Expert terkemuka untuk pasar UMKM (Usaha Mikro, Kecil, dan Menengah) Indonesia.
Buatkan materi copywriting penjualan yang sangat persuasif, berdaya jual tinggi, dan mengalir natural dalam Bahasa Indonesia untuk produk berikut:

INFORMASI PRODUK:
- Nama Produk: "${productName}"
- Deskripsi / Bahan / Keunggulan: "${productDescription}"
${additionalNotes ? `- Catatan Tambahan / Promo: "${additionalNotes}"` : ''}
- Tone of Voice Target: "${tone}" (Pilihan: hard-selling, soft-selling, humor-genz, emak-emak)
- Platform Target: "${platform}" (Pilihan: instagram, marketplace, tiktok)

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

KEMBALIKAN OUTPUT DALAM BENTUK JSON VALID BERIKUT:
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
  "hashtags": ["#Hashtag1", "#Hashtag2"],
  "bestPostingTime": "Rekomendasi waktu posting terbaik (misal: 11.30 - 13.00 WIB)",
  "proTip": "Satu tips taktis praktis dari copywriter untuk memaksimalkan hasil penjualan produk ini"
}`;

  const candidateModels = ['gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-3.8-flash'];
  let rawText: string | null = null;
  let lastError: any = null;

  for (const modelName of candidateModels) {
    try {
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
        `Timeout during ${modelName} invocation`
      );

      if (response && response.text) {
        rawText = response.text;
        break;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Model ${modelName} failed or timed out:`, err?.message || err);
    }
  }

  if (rawText) {
    const parsed = safeParseGeminiJSON<any>(rawText);
    if (parsed && typeof parsed.caption === 'string' && parsed.caption.trim().length > 10) {
      return {
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
        hashtags: Array.isArray(parsed.hashtags) && parsed.hashtags.length > 0 ? parsed.hashtags : ['#UMKMIndonesia', '#ProdukLokal'],
        bestPostingTime: parsed.bestPostingTime || '12.00 - 13.00 WIB & 19.00 - 21.00 WIB',
        proTip: parsed.proTip || 'Sertakan foto atau video produk asli buatan sendiri untuk meningkatkan kepercayaan pelanggan.',
        timestamp: Date.now(),
        productName,
        productDescription,
        tone,
        platform,
      };
    }
  }

  if (lastError) {
    console.error('All candidate Gemini models failed, proceeding to fallback generator:', lastError?.message || lastError);
  }

  return null;
}
