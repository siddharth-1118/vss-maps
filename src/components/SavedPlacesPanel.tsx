import React, { useState } from 'react';
import {
  Bookmark,
  MapPin,
  Trash2,
  Edit2,
  Download,
  Search,
  ExternalLink,
  Briefcase,
  Home,
  Utensils,
  Camera,
  Star,
} from './Icons';
import type { SavedMarker, MarkerCategory } from '../types/map';

interface SavedPlacesPanelProps {
  markers: SavedMarker[];
  onFlyToMarker: (marker: SavedMarker) => void;
  onEditMarker: (marker: SavedMarker) => void;
  onDeleteMarker: (id: string) => void;
  onExportMarkers: () => void;
}

const CATEGORY_META: Record<MarkerCategory, { icon: React.ReactNode; emoji: string; color: string }> = {
  favorite: { icon: <Star className="w-3.5 h-3.5" />, emoji: '⭐', color: 'text-yellow-400' },
  home: { icon: <Home className="w-3.5 h-3.5" />, emoji: '🏠', color: 'text-emerald-400' },
  work: { icon: <Briefcase className="w-3.5 h-3.5" />, emoji: '💼', color: 'text-blue-400' },
  restaurant: { icon: <Utensils className="w-3.5 h-3.5" />, emoji: '🍽️', color: 'text-amber-400' },
  attraction: { icon: <Camera className="w-3.5 h-3.5" />, emoji: '📸', color: 'text-violet-400' },
  custom: { icon: <MapPin className="w-3.5 h-3.5" />, emoji: '📌', color: 'text-rose-400' },
};

export const SavedPlacesPanel: React.FC<SavedPlacesPanelProps> = ({
  markers,
  onFlyToMarker,
  onEditMarker,
  onDeleteMarker,
  onExportMarkers,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const FILTER_OPTIONS = ['all', 'favorite', 'home', 'work', 'restaurant', 'attraction', 'custom'];

  const filtered = markers.filter((m) => {
    const matchesCategory = filterCategory === 'all' || m.category === filterCategory;
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.description && m.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="p-4 space-y-4 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.04]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-yellow-500/20 to-amber-500/20 flex items-center justify-center">
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white">Saved Places</h2>
            <p className="text-[10px] text-slate-500">{markers.length} pin{markers.length !== 1 ? 's' : ''} saved</p>
          </div>
        </div>
        {markers.length > 0 && (
          <button
            onClick={onExportMarkers}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-semibold text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20 transition-all"
          >
            <Download className="w-3 h-3" />
            Export GeoJSON
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search your saved places..."
          className="w-full pl-8 pr-3 py-2 rounded-xl input-premium text-xs"
        />
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        {FILTER_OPTIONS.map((cat) => {
          const meta = cat !== 'all' ? CATEGORY_META[cat as MarkerCategory] : null;
          return (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold capitalize whitespace-nowrap transition-all border ${
                filterCategory === cat
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  : 'bg-white/[0.03] text-slate-500 border-white/[0.05] hover:text-slate-300 hover:border-white/[0.09]'
              }`}
            >
              {meta?.emoji && <span>{meta.emoji}</span>}
              {cat}
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="space-y-2 max-h-[calc(100vh-310px)] overflow-y-auto pr-0.5">
        {filtered.length === 0 ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-amber-400/60" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400">No places yet</p>
              <p className="text-[11px] text-slate-600 mt-1">Click anywhere on the map to drop a custom pin</p>
            </div>
          </div>
        ) : (
          filtered.map((item, idx) => {
            const meta = CATEGORY_META[item.category] || CATEGORY_META.custom;
            return (
              <div
                key={item.id}
                className="glass-card rounded-2xl p-3 space-y-2 hover:border-white/[0.1] transition-all"
                style={{ animationDelay: `${idx * 30}ms` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-base"
                      style={{ backgroundColor: `${item.color || '#3b82f6'}15` }}
                    >
                      {meta.emoji}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-bold text-white line-clamp-1">{item.name}</h3>
                      <span className="text-[10px] text-slate-600 font-mono">
                        {item.lat.toFixed(4)}, {item.lng.toFixed(4)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      onClick={() => onFlyToMarker(item)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                      title="View on map"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onEditMarker(item)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                      title="Edit"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onDeleteMarker(item.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                      title="Delete"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {item.description && (
                  <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed pl-10">
                    {item.description}
                  </p>
                )}

                {/* Color dot indicator */}
                <div className="flex items-center gap-1.5 pl-10">
                  <div
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: item.color || '#3b82f6', boxShadow: `0 0 6px ${item.color || '#3b82f6'}80` }}
                  />
                  <span className="text-[9px] text-slate-600 capitalize font-medium">{item.category}</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
