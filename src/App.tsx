import React, { useState, useEffect, useRef } from 'react';
import { ToneType, PlatformType, CopyRequest, CopyResult, PresetProduct } from './types';
import { UMKM_PRESETS } from './data/presets';
import { Header } from './components/Header';
import { PresetSelector } from './components/PresetSelector';
import { CopywriterForm } from './components/CopywriterForm';
import { ResultCard } from './components/ResultCard';
import { HistoryDrawer } from './components/HistoryDrawer';
import { UtensilsCrossed, ShieldCheck, Flame, AlertCircle, RotateCcw, X, HeartHandshake, Sparkles } from 'lucide-react';
import { formatErrorMessage } from './lib/formatError';
import { executeCopyGeneration } from './lib/clientGeminiService';

const STORAGE_KEY = 'salinkilat_kuliner_history_v2';

export default function App() {
  // Form states
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [tone, setTone] = useState<ToneType>('emak-emak');
  const [platform, setPlatform] = useState<PlatformType>('instagram');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState<string | undefined>();

  // Application execution states
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<CopyResult | null>(null);
  const [history, setHistory] = useState<CopyResult[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resultRef = useRef<HTMLDivElement>(null);
  const lastRequestRef = useRef<CopyRequest | null>(null);

  // Load history from localStorage on mount safely
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('salinkilat_umkm_history_v1');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        }
      }
    } catch (e) {
      console.warn('Could not read history from localStorage:', e);
    }
  }, []);

  // Save history to localStorage
  const saveToHistory = (newResult: CopyResult) => {
    if (!newResult || !newResult.caption) return;
    setHistory((prev) => {
      const updated = [newResult, ...prev.filter((item) => item.id !== newResult.id)].slice(0, 25);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save history to localStorage:', e);
      }
      return updated;
    });
  };

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem('salinkilat_umkm_history_v1');
    } catch (e) {
      console.warn(e);
    }
  };

  // Preset Selection handler
  const handleSelectPreset = (preset: PresetProduct) => {
    setSelectedPresetId(preset.id);
    setProductName(preset.name);
    setProductDescription(preset.description);
    setTone(preset.tone);
    setPlatform(preset.platform);
    setErrorMessage(null);
  };

  // Generate copywriting request with direct client-side Gemini execution and multi-tier resilience
  const handleGenerate = async (request: CopyRequest) => {
    if (isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);
    lastRequestRef.current = request;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      // Direct client-side invocation via process.env.GEMINI_API_KEY / import.meta.env.VITE_GEMINI_API_KEY,
      // with automatic secondary fallback to serverless API or intelligent culinary engine
      const result = await executeCopyGeneration(request, controller.signal);
      clearTimeout(timeoutId);

      setCurrentResult(result);
      saveToHistory(result);

      // Smooth scroll to result card on mobile screens
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } catch (err: any) {
      clearTimeout(timeoutId);

      const safeMessage = formatErrorMessage(
        err,
        'Terjadi kendala saat meracik copywriting makanan. Silakan klik tombol "Coba Lagi".'
      );
      setErrorMessage(safeMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Retry previous request
  const handleRetry = () => {
    if (lastRequestRef.current) {
      handleGenerate(lastRequestRef.current);
    }
  };

  // Regenerate with current inputs
  const handleRegenerate = () => {
    if (!productName || !productDescription) return;
    handleGenerate({
      productName,
      productDescription,
      tone,
      platform,
      additionalNotes: additionalNotes || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-amber-50/25 flex flex-col font-sans selection:bg-amber-200 selection:text-amber-950">
      {/* App Header */}
      <Header
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-5 space-y-5">
        {/* Intro Micro-Banner (Culinary Warm Theme) */}
        <div className="bg-gradient-to-br from-amber-700 via-orange-700 to-red-800 rounded-2xl p-4 sm:p-5 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-amber-200 text-xs font-semibold mb-2">
              <Flame className="w-3.5 h-3.5 text-amber-300" />
              <span>Khusus UMKM Kuliner & Bisnis Makanan Indonesia 🍜</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-snug">
              Racik Copywriting Makanan yang Bikin Ngiler & Melipatgandakan Pesanan
            </h2>
            <p className="text-xs sm:text-sm text-amber-100/90 mt-1 leading-relaxed">
              Tinggal isi nama menu dan sensasi rasanya. AI Food Copywriter akan menyusun deskripsi bumbu gurih, aroma rempah, dan kelaparan visual untuk Instagram, TikTok, WhatsApp, hingga Food Delivery.
            </p>
          </div>
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* 1-Tap Example Presets for Fast Testing */}
        <PresetSelector
          onSelectPreset={handleSelectPreset}
          selectedPresetId={selectedPresetId}
        />

        {/* Form Inputs */}
        <CopywriterForm
          onSubmit={handleGenerate}
          isLoading={isLoading}
          productName={productName}
          setProductName={(val) => {
            setProductName(val);
            setSelectedPresetId(undefined);
          }}
          productDescription={productDescription}
          setProductDescription={(val) => {
            setProductDescription(val);
            setSelectedPresetId(undefined);
          }}
          tone={tone}
          setTone={setTone}
          platform={platform}
          setPlatform={setPlatform}
          additionalNotes={additionalNotes}
          setAdditionalNotes={setAdditionalNotes}
        />

        {/* Error Alert with Retry Option */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-900 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold text-rose-950">Gagal Memproses Permintaan</p>
                <p className="text-rose-700 leading-relaxed">{formatErrorMessage(errorMessage)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              {lastRequestRef.current && (
                <button
                  type="button"
                  onClick={handleRetry}
                  disabled={isLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shadow-xs"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Coba Lagi</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setErrorMessage(null)}
                aria-label="Tutup pesan error"
                className="p-1 rounded-lg text-rose-500 hover:text-rose-800 hover:bg-rose-100/70 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Result Section */}
        <div ref={resultRef} className="scroll-mt-18">
          {currentResult && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <UtensilsCrossed className="w-4 h-4 text-orange-600" />
                  Hasil Copywriting Kuliner Siap Pakai:
                </h3>
                <span className="text-[11px] text-orange-800 font-medium bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/50">
                  Sensori Rasa • Bahasa Indonesia Natural
                </span>
              </div>

              <ResultCard
                result={currentResult}
                onRegenerate={handleRegenerate}
                isRegenerating={isLoading}
              />
            </div>
          )}
        </div>

        {/* Keunggulan Khusus Kuliner untuk UMKM */}
        <div className="mt-8 p-4 bg-white rounded-2xl border border-amber-200/80 shadow-xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-2.5 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-orange-600" />
            Mengapa Copywriting Khusus Kuliner Ini Lebih Efektif Menjual?
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-600">
            <div className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-100">
              <span className="font-bold text-slate-900 block mb-0.5">
                🌶️ Kosakata Sensori Rasa
              </span>
              Menggunakan kata-kata pemicu nafsu makan: gurih nendang, empuk lumer, pedas nampol, dan aroma rempah asli nusantara.
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-100">
              <span className="font-bold text-slate-900 block mb-0.5">
                🤤 Efek Kelaparan Visual
              </span>
              Deskripsi hook yang memancing air liur dan membuat pembaca membayangkan nikmatnya suapan nasi hangat bersama menu Anda.
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-100">
              <span className="font-bold text-slate-900 block mb-0.5">
                👥 Karakter Penjual Relevan
              </span>
              Pilihan tone Emak-Emak Friendly untuk lauk keluarga, Kuliner Kekinian/Gen-Z untuk tren viral, hingga Pedagang Tradisional beresep leluhur.
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-100">
              <span className="font-bold text-slate-900 block mb-0.5">
                ⚡ Siap Forward ke WhatsApp
              </span>
              Format pesan rapi yang siap langsung dikirim ke broadcast WhatsApp pelanggan, status harian, maupun caption media sosial.
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-amber-200/70 py-5 px-4 text-center text-xs text-slate-400 mt-8 bg-white/50">
        <p className="font-medium text-slate-600">
          SalinKilat UMKM • Generator Copywriting Spesialis Kuliner & Makanan Indonesia
        </p>
        <p className="text-[11px] text-slate-400 mt-1">
          Didedikasikan untuk memajukan usaha kuliner, warung makan, frozen food, dan jajanan UMKM nusantara.
        </p>
      </footer>

      {/* History Drawer Modal */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectResult={(item) => {
          setCurrentResult(item);
          setProductName(item.productName);
          setTone(item.tone);
          setPlatform(item.platform);
          setTimeout(() => {
            resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}
