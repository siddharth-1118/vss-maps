import React from 'react';
import { Layers, Check, Globe, Moon, Mountain, Bus, Bike } from './Icons';
import type { MapLayerId } from '../types/map';
import { MAP_LAYERS } from '../constants/layers';

interface LayerSelectorProps {
  activeLayer: MapLayerId;
  onSelectLayer: (layerId: MapLayerId) => void;
}

const LAYER_META: Record<MapLayerId, { gradient: string; glow: string; emoji: string; desc: string }> = {
  osm: { gradient: 'from-emerald-500/20 to-teal-500/20', glow: 'border-emerald-500/30', emoji: '🗺️', desc: 'Standard street map' },
  satellite: { gradient: 'from-blue-500/20 to-cyan-500/20', glow: 'border-blue-500/30', emoji: '🛰️', desc: 'Aerial satellite imagery' },
  dark: { gradient: 'from-indigo-500/20 to-violet-500/20', glow: 'border-indigo-500/30', emoji: '🌑', desc: 'Dark minimalist base' },
  topo: { gradient: 'from-amber-500/20 to-yellow-500/20', glow: 'border-amber-500/30', emoji: '🏔️', desc: 'Topographic terrain' },
  transit: { gradient: 'from-rose-500/20 to-red-500/20', glow: 'border-rose-500/30', emoji: '🚌', desc: 'Bus & transit routes' },
  cyclosm: { gradient: 'from-lime-500/20 to-green-500/20', glow: 'border-lime-500/30', emoji: '🚲', desc: 'Cycling paths & routes' },
};

export const LayerSelector: React.FC<LayerSelectorProps> = ({ activeLayer, onSelectLayer }) => {
  return (
    <div className="p-4 space-y-4 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-white/[0.04]">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
          <Layers className="w-3.5 h-3.5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-xs font-bold text-white">Map Layers</h2>
          <p className="text-[10px] text-slate-500">All open-source · Zero API key</p>
        </div>
      </div>

      <div className="space-y-2">
        {Object.values(MAP_LAYERS).map((layer) => {
          const isSelected = activeLayer === layer.id;
          const meta = LAYER_META[layer.id as MapLayerId];

          return (
            <button
              key={layer.id}
              onClick={() => onSelectLayer(layer.id as MapLayerId)}
              className={`w-full p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                isSelected
                  ? `bg-gradient-to-br ${meta?.gradient} ${meta?.glow} shadow-lg`
                  : 'bg-white/[0.03] border-white/[0.05] hover:bg-white/[0.06] hover:border-white/[0.09]'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                isSelected ? 'bg-black/20' : 'bg-white/[0.05]'
              }`}>
                {meta?.emoji}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                  {layer.name}
                </p>
                <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-white/60' : 'text-slate-600'}`}>
                  {meta?.desc} · max {layer.maxZoom}×
                </p>
              </div>

              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-white/20 border border-white/30 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Info card */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/8 to-teal-500/8 border border-emerald-500/10">
        <p className="text-[10px] font-semibold text-emerald-400 tracking-wide uppercase mb-1">
          ✓ Zero API Key Required
        </p>
        <p className="text-[10px] text-slate-500 leading-relaxed">
          All layers use public tile servers with open attribution — no accounts, billing, or quotas ever.
        </p>
      </div>
    </div>
  );
};
