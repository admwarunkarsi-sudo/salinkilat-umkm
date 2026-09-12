import React, { useState, useEffect, useRef } from 'react';
import { ToneType, PlatformType, CopyRequest, CopyResult, PresetProduct } from './types';
import { UMKM_PRESETS } from './data/presets';
import { Header } from './components/Header';
import { PresetSelector } from './components/PresetSelector';
import { CopywriterForm } from './components/CopywriterForm';
import { ResultCard } from './components/ResultCard';
import { HistoryDrawer } from './components/HistoryDrawer';
import { Sparkles, ShieldCheck, Zap, HeartHandshake, AlertCircle, RotateCcw, X } from 'lucide-react';

const STORAGE_KEY = 'salinkilat_umkm_history_v1';

export default function App() {
  // Form states
  const [productName, setProductName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [tone, setTone] = useState<ToneType>('hard-selling');
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
      const saved = localStorage.getItem(STORAGE_KEY);
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
      const updated = [newResult, ...prev.filter((item) => item.id !== newResult.id)].slice(0, 20);
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

  // Generate copywriting request with timeout and error resilience
  const handleGenerate = async (request: CopyRequest) => {
    if (isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);
    lastRequestRef.current = request;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000);

    try {
      const response = await fetch('/api/generate-copy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let data: any = null;
      try {
        data = await response.json();
      } catch (parseErr) {
        throw new Error('Gagal memproses data balasan server. Format respons tidak sesuai.');
      }

      if (!response.ok) {
        const errMsg = data && typeof data.error === 'string' ? data.error : 'Gagal menghubungi server generator.';
        throw new Error(errMsg);
      }

      if (!data || typeof data.caption !== 'string' || !data.caption.trim()) {
        throw new Error('Server mengembalikan hasil kosong. Silakan coba kembali.');
      }

      const result = data as CopyResult;
      setCurrentResult(result);
      saveToHistory(result);

      // Smooth scroll to result card on mobile and desktop
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error('Copy generation error:', err);

      if (err.name === 'AbortError') {
        setErrorMessage('Permintaan melebihi batas waktu (timeout). Silakan periksa koneksi internet Anda dan klik "Coba Lagi".');
      } else if (err.message && typeof err.message === 'string') {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Terjadi kendala jaringan saat membuat caption. Silakan klik tombol "Coba Lagi".');
      }
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-200 selection:text-emerald-900">
      {/* App Header */}
      <Header
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-5 space-y-5">
        {/* Intro Micro-Banner */}
        <div className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 rounded-2xl p-4 sm:p-5 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/15 text-emerald-200 text-xs font-semibold mb-2">
              <Zap className="w-3.5 h-3.5 text-amber-300" />
              <span>Khusus Pelaku Usaha & UMKM Indonesia</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white leading-snug">
              Bikin Teks Jualan Persuasif yang Siap Meningkatkan Orderan Anda
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 leading-relaxed">
              Tinggal isi nama dan keunggulan produk. AI Senior Copywriter akan meracik caption Instagram, deskripsi Marketplace, atau skrip TikTok viral Anda.
            </p>
          </div>
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
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
                <p className="text-rose-700 leading-relaxed">{errorMessage}</p>
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
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Hasil Copywriting Siap Pakai:
                </h3>
                <span className="text-[11px] text-slate-400">
                  Formula Teruji • Bahasa Indonesia Natural
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

        {/* Mini Guide / Keunggulan Formula untuk UMKM */}
        <div className="mt-8 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Mengapa Copywriting SalinKilat Efektif Menjual?
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-600">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-bold text-slate-900 block mb-0.5">
                🎯 Stop-Scrolling Hook
              </span>
              Kalimat pertama dirancang khusus agar jempol audiens langsung berhenti scroll di detik pertama.
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-bold text-slate-900 block mb-0.5">
                💡 Formula AIDA & PAS
              </span>
              Bukan sekadar kata-kata manis, tapi terstruktur dari Attention, Interest, Desire, hingga Call to Action tegas.
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-bold text-slate-900 block mb-0.5">
                🇮🇩 Bahasa Indonesia Lokal
              </span>
              Menggunakan gaya bahasa pasar Indonesia yang luwes, akrab, dan relevan dengan segmen target UMKM.
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-bold text-slate-900 block mb-0.5">
                ⚡ Tombol Salin Instan
              </span>
              1 klik langsung tersalin ke clipboard tanpa perlu blok teks secara manual di layar handphone.
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-5 px-4 text-center text-xs text-slate-400 mt-8">
        <p className="font-medium text-slate-500">
          SalinKilat UMKM • AI Copywriting Assistant untuk Pengusaha Lokal
        </p>
        <p className="text-[11px] text-slate-400 mt-1">
          Dibuat khusus untuk kenyamanan mobile browsing pelaku UMKM Indonesia.
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
