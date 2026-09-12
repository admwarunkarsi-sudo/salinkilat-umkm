import React, { useState } from 'react';
import { ToneType, PlatformType, CopyRequest } from '../types';
import { TONE_OPTIONS, PLATFORM_OPTIONS } from '../data/presets';
import { formatErrorMessage } from '../lib/formatError';
import {
  Sparkles,
  Flame,
  BookOpen,
  Smile,
  HeartHandshake,
  Instagram,
  ShoppingBag,
  Video,
  AlertCircle,
  Tag,
  Loader2,
  HelpCircle
} from 'lucide-react';

interface CopywriterFormProps {
  onSubmit: (request: CopyRequest) => void;
  isLoading: boolean;
  productName: string;
  setProductName: (val: string) => void;
  productDescription: string;
  setProductDescription: (val: string) => void;
  tone: ToneType;
  setTone: (val: ToneType) => void;
  platform: PlatformType;
  setPlatform: (val: PlatformType) => void;
  additionalNotes: string;
  setAdditionalNotes: (val: string) => void;
}

export const CopywriterForm: React.FC<CopywriterFormProps> = ({
  onSubmit,
  isLoading,
  productName,
  setProductName,
  productDescription,
  setProductDescription,
  tone,
  setTone,
  platform,
  setPlatform,
  additionalNotes,
  setAdditionalNotes,
}) => {
  const [showPromoField, setShowPromoField] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const trimmedName = productName.trim();
    const trimmedDesc = productDescription.trim();

    if (!trimmedName) {
      setValidationError('Silakan masukkan nama produk Anda.');
      return;
    }
    if (trimmedName.length < 2) {
      setValidationError('Nama produk minimal 2 karakter.');
      return;
    }
    if (!trimmedDesc || trimmedDesc.length < 8) {
      setValidationError('Deskripsi/keunggulan produk minimal 8 karakter agar AI bisa meracik copy yang akurat.');
      return;
    }

    setValidationError(null);
    onSubmit({
      productName: trimmedName.slice(0, 120),
      productDescription: trimmedDesc.slice(0, 1500),
      tone,
      platform,
      additionalNotes: additionalNotes.trim() ? additionalNotes.trim().slice(0, 250) : undefined,
    });
  };

  const getToneIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame':
        return <Flame className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'BookOpen':
        return <BookOpen className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'Smile':
        return <Smile className="w-4 h-4 text-purple-500 shrink-0" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-4 h-4 text-rose-500 shrink-0" />;
      default:
        return <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />;
    }
  };

  const getPlatformIcon = (iconName: string) => {
    switch (iconName) {
      case 'Instagram':
        return <Instagram className="w-4 h-4 text-pink-600 shrink-0" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-4 h-4 text-orange-600 shrink-0" />;
      case 'Video':
        return <Video className="w-4 h-4 text-sky-600 shrink-0" />;
      default:
        return <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Platform Selector */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
          1. Pilih Platform Target
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {PLATFORM_OPTIONS.map((plat) => {
            const isSelected = platform === plat.value;
            return (
              <button
                id={`platform-select-${plat.value}`}
                key={plat.value}
                type="button"
                onClick={() => setPlatform(plat.value)}
                className={`relative flex items-center sm:flex-col sm:items-start p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-emerald-50/80 border-emerald-500 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2 mb-1 w-full">
                  <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-white shadow-xs' : 'bg-slate-200/70'}`}>
                    {getPlatformIcon(plat.icon)}
                  </div>
                  <span className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                    {plat.badge}
                  </span>
                </div>
                <p className="hidden sm:block text-[11px] text-slate-500 leading-normal line-clamp-2 mt-1">
                  {plat.focus}
                </p>
                {isSelected && (
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-600" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Information Inputs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <label htmlFor="input-product-name" className="block text-xs font-bold uppercase tracking-wider text-slate-500">
            2. Informasi Produk UMKM
          </label>
          <span className="text-[11px] text-slate-400">Wajib diisi</span>
        </div>

        <div>
          <label htmlFor="input-product-name" className="block text-xs font-semibold text-slate-800 mb-1">
            Nama Produk
          </label>
          <input
            id="input-product-name"
            type="text"
            value={productName}
            onChange={(e) => {
              setProductName(e.target.value);
              if (validationError) setValidationError(null);
            }}
            placeholder="Contoh: Keripik Singkong Balado Daun Jeruk 200gr"
            maxLength={120}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="input-product-desc" className="block text-xs font-semibold text-slate-800">
              Deskripsi Singkat, Bahan, atau Keunggulan
            </label>
            <span className="text-[11px] text-slate-400">
              {productDescription.length} / 1500 karakter
            </span>
          </div>
          <textarea
            id="input-product-desc"
            rows={3}
            maxLength={1500}
            value={productDescription}
            onChange={(e) => {
              setProductDescription(e.target.value);
              if (validationError) setValidationError(null);
            }}
            placeholder="Contoh: Bahan singkong pilihan renyah tipis, bumbu balado asli cabai merah segar, tanpa pengawet, kemasan ziplock pouch 200gr, sertifikasi Halal & P-IRT..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all resize-y min-h-[84px]"
          />
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-slate-400 shrink-0" />
            Tips: Makin jelas keunggulannya, makin memikat hasil caption-nya!
          </p>
        </div>

        {/* Optional Promo or CTA note toggle */}
        <div>
          {!showPromoField ? (
            <button
              id="btn-toggle-promo"
              type="button"
              onClick={() => setShowPromoField(true)}
              className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800 py-1"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>+ Tambah Info Promo / Diskon / Catatan (Opsional)</span>
            </button>
          ) : (
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="input-promo-notes" className="block text-xs font-semibold text-slate-700">
                  Info Promo / Batas Waktu / Gratis Ongkir (Opsional)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setAdditionalNotes('');
                    setShowPromoField(false);
                  }}
                  className="text-[11px] text-slate-400 hover:text-slate-600"
                >
                  Tutup
                </button>
              </div>
              <input
                id="input-promo-notes"
                type="text"
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Contoh: Diskon 20% minggu ini, Beli 2 Gratis 1, Gratis ongkir se-Jawa"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all"
              />
            </div>
          )}
        </div>
      </div>

      {/* Tone of Voice Selector */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
          3. Pilihan Tone of Voice (Gaya Bahasa)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {TONE_OPTIONS.map((item) => {
            const isSelected = tone === item.value;
            return (
              <button
                id={`tone-select-${item.value}`}
                key={item.value}
                type="button"
                onClick={() => setTone(item.value)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-emerald-50/90 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/70 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-white shadow-xs' : 'bg-slate-200/80'}`}>
                      {getToneIcon(item.icon)}
                    </div>
                    <span className="font-bold text-xs sm:text-sm text-slate-900">
                      {item.label}
                    </span>
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-slate-600 pl-8 leading-tight">
                  {item.tagline}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Error message if validation fails */}
      {validationError && (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-700">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{formatErrorMessage(validationError)}</span>
        </div>
      )}

      {/* Main Submit Button (Mobile-First, Large and Prominent) */}
      <div className="pt-2">
        <button
          id="btn-buat-caption"
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 hover:brightness-105 active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 min-h-[48px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Meracik Copywriting Menjual...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Buat Caption Sekarang</span>
            </>
          )}
        </button>
        <p className="text-center text-[11px] text-slate-400 mt-2">
          ⚡ Otomatis dioptimalkan dengan formula copywriting & hashtag Indonesia
        </p>
      </div>
    </form>
  );
};
