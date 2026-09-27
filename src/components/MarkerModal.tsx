import React, { useState } from 'react';
import { X, MapPin, Tag, Palette, FileText, Check } from './Icons';
import type { SavedMarker, MarkerCategory } from '../types/map';

interface MarkerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (marker: SavedMarker) => void;
  initialData?: SavedMarker | null;
  lat: number;
  lng: number;
  defaultAddress?: string;
}

const CATEGORIES: { id: MarkerCategory; label: string; emoji: string; defaultColor: string }[] = [
  { id: 'favorite', label: 'Favorite', emoji: '⭐', defaultColor: '#eab308' },
  { id: 'home', label: 'Home', emoji: '🏠', defaultColor: '#10b981' },
  { id: 'work', label: 'Work', emoji: '💼', defaultColor: '#3b82f6' },
  { id: 'restaurant', label: 'Eat & Drink', emoji: '🍽️', defaultColor: '#f59e0b' },
  { id: 'attraction', label: 'Attraction', emoji: '📸', defaultColor: '#a855f7' },
  { id: 'custom', label: 'Custom', emoji: '📌', defaultColor: '#ef4444' },
];

const COLORS = ['#ef4444', '#f97316', '#eab308', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

export const MarkerModal: React.FC<MarkerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  lat,
  lng,
  defaultAddress,
}) => {
  const [name, setName] = React.useState('');
  const [category, setCategory] = React.useState<MarkerCategory>('favorite');
  const [color, setColor] = React.useState('#3b82f6');
  const [description, setDescription] = React.useState('');

  React.useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCategory(initialData.category);
      setColor(initialData.color || '#3b82f6');
      setDescription(initialData.description || '');
    } else {
      setName(defaultAddress?.split(',')[0] || `Pin at ${lat.toFixed(4)}, ${lng.toFixed(4)}`);
      setCategory('favorite');
      setColor('#3b82f6');
      setDescription('');
    }
  }, [initialData, lat, lng, defaultAddress, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newMarker: SavedMarker = {
      id: initialData ? initialData.id : `marker_${Date.now()}`,
      name: name.trim() || 'Untitled Location',
      lat,
      lng,
      category,
      color,
      description: description.trim(),
      createdAt: initialData ? initialData.createdAt : new Date().toISOString(),
      address: defaultAddress,
    };
    onSave(newMarker);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[500] p-4">
      <div
        className="glass border border-white/[0.08] rounded-3xl shadow-2xl shadow-black/60 max-w-md w-full overflow-hidden"
        style={{ animation: 'fadeInUp 0.25s ease-out forwards' }}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/[0.05] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg"
              style={{
                backgroundColor: `${color}20`,
                boxShadow: `0 0 20px ${color}30`,
                border: `1px solid ${color}30`,
              }}
            >
              <MapPin className="w-4.5 h-4.5" style={{ color }} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                {initialData ? 'Edit Place' : 'Save This Place'}
              </h2>
              <p className="text-[10px] text-slate-500 font-mono">{lat.toFixed(5)}, {lng.toFixed(5)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-white hover:bg-white/[0.06] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
              Place Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My Favorite Cafe..."
              className="w-full px-4 py-2.5 rounded-xl input-premium text-sm font-medium"
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
              <Tag className="w-3 h-3" /> Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => { setCategory(cat.id); setColor(cat.defaultColor); }}
                  className={`py-2 px-2.5 rounded-xl text-[11px] font-semibold border text-center transition-all flex items-center justify-center gap-1.5 ${
                    category === cat.id
                      ? 'border-blue-500/40 bg-blue-500/15 text-blue-300'
                      : 'border-white/[0.06] bg-white/[0.03] text-slate-400 hover:border-white/[0.1] hover:text-slate-200'
                  }`}
                >
                  <span>{cat.emoji}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
              <Palette className="w-3 h-3" /> Pin Color
            </label>
            <div className="flex items-center gap-2.5">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    color === c ? 'scale-110' : 'opacity-60 hover:opacity-100 hover:scale-105'
                  }`}
                  style={{
                    backgroundColor: c,
                    boxShadow: color === c ? `0 0 16px ${c}60, 0 0 0 2px ${c}40` : 'none',
                  }}
                >
                  {color === c && <Check className="w-4 h-4 text-white drop-shadow" />}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
              <FileText className="w-3 h-3" /> Notes (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Opening hours, parking tips, memories..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl input-premium text-xs resize-none leading-relaxed"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.05] transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white btn-primary"
            >
              {initialData ? 'Update Pin' : 'Save Pin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
