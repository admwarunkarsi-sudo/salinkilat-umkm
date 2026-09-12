import React from 'react';
import { Sparkles, History, ShoppingBag } from 'lucide-react';

interface HeaderProps {
  historyCount: number;
  onOpenHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({ historyCount, onOpenHistory }) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 py-3 shadow-xs">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-600/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold tracking-tight text-slate-900 leading-tight">
                SalinKilat<span className="text-emerald-600"> UMKM</span>
              </h1>
              <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 rounded-md">
                AI Copywriter
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-none mt-0.5">
              Bikin caption jualan laris dalam hitungan detik
            </p>
          </div>
        </div>

        <button
          id="btn-header-history"
          type="button"
          onClick={onOpenHistory}
          className="relative inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-lg transition-colors"
          title="Lihat riwayat copy tersimpan"
        >
          <History className="w-4 h-4 text-slate-600" />
          <span className="hidden xs:inline">Riwayat</span>
          {historyCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-emerald-600 rounded-full">
              {historyCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};
