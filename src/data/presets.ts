import { PresetProduct } from '../types';

export const UMKM_PRESETS: PresetProduct[] = [
  {
    id: 'snack-balado',
    name: 'Keripik Singkong Balado Daun Jeruk',
    category: 'Kuliner & Camilan',
    description: 'Bahan singkong pilihan renyah tipis, bumbu balado asli cabai merah segar dengan taburan daun jeruk wangi, tanpa pengawet kimia, kemasan ziplock pouch 200gr, sertifikasi Halal & P-IRT.',
    tone: 'hard-selling',
    platform: 'instagram',
    badge: '🔥 Camilan Gurih'
  },
  {
    id: 'fashion-gamis',
    name: 'Gamis Rayon Twill Adem Busui Friendly',
    category: 'Fashion Muslim',
    description: 'Bahan katun rayon twill premium grade A jatuh & super adem, resleting depan aktif (busui friendly), saku samping kanan, lingkar dada 110cm panjang 138cm, jahitan butik rapi tidak menerawang.',
    tone: 'emak-emak',
    platform: 'marketplace',
    badge: '👗 Busana Muslim'
  },
  {
    id: 'kopi-literan',
    name: 'Es Kopi Susu Gula Aren 1 Liter',
    category: 'Minuman Kekinian',
    description: '100% biji kopi arabika & robusta lokal fresh brew, dipadukan susu creamy pasteurisasi dan sirup gula aren murni organik, botol higienis 1 Liter tahan 5 hari di kulkas, stok penyelamat saat lembur atau kumpul bareng.',
    tone: 'humor-genz',
    platform: 'tiktok',
    badge: '☕ Kopi Viral'
  },
  {
    id: 'skincare-serum',
    name: 'Brightening Serum Beras Organik & Niacinamide',
    category: 'Skincare Lokal',
    description: 'Ekstrak beras organik lokal fermentasi + Niacinamide 5%, tekstur ringan mudah meresap tanpa rasa lengket, membantu mencerahkan kulit kusam & samarkan noda bekas jerawat, aman kulit sensitif & BPOM registered.',
    tone: 'soft-selling',
    platform: 'instagram',
    badge: '✨ Perawatan Kulit'
  },
  {
    id: 'kriya-tas',
    name: 'Tas Anyaman Serat Purun Handmade Etnik',
    category: 'Kriya & Kerajinan',
    description: 'Anyaman tangan pengrajin ibu-ibu desa Kalimantan, bahan serat purun alami ramah lingkungan, tali kulit sintetis kuat, muat dompet, HP dan pouch makeup, cocok untuk kondangan, santai, maupun souvenir unik.',
    tone: 'soft-selling',
    platform: 'marketplace',
    badge: '🌿 Kerajinan Lokal'
  }
];

export const TONE_OPTIONS = [
  {
    value: 'hard-selling',
    label: 'Hard-Selling Tegas',
    tagline: 'To the point, penawaran terbatas, urgensi tinggi',
    icon: 'Flame',
    color: 'amber',
    description: 'Cocok untuk promo diskon, flash sale, stok menipis, atau penutupan pre-order.',
  },
  {
    value: 'soft-selling',
    label: 'Soft-Selling Storytelling',
    tagline: 'Menyentuh perasaan, cerita masalah & solusi',
    icon: 'BookOpen',
    color: 'emerald',
    description: 'Membangun kedekatan emosional konsumen dengan cerita keseharian dan kehangatan.',
  },
  {
    value: 'humor-genz',
    label: 'Humoris / Gen-Z',
    tagline: 'Santai, gaul, relate dengan bahasa kekinian',
    icon: 'Smile',
    color: 'purple',
    description: 'Bahasa anak muda, ringan, seru, dan cocok untuk produk tren media sosial.',
  },
  {
    value: 'emak-emak',
    label: 'Emak-Emak Friendly',
    tagline: 'Ramah, akrab, solutif & perhitungan hemat keluarga',
    icon: 'HeartHandshake',
    color: 'rose',
    description: 'Sapaan khas Bunda/Moms, mengedepankan kualitas, kebersihan, dan manfaat praktis untuk keluarga.',
  },
] as const;

export const PLATFORM_OPTIONS = [
  {
    value: 'instagram',
    label: 'Instagram Caption',
    badge: 'IG Feed & Reels',
    icon: 'Instagram',
    focus: 'Hook visual, storytelling, jarak paragraf rapi, hashtag tertarget',
  },
  {
    value: 'marketplace',
    label: 'Marketplace (Shopee/Tokopedia)',
    badge: 'Shopee & Tokopedia',
    icon: 'ShoppingBag',
    focus: 'Judul SEO ramah pencarian, bullet points fitur & spek, garansi toko',
  },
  {
    value: 'tiktok',
    label: 'TikTok Script / Live',
    badge: 'TikTok Video & Live',
    icon: 'Video',
    focus: 'Hook 0-3 detik, skrip visual/dialog interaktif, ajakan keranjang kuning',
  },
] as const;
