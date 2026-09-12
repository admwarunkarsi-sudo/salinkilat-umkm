import React from 'react';
import { CopyResult } from '../types';
import { Copy, Check, Trash2, X, Clock, ShoppingBag, Instagram, Video } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: CopyResult[];
  onSelectResult: (item: CopyResult) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onSelectResult,
  onClearHistory,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = async (e: React.MouseEvent, item: CopyResult) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(item.caption);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram':
        return <Instagram className="w-3.5 h-3.5 text-pink-600" />;
      case 'marketplace':
        return <ShoppingBag className="w-3.5 h-3.5 text-orange-600" />;
      case 'tiktok':
        return <Video className="w-3.5 h-3.5 text-sky-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">Riwayat Caption UMKM</h2>
            <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-semibold">
              {history.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                type="button"
                onClick={onClearHistory}
                className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1 rounded hover:bg-rose-50"
              >
                Hapus Semua
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {history.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium text-slate-600">Belum ada riwayat caption</p>
              <p className="text-xs text-slate-400 mt-1">
                Hasil copywriting yang Anda generate akan otomatis tersimpan di sini.
              </p>
            </div>
          ) : (
            history.map((item) => {
              const isCopied = copiedId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onSelectResult(item);
                    onClose();
                  }}
                  className="p-3.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/20 cursor-pointer transition-all text-left group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      {getPlatformIcon(item.platform)}
                      <span className="font-bold text-xs text-slate-900 truncate max-w-[200px]">
                        {item.productName}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-2">
                    {item.caption}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                      Formula {item.formula}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => handleCopy(e, item)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 px-2 py-0.5 rounded hover:bg-emerald-100/60"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-700" />
                          <span>Disalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Salin Cepat</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
