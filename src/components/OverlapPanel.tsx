import React, { useState } from 'react';
import { Compass, MapPin, Sparkles, Plus, Trash2 } from './Icons';
import * as turf from '@turf/turf';
import type { SavedMarker } from '../types/map';

interface OverlapPanelProps {
  savedMarkers: SavedMarker[];
  onCalculateIntersection: (resultPolygon: any, buffers: any[]) => void;
  onClearIntersection: () => void;
  hasIntersection: boolean;
}

interface OverlapPoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  radiusKm: number;
}

export const OverlapPanel: React.FC<OverlapPanelProps> = ({
  savedMarkers,
  onCalculateIntersection,
  onClearIntersection,
  hasIntersection,
}) => {
  const [points, setPoints] = useState<OverlapPoint[]>([]);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string>('');
  const [defaultRadius, setDefaultRadius] = useState<number>(5);

  const handleAddMarker = () => {
    if (!selectedMarkerId) return;
    const found = savedMarkers.find((m) => m.id === selectedMarkerId);
    if (!found) return;

    if (points.some((p) => p.id === found.id)) return;

    setPoints([...points, { id: found.id, name: found.name, lat: found.lat, lng: found.lng, radiusKm: defaultRadius }]);
    setSelectedMarkerId('');
  };

  const handleRemovePoint = (id: string) => {
    setPoints(points.filter((p) => p.id !== id));
  };

  const handleRadiusChange = (id: string, newRadius: number) => {
    setPoints(points.map((p) => (p.id === id ? { ...p, radiusKm: newRadius } : p)));
  };

  const handleCalculate = () => {
    if (points.length < 2) return;

    // 1. Create individual buffer polygons around each point
    const buffers = points.map((p) => {
      const pt = turf.point([p.lng, p.lat]);
      return {
        id: p.id,
        name: p.name,
        polygon: turf.buffer(pt, p.radiusKm, { units: 'kilometers', steps: 64 }),
      };
    });

    // 2. Compute intersection of all buffer polygons sequentially using Turf.js
    let currentIntersection: any = buffers[0].polygon;

    for (let i = 1; i < buffers.length; i++) {
      try {
        const nextIntersect = turf.intersect(
          turf.featureCollection([currentIntersection, buffers[i].polygon])
        );
        if (nextIntersect) {
          currentIntersection = nextIntersect;
        } else {
          currentIntersection = null; // No overlap
          break;
        }
      } catch (err) {
        console.error('Intersection calculation error:', err);
        currentIntersection = null;
        break;
      }
    }

    onCalculateIntersection(currentIntersection, buffers.map((b) => b.polygon));
  };

  return (
    <div className="p-4 space-y-4 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-white/[0.04]">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center">
          <Compass className="w-3.5 h-3.5 text-violet-400" />
        </div>
        <div>
          <h2 className="text-xs font-bold text-white flex items-center gap-1.5">
            Living Spot & Meeting Finder
            <span className="text-[9px] font-semibold tracking-widest uppercase bg-violet-500/15 text-violet-400 px-2 py-0.5 rounded-full border border-violet-500/20">
              EXCLUSIVE
            </span>
          </h2>
          <p className="text-[10px] text-slate-500">Multi-point radius overlap calculator</p>
        </div>
      </div>

      <div className="p-3 rounded-2xl bg-white/[0.03] border border-white/[0.05] text-[11px] text-slate-400 leading-relaxed">
        Find the perfect location (for living or meeting) that falls within a set radius of 2 or more places (e.g. Work + Partner's Work).
      </div>

      {/* Select Saved Marker */}
      <div className="space-y-2">
        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Add Point from Saved Places
        </label>
        <div className="flex items-center gap-2">
          <select
            value={selectedMarkerId}
            onChange={(e) => setSelectedMarkerId(e.target.value)}
            className="flex-1 px-3 py-2 rounded-xl input-premium text-xs font-medium"
          >
            <option value="">Select a saved place pin...</option>
            {savedMarkers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.category})
              </option>
            ))}
          </select>
          <button
            onClick={handleAddMarker}
            disabled={!selectedMarkerId}
            className="px-3 py-2 btn-primary text-white rounded-xl text-xs font-bold flex items-center gap-1 shrink-0 disabled:opacity-40"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
      </div>

      {/* Selected Points List */}
      <div className="space-y-2">
        <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
          Selected Target Locations ({points.length})
        </label>

        {points.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 bg-white/[0.02] border border-white/[0.04] rounded-2xl">
            Select at least 2 saved places above to find their overlapping intersection zone.
          </div>
        ) : (
          points.map((pt) => (
            <div
              key={pt.id}
              className="glass-card rounded-2xl p-3 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-xl bg-violet-500/15 flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-violet-400" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-white truncate">{pt.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-slate-500">Max distance:</span>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={pt.radiusKm}
                      onChange={(e) => handleRadiusChange(pt.id, parseFloat(e.target.value) || 1)}
                      className="w-14 px-1.5 py-0.5 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-violet-300 text-center"
                    />
                    <span className="text-[10px] text-slate-500">km</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleRemovePoint(pt.id)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-all shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-1">
        {hasIntersection && (
          <button
            onClick={onClearIntersection}
            className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-all"
          >
            Clear Zone
          </button>
        )}
        <button
          onClick={handleCalculate}
          disabled={points.length < 2}
          className="flex-1 py-2.5 btn-primary text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 disabled:opacity-40"
        >
          <Sparkles className="w-3.5 h-3.5 text-violet-300" />
          Compute Overlap Zone
        </button>
      </div>
    </div>
  );
};
