import React, { useState } from 'react';
import { CopyResult, ToneType, PlatformType } from '../types';
import {
  Copy,
  Check,
  Clock,
  Lightbulb,
  Hash,
  Instagram,
  ShoppingBag,
  Video,
  MessageCircle,
  Edit3,
  CheckCircle2,
  RotateCcw,
  UtensilsCrossed,
  Share2
} from 'lucide-react';

interface ResultCardProps {
  result: CopyResult;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  result,
  onRegenerate,
  isRegenerating,
}) => {
  const [copied, setCopied] = useState(false);
  const [copiedHook, setCopiedHook] = useState(false);
  const [copiedHashtags, setCopiedHashtags] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedCaption, setEditedCaption] = useState(result.caption);
  const [activeTab, setActiveTab] = useState<'text' | 'formula' | 'tips'>('text');

  // Keep editedCaption in sync when result changes
  React.useEffect(() => {
    setEditedCaption(result.caption);
    setCopied(false);
    setIsEditing(false);
  }, [result]);

  const copyToClipboard = async (text: string, type: 'full' | 'hook' | 'hashtags') => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      if (type === 'full') {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      } else if (type === 'hook') {
        setCopiedHook(true);
        setTimeout(() => setCopiedHook(false), 2000);
      } else if (type === 'hashtags') {
        setCopiedHashtags(true);
        setTimeout(() => setCopiedHashtags(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const getPlatformLabel = (p: PlatformType) => {
    switch (p) {
      case 'instagram':
        return { label: 'Instagram Kuliner', icon: <Instagram className="w-3.5 h-3.5 text-pink-600" />, badge: 'IG Reels & Feed' };
      case 'marketplace':
        return { label: 'Food App & Marketplace', icon: <ShoppingBag className="w-3.5 h-3.5 text-orange-600" />, badge: 'ShopeeFood / GrabFood / Marketplace' };
      case 'tiktok':
        return { label: 'TikTok Food & ASMR', icon: <Video className="w-3.5 h-3.5 text-sky-600" />, badge: 'TikTok ASMR & Mukbang' };
      case 'whatsapp':
        return { label: 'WhatsApp Menu & Status', icon: <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />, badge: 'WhatsApp Broadcast' };
      default:
        return { label: 'Instagram Kuliner', icon: <Instagram className="w-3.5 h-3.5 text-pink-600" />, badge: 'IG Reels & Feed' };
    }
  };

  const getToneLabel = (t: ToneType) => {
    switch (t) {
      case 'emak-emak':
        return 'Emak-Emak Friendly';
      case 'kuliner-genz':
      case 'humor-genz':
        return 'Kuliner Kekinian / Gen-Z';
      case 'tradisional-legendaris':
        return 'Pedagang Tradisional Legendaris';
      case 'lapar-mata':
      case 'hard-selling':
        return 'Lapar Mata & Promo Kilat';
      case 'cerita-rasa':
      case 'soft-selling':
        return 'Cerita Rasa & Nostalgia';
      default:
        return 'Sensori Rasa Kuliner';
    }
  };

  const platformInfo = getPlatformLabel(result.platform);

  return (
    <div id="result-card-container" className="bg-white rounded-2xl border-2 border-amber-500/70 shadow-lg shadow-amber-600/5 overflow-hidden transition-all">
      {/* Result Card Header */}
      <div className="bg-gradient-to-r from-amber-50 via-orange-50/60 to-slate-50 px-4 py-3 border-b border-amber-200/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-amber-200 text-xs font-semibold text-slate-800 shadow-xs">
            {platformInfo.icon}
            <span>{platformInfo.badge}</span>
          </span>
          <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-900 font-medium text-[11px] border border-orange-200/60">
            {getToneLabel(result.tone)}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-bold text-[11px] uppercase tracking-wider border border-amber-200/70">
            Formula {result.formula}
          </span>
        </div>
      </div>

      <div className="p-4 sm:p-5 space-y-4">
        {/* Hook Highlight Banner */}
        {result.hook && (
          <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-950 flex items-center gap-1">
                🤤 Hook Pemicu Lapar Mata (Stop-Scrolling):
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(result.hook, 'hook')}
                className="text-[11px] font-semibold text-amber-900 hover:text-amber-950 flex items-center gap-1 px-2 py-0.5 rounded bg-amber-200/70 hover:bg-amber-200 transition-colors"
              >
                {copiedHook ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-700" />
                    <span>Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Salin Hook</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs sm:text-sm font-semibold text-slate-900 italic leading-relaxed">
              "{result.hook}"
            </p>
          </div>
        )}

        {/* View Switcher Tabs */}
        <div className="flex items-center border-b border-slate-200 gap-1 pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('text')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'text'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Teks Caption Makanan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('formula')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'formula'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Bedah Sensori ({result.formula})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tips')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === 'tips'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Waktu Posting & Tips Foto/Video
          </button>
        </div>

        {/* Tab 1: Caption Text (View / Edit) */}
        {activeTab === 'text' && (
          <div className="space-y-3">
            <div className="relative">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                <span className="font-medium">
                  {editedCaption.length} karakter • perkiraan {Math.max(1, Math.round(editedCaption.split(' ').length / 150))} mnt baca
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="inline-flex items-center gap-1 font-semibold text-orange-700 hover:text-orange-800"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditing ? 'Selesai Edit' : 'Edit Teks'}</span>
                </button>
              </div>

              {isEditing ? (
                <textarea
                  id="textarea-caption-edit"
                  rows={10}
                  value={editedCaption}
                  onChange={(e) => setEditedCaption(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border-2 border-amber-500 rounded-xl text-sm font-normal text-slate-900 leading-relaxed focus:bg-white focus:outline-none shadow-inner resize-y font-mono"
                />
              ) : (
                <div
                  id="rendered-caption-preview"
                  className="p-4 bg-slate-50/95 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-wrap select-text font-sans max-h-[380px] overflow-y-auto"
                >
                  {editedCaption}
                </div>
              )}
            </div>

            {/* Hashtag Quick-Copy Badges */}
            {result.hashtags && result.hashtags.length > 0 && (
              <div className="pt-1">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                    <Hash className="w-3.5 h-3.5 text-slate-400" />
                    Hashtag Kuliner ({result.hashtags.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(result.hashtags.join(' '), 'hashtags')}
                    className="text-[11px] font-semibold text-orange-700 hover:text-orange-800"
                  >
                    {copiedHashtags ? 'Hashtag Disalin!' : 'Salin Hashtag Saja'}
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {result.hashtags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 bg-amber-50 text-amber-900 border border-amber-200/60 rounded-md text-[11px] font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Formula Breakdown */}
        {activeTab === 'formula' && (
          <div className="space-y-2.5">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700 block mb-0.5">
                {result.formula === 'PAS' ? '1. Problem (Keresahan Konsumen / Lapar Mata)' : '1. Attention (Mencuri Perhatian Visual)'}
              </span>
              <p className="text-xs text-slate-700 leading-normal">
                {result.formulaBreakdown.attentionOrProblem}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700 block mb-0.5">
                {result.formula === 'PAS' ? '2. Agitation (Membangkitkan Nafsu Makan)' : '2. Interest (Membangun Selera Konsumen)'}
              </span>
              <p className="text-xs text-slate-700 leading-normal">
                {result.formulaBreakdown.interestOrAgitation}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700 block mb-0.5">
                {result.formula === 'PAS' ? '3. Solution (Sensori Rasa & Kelezatan Menu)' : '3. Desire (Pemuas Selera Gurih/Lumer)'}
              </span>
              <p className="text-xs text-slate-700 leading-normal">
                {result.formulaBreakdown.desireOrSolution}
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700 block mb-0.5">
                4. Action (Pesan Sekarang / Checkout Keranjang)
              </span>
              <p className="text-xs text-slate-700 leading-normal">
                {result.formulaBreakdown.action}
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Waktu Posting & Tips Kuliner */}
        {activeTab === 'tips' && (
          <div className="space-y-3">
            <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950 mb-1">
                <Clock className="w-4 h-4 text-amber-700" />
                <span>Waktu Posting Terbaik untuk Kuliner</span>
              </div>
              <p className="text-xs text-amber-900 leading-relaxed font-medium">
                {result.bestPostingTime}
              </p>
              <p className="text-[11px] text-amber-800/80 mt-1">
                💡 Trik: Posting tepat 30-60 menit sebelum jam makan siang atau jam ngemil sore saat rasa lapar audiens mencapai puncaknya.
              </p>
            </div>

            <div className="p-3.5 bg-orange-50/80 border border-orange-200 rounded-xl">
              <div className="flex items-center gap-1.5 text-xs font-bold text-orange-950 mb-1">
                <Lightbulb className="w-4 h-4 text-orange-700" />
                <span>Tips Visual & Foto Kuliner</span>
              </div>
              <p className="text-xs text-orange-950 leading-relaxed">
                {result.proTip}
              </p>
            </div>
          </div>
        )}

        {/* Big Copy Action Button */}
        <div className="pt-2">
          <button
            id="btn-salin-teks-besar"
            type="button"
            onClick={() => copyToClipboard(editedCaption, 'full')}
            className={`w-full py-4 px-6 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-md min-h-[52px] ${
              copied
                ? 'bg-emerald-600 text-white ring-4 ring-emerald-300/50 scale-[1.01]'
                : 'bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 hover:from-orange-700 hover:to-amber-700 text-white shadow-orange-600/25 active:scale-[0.99]'
            }`}
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-6 h-6 text-white animate-bounce shrink-0" />
                <span>✅ Berhasil Disalin! Langsung Tempel ke WhatsApp / Medsos</span>
              </>
            ) : (
              <>
                <Copy className="w-5 h-5 text-white shrink-0" />
                <span>Salin Teks Lengkap (Copy to Clipboard)</span>
              </>
            )}
          </button>
        </div>

        {/* Secondary Action: Regenerate */}
        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            id="btn-regenerate-copy"
            type="button"
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-orange-700 py-1.5 px-3 rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
            <span>{isRegenerating ? 'Meracik Variasi Baru...' : 'Racik Variasi Rasa Lain'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
