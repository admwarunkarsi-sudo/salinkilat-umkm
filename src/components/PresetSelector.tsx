import React from 'react';
import { UMKM_PRESETS } from '../data/presets';
import { PresetProduct } from '../types';
import { Sparkles } from 'lucide-react';

interface PresetSelectorProps {
  onSelectPreset: (preset: PresetProduct) => void;
  selectedPresetId?: string;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  onSelectPreset,
  selectedPresetId,
}) => {
  return (
    <div className="mb-5">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Coba Contoh Cepat Produk UMKM:
        </span>
        <span className="text-[11px] text-slate-400">1-Klik Langsung Isi</span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin no-scrollbar">
        {UMKM_PRESETS.map((preset) => {
          const isSelected = selectedPresetId === preset.id;
          return (
            <button
              id={`preset-btn-${preset.id}`}
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset)}
              className={`shrink-0 text-left px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-900 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50 shadow-xs'
              }`}
            >
              <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                <span>{preset.badge}</span>
              </div>
              <div className="text-[11px] text-slate-500 truncate max-w-[150px] mt-0.5">
                {preset.name}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
