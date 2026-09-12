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
      // 4. Repair unescaped raw newlines/tabs inside string literals
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

  const hookMatch = text.match(/"hook"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  const hook = hookMatch && hookMatch[1]
    ? hookMatch[1].replace(/\\"/g, '"').trim()
    : rawCaption.split('\n')[0] || 'SPESIAL KULINER NUSANTARA HARI INI!';

  const formulaMatch = text.match(/"formula"\s*:\s*"(AIDA|PAS)"/i);
  const formula: 'AIDA' | 'PAS' = formulaMatch && formulaMatch[1].toUpperCase() === 'PAS' ? 'PAS' : 'AIDA';

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
    hashtags: hashtags.length > 0 ? hashtags.slice(0, 15) : ['#KulinerIndonesia', '#MakananEnak', '#BikinNgiler'],
    bestPostingTime: '11.30 - 13.00 WIB & 18.30 - 20.30 WIB',
    proTip: 'Rekam video uap mengepul atau tarikan kuah kental untuk memancing rasa lapar penonton.',
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

/**
 * Safely sanitizes error messages by masking API keys and sensitive tokens
 * before printing to server logs or returning to clients.
 */
export function sanitizeErrorMessage(error: any): string {
  if (!error) return 'Terjadi kendala sistem.';
  const raw = typeof error === 'string' ? error : error.message || String(error);
  return raw
    .replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_API_KEY]')
    .replace(/key=[a-zA-Z0-9_-]+/gi, 'key=[REDACTED]')
    .replace(/bearer\s+[a-zA-Z0-9_\-\.]+/gi, 'Bearer [REDACTED]');
}

/**
 * Smart Culinary Fallback Generator
 * Generates mouth-watering, authentic Indonesian food copywriting
 * with sensory taste triggers, aroma, and visual hunger.
 */
export function generateSmartFallback(
  productName: string,
  productDesc: string,
  tone: ToneOfVoice,
  platform: Platform
): CopyResult {
  let caption = '';
  let hook = '';
  let formula: 'AIDA' | 'PAS' = 'PAS';
  let formulaBreakdown = {
    attentionOrProblem: '',
    interestOrAgitation: '',
    desireOrSolution: '',
    action: '',
  };
  let hashtags: string[] = [];
  let bestPostingTime = '11.00 - 13.00 WIB & 18.00 - 20.30 WIB';
  let proTip = '';

  // Standardize tone aliases
  const effectiveTone: ToneOfVoice =
    tone === 'humor-genz' ? 'kuliner-genz' :
    tone === 'hard-selling' ? 'lapar-mata' :
    tone === 'soft-selling' ? 'cerita-rasa' : tone;

  if (platform === 'tiktok') {
    bestPostingTime = '11.30 - 13.00 WIB & 19.00 - 21.00 WIB';
    proTip = 'Gunakan suara asli ASMR (suara kriuk renyah atau desisan bumbu dituang) dan rekam suapan pertama dengan zoom-in dramatis.';

    if (effectiveTone === 'kuliner-genz') {
      hook = `[Detik 0-3 HOOK ASMR & VISUAL] Plis jangan ditonton pas lagi laper, nanti kalap checkout! 🤤🔥`;
      caption = `[Detik 0-3 HOOK VISUAL & SOUND ASMR]
(Visual: Close-up zoom in ${productName}, perlihatkan uap panas mengepul dan bumbunya yang medok melimpah)
"Plis jangan ditonton pas lagi laper atau mager, karena ini beneran racun kuliner paling berbahaya minggu ini!"

[Detik 4-15 MASALAH / RASA PENASARAN]
"Kalian sering gak sih beli makanan tapi bumbunya pelit, atau rasanya hambar kayak janji mantan? Nah, buang jauh-jauh rasa kecewa itu!"

[Detik 16-25 REVIEW SENSORI RASA & TEKSTUR]
(Visual: Suapan pertama, perlihatkan tekstur kenyal/krispi yang juicy)
"${productDesc}
Gila sih, pas suapan pertama masuk mulut, rasa gurih berempahnya langsung nendang pol! Bumbunya meresap sampai ke serat terdalam, nagih parah!"

[Detik 26-35 CTA GAS CHECKOUT KERANJANG KUNING]
"Mumpung stok batch fresh baru matang hari ini, buruan amankan porsi kalian di keranjang kuning sekarang sebelum kehabisan ya bestie!"`;
    } else if (effectiveTone === 'emak-emak') {
      hook = `[Detik 0-3 HOOK BUNDA] Solusi lauk praktis penyelamat waktu makan keluarga nih Moms! 🍲✨`;
      caption = `[Detik 0-3 HOOK BUNDA & KELUARGA]
(Visual: Bunda menyajikan ${productName} di piring saji cantik bersama nasi hangat)
"Bunda sering pusing mikirin menu makan keluarga yang praktis tapi rasanya dijamin juara? Ini dia jawabannya!"

[Detik 4-15 KEPRAKTISAN & KEBERSIHAN]
"Gak perlu repot ngulek bumbu berjam-jam di dapur lagi. Cukup stok ${productName} di kulkas, kapan pun anak atau suami laper tinggal sajikan!"

[Detik 16-25 KUALITAS RASA RUMAHAN]
"${productDesc}
Dimasak higienis dengan bumbu rempah asli pilihan, rasanya sedap gurih alami tanpa pengawet berbahaya. Dijamin seisi rumah nambah nasi berkali-kali!"

[Detik 26-35 CTA ORDER MUDAH]
"Yuk Bun, langsung klik keranjang kuning atau tautan di profil ya. Stok terbatas untuk pengiriman batch hari ini!"`;
    } else if (effectiveTone === 'tradisional-legendaris') {
      hook = `[Detik 0-3 HOOK RESEP LELUHUR] Rahasia bumbu rempah warisan yang gak pernah bohong soal rasa! 👑🍛`;
      caption = `[Detik 0-3 HOOK OTENTIK NUSANTARA]
(Visual: Wajan kuali tradisional, bumbu rempah mendidih harum semerbak)
"Inilah kenikmatan kuliner asli yang dimasak dengan kesabaran dan resep warisan turun-temurun!"

[Detik 4-15 CERITA DEDIKASI MASAK]
"Bukan sekadar makanan instan biasa. ${productName} diolah tradisional menggunakan rempah pilihan nusantara yang dimasak lambat hingga bumbu medok meresap sempurna."

[Detik 16-25 BUKTI KELEZATAN]
"${productDesc}
Aroma rempahnya semerbak wangi, rasa gurih alaminya bikin rindu masakan kampung halaman."

[Detik 26-35 AJAKAN MENIKMATI]
"Buktikan sendiri kelezatan otentiknya sekarang! Klik keranjang kuning selagi stok fresh masih tersedia."`;
    } else {
      // Lapar-mata / Default
      hook = `[Detik 0-3 HOOK LAPAR MATA] AWAS NGILER! Liat nih tekstur dan lelehan bumbu ${productName}! 🤤💥`;
      caption = `[Detik 0-3 HOOK LAPAR MATA]
(Visual: Rekaman macro close up bumbu gurih melimpah yang menggoda lidah)
"AWAS AIR LIUR NETES! Siapa yang tahan liat godaan se-lezat ini pas perut lagi keroncongan?!"

[Detik 4-15 GODAAN RASA GURIH]
"${productName} hadir dengan porsi melimpah dan rasa yang bikin lidah bergoyang!
${productDesc}"

[Detik 16-25 PROMO TERBATAS HARI INI]
"Khusus order hari ini, ada promo spesial ekstra porsi / potongan ongkir buat kalian yang gerak cepat!"

[Detik 26-35 CTA GAS CHECKOUT]
"Gak usah ditunda lagi, langsung tap keranjang kuning sekarang juga sebelum promo ditutup!"`;
    }

    formula = 'AIDA';
    formulaBreakdown = {
      attentionOrProblem: hook,
      interestOrAgitation: 'Memancing rasa lapar penonton dengan visual uap mengepul dan bumbu medok.',
      desireOrSolution: `Memaparkan sensori kelezatan rasa & tekstur: ${productDesc}`,
      action: 'Dorongan kuat checkout keranjang kuning TikTok selagi stok batch fresh ready.',
    };
    hashtags = ['#KulinerTikTok', '#JajananViral', '#ASMRMakanan', '#BikinNgiler', '#RacunKuliner', '#MakanEnak', '#FoodiesTikTok'];
  } else if (platform === 'whatsapp') {
    bestPostingTime = '09.30 - 11.30 WIB (sebelum jam makan siang) & 16.00 - 17.30 WIB';
    proTip = 'Gunakan format pesan yang rapi dengan bullet points, dan sertakan batas waktu pemesanan (cut-off time) agar pembeli segera mentransfer.';

    if (effectiveTone === 'emak-emak') {
      hook = `Halo Bunda & Moms tersayang! Mau info lauk praktis lezat buat keluarga hari ini nih 💕🍲`;
      caption = `Halo Bunda & Moms tersayang! 💕
Semoga harinya selalu penuh berkah ya.

Bunda suka bingung mau nyiapin lauk apa buat keluarga yang praktis tapi rasanya dijamin bikin suami & anak lahap?

Kabar baik Bun! Hari ini baru saja ready batch fresh:
🌟 *${productName}* 🌟

Kenapa wajib ada di kulkas Bunda?
✅ *Rasa Juara:* ${productDesc}
✅ *Praktis:* Siap saji / tinggal hangatkan sebentar, gak perlu repot ngulek bumbu.
✅ *Higienis:* Dibuat dari bahan segar pilihan tanpa bahan pengawet berbahaya.
✅ *Hemat:* Porsi mantap, cocok dinikmati bareng seluruh keluarga.

📦 *Format Pesan Cepat:*
Nama:
Alamat Lengkap:
Jumlah Pesanan:

Silakan langsung balas pesan WA ini ya Bun sebelum kehabisan stok hari ini! Selamat memanjakan lidah keluarga tercinta 🥰`;
    } else if (effectiveTone === 'tradisional-legendaris') {
      hook = `Bismillah, Open Order Menu Resep Warisan: ${productName} (Stok Terbatas) 👑✨`;
      caption = `Bismillah, Assalamu'alaikum Pelanggan Setia 🙏

Rindu dengan masakan khas kampung halaman yang kaya rempah dan dimasak dengan resep tradisional otentik?

Hari ini kami membuka pesanan untuk menu andalan:
🍛 *${productName}* 🍛

Keistimewaan rasa dari dapur kami:
✨ ${productDesc}
✨ Dimasak tradisional menggunakan racikan rempah pilihan nusantara.
✨ Bumbu meresap gurih sampai ke serat terdalam, tanpa jalan pintas.
✨ Dikemas higienis, rapat, dan aman untuk pengiriman ke seluruh wilayah.

📌 *Info Pemesanan Hari Ini:*
- Siap kirim langsung / kurir instan & sameday
- Stok batch terbatas demi menjaga kualitas rasa tetap segar

Untuk pemesanan cepat, silakan balas chat ini dengan mencantumkan nama & alamat pengiriman. Terima kasih banyak atas kepercayaannya! 🌿`;
    } else {
      hook = `🔥 PROMO KHUSUS HARI INI: ${productName} Fresh Siap Kirim! 🤤`;
      caption = `Halo Foodies! Siap-siap manjain lidah kamu hari ini ya! 🤤🔥

Menu favorit yang ditunggu-tunggu akhirnya ready stok lagi:
⭐ *${productName}* ⭐

Kenapa menu ini selalu jadi buruan?
💥 ${productDesc}
💥 Bumbu berlimpah, rasa gurih nendang, bikin suapan nasi gak bisa berhenti!
💥 Cocok buat makan siang, makan malam, atau stok ngemil seru bareng teman.

🎁 *PROMO SPESIAL PEMESANAN VIA WHATSAPP HARI INI:*
Pesan 2 porsi dapat bonus ekstra sambal / free ongkir area tertentu!

Yuk langsung amankan porsi kamu sekarang sebelum kehabisan, langsung balas pesan WA ini ya!`;
    }

    formula = 'PAS';
    formulaBreakdown = {
      attentionOrProblem: hook,
      interestOrAgitation: 'Mengatasi kerepotan masak dan menghadirkan solusi hidangan istimewa siap santap.',
      desireOrSolution: `Rincian keunggulan rasa dan kepraktisan: ${productDesc}`,
      action: 'Instruksi balas chat WhatsApp dengan format nama, alamat, dan jumlah porsi.',
    };
    hashtags = ['#KulinerRumahan', '#OpenPO', '#LaukPraktis', '#MenuHariIni', '#KateringLokal'];
  } else if (platform === 'marketplace') {
    bestPostingTime = '10.00 - 12.00 WIB & 19.00 - 21.00 WIB';
    proTip = 'Gunakan foto utama produk yang memperlihatkan tekstur dan kemasan vakum bersegel rapi agar pembeli yakin produk higienis dan aman di perjalanan.';

    hook = `[TERLARIS & HIGIENIS] ${productName} - Bumbu Medok Kaya Rempah`;
    caption = `[TERLARIS & BERGARANSI] ${productName} - Sensasi Rasa Gurih Lezat Pilihan Keluarga Indonesia

Sedang mencari kuliner lezat berkualitas yang praktis, higienis, dan rasanya benar-benar menggugah selera?
${productName} hadir sebagai pilihan tepat untuk santapan harian maupun stok makanan di rumah!

KENAPA HARUS MEMILIH PRODUK DARI TOKO KAMI?
⭐ RASA OTENTIK & KAYA REMPAH:
${productDesc}

⭐ JAMINAN KUALITAS & KEBERSIHAN:
- 100% menggunakan bahan-bahan segar berkualitas tinggi.
- Dimasak secara higienis dengan standar kebersihan terjaga.
- Tanpa bahan pengawet kimia berbahaya, aman untuk seluruh anggota keluarga.

⭐ KEMASAN EKSTRA AMAN:
- Dikemas dengan teknologi vakum kedap udara (food-grade).
- Dilapisi bubble wrap tebal + kardus pelindung sehingga aman untuk pengiriman ke seluruh kota di Indonesia.

CARA PENYAJIAN MUDAH:
1. Siap langsung dinikmati bersama sepiring nasi putih hangat.
2. Untuk sensasi lebih nikmat, cukup hangatkan sebentar di wajan / microwave selama 2-3 menit.

PENGIRIMAN & GARANSI:
- Pengiriman setiap hari kerja (Senin - Sabtu).
- Tersedia opsi pengiriman Reguler, Sameday, maupun Instant.
- Garansi kirim ulang jika produk rusak/bocor saat diterima (wajib video unboxing).

Yuk masukkan ke keranjang belanja Anda sekarang dan nikmati kelezatan istimewanya hari ini! Selamat berbelanja! 🛒🍲`;

    formula = 'AIDA';
    formulaBreakdown = {
      attentionOrProblem: 'Judul SEO ramah pencarian Marketplace + penegasan kualitas higienis.',
      interestOrAgitation: 'Memaparkan solusi kuliner praktis berkualitas tinggi tanpa repot memasak.',
      desireOrSolution: `Spesifikasi keunggulan rasa, keamanan kemasan, dan cara saji: ${productDesc}`,
      action: 'Ajakan checkout segera ke keranjang belanja marketplace.',
    };
    hashtags = ['#KulinerIndonesia', '#MakananSiapSaji', '#FrozenFoodHigienis', '#LaukPraktis', '#OlshopKuliner'];
  } else {
    // Instagram (Default)
    bestPostingTime = '11.00 - 12.30 WIB (menjelang makan siang) & 17.30 - 19.30 WIB (makan malam)';
    proTip = 'Jadikan 2 baris pertama sebagai hook visual yang bikin audiens berhenti scrolling. Gunakan foto/video close-up beresolusi tinggi dengan pencahayaan warm.';

    if (effectiveTone === 'emak-emak') {
      hook = `Bunda, pernah gak sih bingung mau masak apa pas anak dan suami udah nanyain lauk makan siang? 🍲✨`;
      caption = `Bunda, pernah gak sih bingung mau masak apa pas anak dan suami udah nanyain lauk makan siang? 🍲✨

Tenang Bun, sekarang Bunda gak perlu pusing lagi ngabisin waktu berjam-jam di dapur! Kenalin menu penyelamat keluarga: ${productName}!

Kenapa Bunda bakal jatuh cinta sama menu ini?
💖 ${productDesc}
💖 Rasanya sedap gurih alami, bumbunya medok meresap sampai ke serat terdalam.
💖 Higienis tanpa bahan pengawet berbahaya, cocok banget buat stok lauk praktis di kulkas.

Tinggal panaskan sebentar, hidangkan bareng nasi panas mengepul, dijamin seisi rumah langsung lahap makannya dan nambah berkali-kali! 🥰

Bunda mau stok di rumah juga?
👉 Klik link di bio kami sekarang ya Bun untuk pemesanan cepat via WhatsApp!
👉 Atau langsung kirim pesan ke DM kami, admin ramah siap membantu Bunda! 💕`;
    } else if (effectiveTone === 'kuliner-genz') {
      hook = `STOP SCROLLING! Plis jangan diliat kalau lagi diet, karena ini definisi guilty pleasure paling nagih! 😭🔥`;
      caption = `STOP SCROLLING! Plis jangan diliat kalau lagi diet, karena ini definisi guilty pleasure paling nagih! 😭🔥

Gak bisa bohong, nemu ${productName} ini beneran berasa nemu surga kuliner tersembunyi!
Awalnya cuma mau nyicip sesuap, eh tau-tau satu porsi ludes gak bersisa! 🤤

Nih alasan kenapa kamu wajib banget cobain:
✨ ${productDesc}
✨ Bumbunya melimpah ruah, rasa gurih berempahnya nendang pol di lidah!
✨ Teksturnya juara, bikin sensasi makan jadi makin seru dan nagih!

Gak usah overthinking kelamaan guys, nanti keburu nyesel pas stok fresh-nya ludes!

Yuk manjakan lidah kamu sekarang juga!
👉 Langsung klik link di bio profile untuk order via WhatsApp / Food App
👉 Tag temen kamu di kolom komentar yang wajib traktir kamu ini! 👇💥`;
    } else if (effectiveTone === 'tradisional-legendaris') {
      hook = `Di balik kelezatan yang otentik, ada resep warisan leluhur yang diracik dengan sepenuh hati. 👑🍛`;
      caption = `Di balik kelezatan yang otentik, ada resep warisan leluhur yang diracik dengan sepenuh hati. 👑🍛

Dalam dunia kuliner yang serba instan, kami memilih untuk tetap setia pada cita rasa tradisi. Menghadirkan ${productName} yang diolah dari racikan bumbu rempah pilihan nusantara:

✨ ${productDesc}

Setiap rempah ditumbuk dan dimasak perlahan dengan dedikasi tinggi, memastikan aroma harum semerbak dan rasa gurih medok yang meresap sempurna. Satu suapan yang akan membawa ingatan Anda kembali pada kehangatan masakan rumah masa kecil.

Sebuah kehormatan bagi kami untuk menghadirkan warisan rasa ini ke meja makan Anda sekeluarga.

Nikmati keaslian rasa kuliner nusantara hari ini:
🌿 Pemesanan resmi dapat melalui tautan di bio kami atau kirim pesan melalui DM.`;
    } else if (effectiveTone === 'cerita-rasa') {
      hook = `Bagi kami, makanan bukan sekadar pengisi perut, melainkan jembatan kehangatan dan kenangan manis. 🌿🍲`;
      caption = `Bagi kami, makanan bukan sekadar pengisi perut, melainkan jembatan kehangatan dan kenangan manis. 🌿🍲

Ingatkah Anda pada aroma masakan rumah yang selalu menyambut saat langkah kaki tiba di pintu dapur? Kehangatan itulah yang kami tuangkan dalam setiap sajian ${productName}.

Diproses dengan ketulusan tangan pengrajin lokal dan bahan segar bermutu tinggi:
✨ ${productDesc}

Kami percaya, kelezatan sejati lahir dari bahan terbaik yang diolah tanpa jalan pintas. Rasa gurih yang menenangkan jiwa, siap menemani momen santap bersama orang-orang tersayang.

Hadirkan kehangatan istimewa ini di rumah Anda:
💌 Silakan kunjungi tautan di bio untuk pemesanan atau sapa kami melalui pesan langsung (DM).`;
    } else {
      // Lapar-mata (Hard-selling food)
      hook = `AWAS BIKIN LAPAR MATA! Liat nih tekstur dan kilauan bumbu gurih ${productName}! 🤤💥`;
      caption = `AWAS BIKIN LAPAR MATA! Liat nih tekstur dan kilauan bumbu gurih ${productName}! 🤤💥

Siapa yang kuat nahan lapar kalau disuguhkan menu se-menggoda ini pas perut lagi keroncongan?!

Inilah alasan kenapa ${productName} jadi buruan para pecinta kuliner:
🔥 ${productDesc}
🔥 Bumbu rempah berlimpah, gurihnya nampol, dan aromanya semerbak menggugah selera!
🔥 Porsi puas, siap dinikmati kapan saja bareng nasi hangat pulen!

⚠️ PERHATIAN: Batch produksi segar hari ini sangat terbatas dan cepat habis! Jangan sampai kamu cuma bisa ngeliatin orang lain yang makan enak!

SERBU SEKARANG JUGA SEBELUM KEHABISAN:
👉 Klik link di bio profile untuk langsung terhubung ke admin pemesanan resmi
👉 Atau ketik "MAU PESAN SEKARANG" di kolom komentar / DM untuk promo spesial! 🚀`;
    }

    formula = effectiveTone === 'cerita-rasa' ? 'PAS' : 'AIDA';
    formulaBreakdown = {
      attentionOrProblem: hook,
      interestOrAgitation: 'Membangkitkan selera makan dan nafsu visual dengan deskripsi aroma serta tekstur menggoda.',
      desireOrSolution: `Memaparkan sensori rasa dan keunggulan bahan baku: ${productDesc}`,
      action: 'Instruksi klik link di bio atau pesan via WhatsApp/DM.',
    };
    hashtags = [
      '#KulinerIndonesia',
      '#MakananEnak',
      '#BikinNgiler',
      '#KulinerNusantara',
      '#FoodiesIndonesia',
      '#JajananLokal',
      '#ResepRumahan',
      '#MakanSiangEnak',
      '#WisataKuliner',
      '#UMKMKuliner',
    ];
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

// Generate culinary copywriting using Gemini AI with candidate models fallback and robust parsing
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

  const prompt = `Anda adalah Senior Culinary Copywriter, Food Critic, & Digital Food Marketer terkemuka untuk industri kuliner dan makanan UMKM (Usaha Mikro, Kecil, dan Menengah) di Indonesia.

TUGAS UTAMA:
Buatkan materi copywriting dan caption kuliner yang SANGAT MENGGUGAH SELERA (mouth-watering), memicu "lapar visual" (visual hunger), dan menggerakkan pembaca untuk langsung memesan (impulse buying) produk makanan berikut:

DATA PRODUK MAKANAN / KULINER:
- Nama Menu / Makanan: "${productName}"
- Deskripsi Rasa, Bahan & Tekstur: "${productDescription}"
${additionalNotes ? `- Catatan Tambahan (Cara Saji / Promo / Area Kirim): "${additionalNotes}"` : ''}
- Tone of Voice: "${tone}" (Pilihan utama: emak-emak, kuliner-genz, tradisional-legendaris, lapar-mata, cerita-rasa)
- Platform Target: "${platform}" (Pilihan: instagram, tiktok, whatsapp, marketplace)

PANDUAN KATA SENSORI RASA (SENSORY WORDS) - WAJIB DIGUNAKAN:
- Rasa: Gurih nendang, pedas mercon nampol, manis legit karamel, gurih berlemak umami, asam segar kecut nikmat, asin gurih pas.
- Tekstur: Krispi garing renyah, empuk lumer lembut di lidah (melt-in-your-mouth), kenyal chewy mantap, kuah kental medok, keju mulur mozzarella molor, serat daging empuk anti alot.
- Aroma: Semerbak wangi rempah asli nusantara, aroma asap bakaran arang smoky, harum daun jeruk & serai segar, wangi bawang goreng gurih, aroma mentega harum baru matang.
- Visual & Nafsu Makan: Minyak sambal merah merona berkilau, lelehan keju meleleh, kuah merah pedas mengepul panas beruap, taburan bumbu melimpah ruah, cocok banget disuap bareng nasi putih panas pulen!

PANDUAN TONE OF VOICE KULINER:
- emak-emak (Emak-Emak Friendly): Sapaan akrab khas Bunda/Moms arisan ("Halo Bunda sayang!", "Moms yang suka bingung mau masak apa"), fokus solusi lauk praktis keluarga, kebersihan & higienis, anak dan suami pasti nambah nasi, hemat dan tahan lama di kulkas.
- kuliner-genz (Kuliner Kekinian / Gen-Z): Gaya asmr & fomo gaul ("Jujurly ini definisi guilty pleasure paling nagih!", "Tolong jangan ditonton pas lagi puasa/diet 😭🔥"), fokus tekstur lumer/krispi, pedas nampol, review jujur gak pelit topping, ajakan racun kuliner viral.
- tradisional-legendaris (Pedagang Kuliner Tradisional): Hangat, otentik, penuh kebanggaan resep leluhur ("Resep warisan turun-temurun", "Diracik dari rempah asli nusantara tanpa kompromi rasa"), membawa nostalgia rasa kampung halaman, dedikasi proses masak sabar.
- lapar-mata (Lapar Mata & Promo Kilat): Bikin kalap seketika ("AWAS BIKIN NGILER!", "Lihat nih lelehan dan bumbu medoknya!"), deskripsi visual perut keroncongan, urgensi promo borong (Beli 2 Gratis 1 / Diskon Hari Ini), ajakan pesan sekarang juga sebelum kehabisan.
- cerita-rasa (Cerita Rasa & Nostalgia): Storytelling mendalam tentang aroma masakan ibu di dapur, bahan lokal berkualitas, memori kehangatan makan bersama keluarga tercinta.

PANDUAN SPESIFIK PLATFORM KULINER:
- instagram: Hook pembuka 1-2 baris yang bikin berhenti scroll (stop-scrolling visual hook). Spasi paragraf rapi & emoji kuliner yang menggugah selera. Deskripsi tekstur & sensori rasa. Call To Action (CTA) jelas ke link bio / WhatsApp / DM. Diakhiri dengan 10-15 hashtag kuliner lokal Indonesia tertarget.
- tiktok: Format skrip video ASMR pendek / panduan host Live Streaming terstruktur dengan timestamp panduan: [Detik 0-3 HOOK VISUAL & SUARA ASMR KRIUK/LUMER], [Detik 4-15 REAKSI SUAPAN PERTAMA & DEMO PRODUK], [Detik 16-25 REVIEW RASA GURIH, REMPAH & TEKSTUR], [Detik 26-35 CTA TEGAS KLIK KERANJANG KUNING SEBELUM KEHABISAN].
- whatsapp: Format pesan broadcast WA/Status yang siap dibagikan: Sapaan hangat, nama menu spesial, bullet points keunggulan rasa & kepraktisan, porsi & cara simpan, format pemesanan cepat (Nama - Alamat - Jumlah Porsi), CTA balas chat langsung.
- marketplace: Judul menu teroptimasi SEO pencarian kuliner ([SIAP SANTAP/FROZEN] + Nama Menu + Keunggulan Rasa), alasan wajib coba, rincian bahan/porsi, petunjuk cara penyajian/hangatkan, keamanan packing vakum kedap udara, dan CTA checkout ke keranjang belanja.

KEMBALIKAN OUTPUT DALAM FORMAT JSON VALID BERIKUT:
{
  "caption": "Teks caption/konten lengkap dan siap pakai dengan spasi paragraf rapi",
  "hook": "Kalimat pembuka (hook) yang paling memancing air liur / stop-scrolling",
  "formula": "AIDA" atau "PAS",
  "formulaBreakdown": {
    "attentionOrProblem": "Penjelasan bagian Attention (atau Problem) kuliner",
    "interestOrAgitation": "Penjelasan bagian Interest (atau Agitation) pemicu lapar",
    "desireOrSolution": "Penjelasan bagian Desire (atau Solution) sensori rasa & aroma",
    "action": "Penjelasan bagian Action (Call To Action pemesanan)"
  },
  "hashtags": ["#KulinerIndonesia", "#HashtagMakanan2"],
  "bestPostingTime": "Rekomendasi waktu posting kuliner terbaik (misal: 11.00 - 12.30 WIB menjelang jam makan siang)",
  "proTip": "Satu tips taktis foto/video kuliner dari food copywriter (misal: teknik rekam uap mengepul, pencahayaan warm white, atau plating daun pisang)"
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
            temperature: 0.85,
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
      console.warn(`Model ${modelName} failed or timed out:`, sanitizeErrorMessage(err));
    }
  }

  if (rawText) {
    const parsed = safeParseGeminiJSON<any>(rawText);
    if (parsed && typeof parsed.caption === 'string' && parsed.caption.trim().length > 10) {
      return {
        id: 'copy-' + Date.now(),
        caption: parsed.caption.trim(),
        hook: typeof parsed.hook === 'string' ? parsed.hook : 'PENAWARAN SPESIAL KULINER HARI INI!',
        formula: parsed.formula === 'PAS' ? 'PAS' : 'AIDA',
        formulaBreakdown: parsed.formulaBreakdown || {
          attentionOrProblem: 'Menarik perhatian pemicu lapar audiens.',
          interestOrAgitation: 'Membangkitkan selera dengan kelezatan visual dan aroma.',
          desireOrSolution: productDescription,
          action: 'Ajak untuk pesan dan checkout sekarang juga.',
        },
        hashtags: Array.isArray(parsed.hashtags) && parsed.hashtags.length > 0 ? parsed.hashtags : ['#KulinerIndonesia', '#MakananEnak', '#BikinNgiler'],
        bestPostingTime: parsed.bestPostingTime || '11.00 - 12.30 WIB & 18.00 - 20.30 WIB',
        proTip: parsed.proTip || 'Rekam video uap mengepul atau tarikan kuah panas untuk memaksimalkan rasa lapar penonton.',
        timestamp: Date.now(),
        productName,
        productDescription,
        tone,
        platform,
      };
    }
  }

  if (lastError) {
    console.error('All candidate Gemini models failed, proceeding to fallback culinary generator:', sanitizeErrorMessage(lastError));
  }

  return null;
}
