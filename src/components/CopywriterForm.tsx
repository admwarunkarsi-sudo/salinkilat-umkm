import React, { useState } from 'react';
import { ToneType, PlatformType, CopyRequest } from '../types';
import { TONE_OPTIONS, PLATFORM_OPTIONS } from '../data/presets';
import { formatErrorMessage } from '../lib/formatError';
import {
  Sparkles,
  Flame,
  BookOpen,
  CookingPot,
  HeartHandshake,
  Instagram,
  ShoppingBag,
  Video,
  MessageCircle,
  AlertCircle,
  Tag,
  Loader2,
  HelpCircle,
  UtensilsCrossed
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
      setValidationError('Silakan masukkan nama menu atau produk kuliner Anda.');
      return;
    }
    if (trimmedName.length < 2) {
      setValidationError('Nama menu minimal 2 karakter.');
      return;
    }
    if (!trimmedDesc || trimmedDesc.length < 8) {
      setValidationError('Deskripsi rasa/bahan minimal 8 karakter agar AI bisa meracik kata sensori yang menggugah selera.');
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
        return <BookOpen className="w-4 h-4 text-sky-500 shrink-0" />;
      case 'CookingPot':
        return <CookingPot className="w-4 h-4 text-emerald-600 shrink-0" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-purple-500 shrink-0" />;
      default:
        return <UtensilsCrossed className="w-4 h-4 text-orange-500 shrink-0" />;
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
      case 'MessageCircle':
        return <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />;
      default:
        return <UtensilsCrossed className="w-4 h-4 text-orange-600 shrink-0" />;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Platform Selector */}
      <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
            1. Target Platform Jualan Kuliner
          </label>
          <span className="text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
            Pilih Tempat Jualan
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {PLATFORM_OPTIONS.map((plat) => {
            const isSelected = platform === plat.value;
            return (
              <button
                id={`platform-select-${plat.value}`}
                key={plat.value}
                type="button"
                onClick={() => setPlatform(plat.value)}
                className={`relative flex items-start p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-amber-50/90 border-amber-500 text-amber-950 ring-2 ring-amber-500/20 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-slate-100/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-2.5 w-full">
                  <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${isSelected ? 'bg-white shadow-xs' : 'bg-slate-200/70'}`}>
                    {getPlatformIcon(plat.icon)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                        {plat.label}
                      </span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0" />
                      )}
                    </div>
                    <span className="inline-block text-[10px] font-medium text-amber-800 bg-amber-100/70 px-1.5 py-0.2 rounded mt-0.5">
                      {plat.badge}
                    </span>
                    <p className="text-[11px] text-slate-500 leading-snug line-clamp-2 mt-1">
                      {plat.focus}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Culinary Product Information Inputs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <label htmlFor="input-product-name" className="block text-xs font-bold uppercase tracking-wider text-slate-600">
            2. Detail Menu / Makanan
          </label>
          <span className="text-[11px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-md">
            Wajib Diisi
          </span>
        </div>

        <div>
          <label htmlFor="input-product-name" className="block text-xs font-semibold text-slate-800 mb-1">
            Nama Menu / Produk Kuliner
          </label>
          <input
            id="input-product-name"
            type="text"
            value={productName}
            onChange={(e) => {
              setProductName(e.target.value);
              if (validationError) setValidationError(null);
            }}
            placeholder="Contoh: Sambal Cumi Asin Mercon, Dimsum Mentai Bakar, Brownies Fudgy Lumer"
            maxLength={120}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="input-product-desc" className="block text-xs font-semibold text-slate-800">
              Deskripsi Kelezatan, Rasa, Rempah & Tekstur
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
            placeholder="Contoh: Pedas nampol rempah berlimpah, cumi segar kenyal gak alot, minyak bawang gurih wangi semerbak, tanpa pengawet, tahan 3 bulan di suhu ruang..."
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all resize-y min-h-[88px]"
          />
          <p className="text-[11px] text-amber-800/80 mt-1 flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-amber-600 shrink-0" />
            Tips: Sebutkan sensasi rasa (gurih, pedas, renyah, lumer, aroma rempah) agar copywriting makin menggugah selera!
          </p>
        </div>

        {/* Optional Promo or Serving note toggle */}
        <div>
          {!showPromoField ? (
            <button
              id="btn-toggle-promo"
              type="button"
              onClick={() => setShowPromoField(true)}
              className="inline-flex items-center gap-1 text-xs font-medium text-orange-700 hover:text-orange-800 py-1"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>+ Tambah Info Promo / Cara Saji / Area Pengiriman (Opsional)</span>
            </button>
          ) : (
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="input-promo-notes" className="block text-xs font-semibold text-slate-700">
                  Info Tambahan (Promo Diskon, Kemasan Vakum, Free Ongkir, dll.)
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
                placeholder="Contoh: Beli 2 Gratis Sambal Teri, Siap kirim vakum se-Indonesia, Cocok disantap nasi hangat"
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
              />
            </div>
          )}
        </div>
      </div>

      {/* Tone of Voice Selector */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
            3. Pilihan Tone of Voice (Karakter Penjual Kuliner)
          </label>
          <span className="text-[11px] text-slate-500">Sesuaikan dengan Persona</span>
        </div>
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
                    ? 'bg-orange-50/90 border-orange-500 ring-2 ring-orange-500/20 shadow-xs'
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
                    <span className="w-2 h-2 rounded-full bg-orange-600 shrink-0" />
                  )}
                </div>
                <p className="text-[11px] text-slate-600 pl-8 leading-snug">
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

      {/* Main Submit Button (Culinary Warm Gradient) */}
      <div className="pt-2">
        <button
          id="btn-buat-caption"
          type="submit"
          disabled={isLoading}
          className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-orange-600/25 hover:shadow-orange-600/35 hover:brightness-105 active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none transition-all flex items-center justify-center gap-2 min-h-[50px]"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Meracik Copywriting Bikin Ngiler...</span>
            </>
          ) : (
            <>
              <UtensilsCrossed className="w-5 h-5" />
              <span>Racik Copywriting Makanan Sekarang 🌶️</span>
            </>
          )}
        </button>
        <p className="text-center text-[11px] text-slate-500 mt-2">
          🔥 Otomatis dioptimalkan dengan kata sensori rasa, aroma rempah, dan formula lapar mata
        </p>
      </div>
    </form>
  );
};
