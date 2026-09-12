import { PresetProduct } from '../types';

export const UMKM_PRESETS: PresetProduct[] = [
  {
    id: 'sambal-cumi-mercon',
    name: 'Sambal Bawang Cumi Asin Mercon',
    category: 'Lauk & Sambal Rumahan',
    description: 'Potongan cumi asin empuk melimpah tidak alot, dimasak lambat dengan cabai rawit merah segar dan bawang merah Brebes gurih wangi. Tanpa pengawet buatan, minyak kemerahan medok wangi semerbak, cocok jadi teman nasi panas kepul-kepul.',
    tone: 'lapar-mata',
    platform: 'instagram',
    badge: '🌶️ Pedas Nampol'
  },
  {
    id: 'dimsum-mentai-bakar',
    name: 'Dimsum Mentai Mozzarella Torched',
    category: 'Jajanan & Camilan Kekinian',
    description: 'Dimsum ayam udang gemuk padat berdaging kenyal, disiram saus mentai gurih creamy sedikit pedas asam, diberi topping keju mozzarella mulur yang dibakar (torched) sampai wangi karamel asap smoky menggoda.',
    tone: 'kuliner-genz',
    platform: 'tiktok',
    badge: '🧀 Lumer Smoky'
  },
  {
    id: 'rendang-suwir-padang',
    name: 'Rendang Daging Sapi Suwir Bumbu Hitam',
    category: 'Kuliner Tradisional Warisan',
    description: 'Resep turun-temurun Minang asli, daging sapi pilihan disuwir halus dimasak 8 jam dengan santan kelapa tua murni dan 14 rempah pilihan sampai bumbu hitam medok meresap ke serat terdalam. Tahan 3 bulan suhu ruang, praktis tinggal santap.',
    tone: 'tradisional-legendaris',
    platform: 'marketplace',
    badge: '👑 Resep Warisan'
  },
  {
    id: 'kopi-susu-aren',
    name: 'Es Kopi Susu Creamy Gula Aren Asli 1 Liter',
    category: 'Minuman Segar & Kopi',
    description: 'Ekstrak espresso biji kopi arabika Mandheling & robusta Dampit, dipadu susu segar creamy tebal dan sirup gula aren organik asli Lebak beraroma pandan alami. Manisnya pas tidak bikin enek di tenggorokan, mood booster harian.',
    tone: 'kuliner-genz',
    platform: 'instagram',
    badge: '☕ Segar Creamy'
  },
  {
    id: 'ayam-ungkep-bumbu-kuning',
    name: 'Ayam Ungkep Lengkuas Rempah Frozen (Siap Goreng)',
    category: 'Frozen Food Praktis Bunda',
    description: '1 ekor ayam pejantan potong 4, diungkep bumbu kuning rempah lengkuas melimpah sampai bumbu meresap ke tulang. Dilengkapi serundeng lengkuas kriuk gurih dan sambal korek. Praktis buat stok lauk keluarga, tinggal goreng 5 menit.',
    tone: 'emak-emak',
    platform: 'whatsapp',
    badge: '🍗 Stok Bunda'
  },
  {
    id: 'bolu-jadul-keju-gondrong',
    name: 'Bolu Jadul Keju Gondrong Mentega Wisman',
    category: 'Kue & Bakery Rumahan',
    description: 'Kue bolu vanilla klasik super lembut spons, dioles butter cream gurih tidak bikin seret, ditaburi parutan keju cheddar melimpah ruah gondrong. Wangi semerbak mentega khas resep jadul yang ngangenin momen kumpul keluarga.',
    tone: 'cerita-rasa',
    platform: 'whatsapp',
    badge: '🍰 Lembut Harum'
  }
];

export const TONE_OPTIONS = [
  {
    value: 'emak-emak',
    label: 'Emak-Emak Friendly',
    tagline: 'Akrab, praktis, higienis & solusi lauk hemat keluarga',
    icon: 'HeartHandshake',
    color: 'rose',
    description: 'Sapaan khas Bunda/Moms, menonjolkan kepraktisan stok dapur, kebersihan, porsi hemat, dan rasa yang disukai anak maupun suami.',
  },
  {
    value: 'kuliner-genz',
    label: 'Kuliner Kekinian / Gen-Z',
    tagline: 'ASMR, visual lumer, pedas nampol & bikin FOMO',
    icon: 'Sparkles',
    color: 'purple',
    description: 'Gaya santai gaul anak muda, fokus pada sensasi kriuk krispi, keju mulur, lelehan saus, dan pemicu rasa penasaran viral.',
  },
  {
    value: 'tradisional-legendaris',
    label: 'Pedagang Kuliner Tradisional',
    tagline: 'Otentik, resep leluhur, rempah medok & cita rasa kampung halaman',
    icon: 'CookingPot',
    color: 'emerald',
    description: 'Menonjolkan keaslian resep turun-temurun, racikan rempah asli nusantara, ketelitian proses masak lama, dan kenikmatan rasa yang otentik.',
  },
  {
    value: 'lapar-mata',
    label: 'Lapar Mata & Promo Kilat',
    tagline: 'Visual menggoda, porsi barbar, urgensi promo & kalap checkout',
    icon: 'Flame',
    color: 'amber',
    description: 'Fokus memicu rasa lapar seketika melalui deskripsi lelehan kuah dan bumbu, dipadu penawaran terbatas atau diskon borong.',
  },
  {
    value: 'cerita-rasa',
    label: 'Cerita Rasa & Nostalgia',
    tagline: 'Hangat, menyentuh hati & memori kehangatan masakan rumah',
    icon: 'BookOpen',
    color: 'sky',
    description: 'Membangun kedekatan emosional lewat cerita aroma dapur, kenangan masa kecil, dan bahan baku lokal segar pilihan.',
  },
] as const;

export const PLATFORM_OPTIONS = [
  {
    value: 'instagram',
    label: 'Instagram Kuliner',
    badge: 'IG Reels & Feed',
    icon: 'Instagram',
    focus: 'Hook visual menggoda di kalimat pertama, deskripsi tekstur & rasa bikin ngiler, jarak paragraf rapi, hashtag kuliner tertarget.',
  },
  {
    value: 'tiktok',
    label: 'TikTok Food & ASMR',
    badge: 'TikTok ASMR & Mukbang',
    icon: 'Video',
    focus: 'Hook 0-3 detik suara kriuk/lelehan saus, skrip video bikin ngiler, instruksi audio visual, dan call-to-action keranjang kuning.',
  },
  {
    value: 'whatsapp',
    label: 'WhatsApp Menu & Status',
    badge: 'Broadcast & Order WA',
    icon: 'MessageCircle',
    focus: 'Format pesan siap forward, menu harian, info PO/ready stock, rincian cara pesan cepat, dan penawaran ramah pelanggan.',
  },
  {
    value: 'marketplace',
    label: 'Food App & Marketplace',
    badge: 'ShopeeFood / Gofood / Olshop',
    icon: 'ShoppingBag',
    focus: 'Deskripsi menu menggugah selera untuk etalase, rincian porsi/level pedas, ketahanan simpan/vakum, dan jaminan keamanan packing.',
  },
] as const;
